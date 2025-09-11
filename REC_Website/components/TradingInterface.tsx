import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Shield, FileCheck, Calculator, Loader2, AlertCircle, TrendingUp, TrendingDown, Wifi, Users, Activity } from "lucide-react";
import { useAuth } from "./AuthContext";
import apiService from "../services/api";
import { toast } from "sonner";
import BlockchainMonitor from "./BlockchainMonitor";

interface Order {
  _id: string;
  orderType: 'buy' | 'sell';
  facilityName: string;
  energyType: string;
  vintage: number;
  quantity: number;
  remainingQuantity: number;
  price: number;
  emirate: string;
  createdBy: string;
  status: string;
  userId: {
    firstName: string;
    lastName: string;
    company: string;
  };
}

interface OrderBook {
  buyOrders: Order[];
  sellOrders: Order[];
  networkStats?: {
    totalActiveOrders: number;
    totalBuyOrders: number;
    totalSellOrders: number;
    uniqueParticipants: number;
    lastUpdated: string;
  };
}

interface Holding {
  _id: string;
  facilityName: string;
  facilityId: string;
  energyType: string;
  vintage: number;
  quantity: number;
  averagePurchasePrice: number;
  totalValue: number;
  emirate: string;
  certificationStandard: string;
  isLocked: boolean;
}

interface AvailableForBuy {
  facilities: {
    facilityName: string;
    facilityId: string;
    energyType: string;
    vintage: number;
    emirate: string;
    minPrice: number;
    maxPrice: number;
    totalQuantity: number;
    orderCount: number;
  }[];
  energyTypes: string[];
  emirates: string[];
  vintages: number[];
  totalSellOrders: number;
}

export function TradingInterface() {
  const { user } = useAuth();
  
  // Buy order state
  const [buyQuantity, setBuyQuantity] = useState<string>("");
  const [buyPrice, setBuyPrice] = useState<string>("");
  const [buyEnergyType, setBuyEnergyType] = useState<string>("");
  const [buyFacility, setBuyFacility] = useState<string>("");
  const [buyVintage, setBuyVintage] = useState<string>("");
  const [buyPurpose, setBuyPurpose] = useState<string>("");
  const [buyEmirate, setBuyEmirate] = useState<string>("");

  // Sell order state
  const [sellQuantity, setSellQuantity] = useState<string>("");
  const [sellPrice, setSellPrice] = useState<string>("");
  const [sellHolding, setSellHolding] = useState<string>("");

  // Data state
  const [orderBook, setOrderBook] = useState<OrderBook>({ buyOrders: [], sellOrders: [] });
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [availableForBuy, setAvailableForBuy] = useState<AvailableForBuy>({
    facilities: [],
    energyTypes: [],
    emirates: [],
    vintages: [],
    totalSellOrders: 0
  });
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderBookLoading, setOrderBookLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [availableForBuyLoading, setAvailableForBuyLoading] = useState(true);
  const [transactionHistoryLoading, setTransactionHistoryLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmBuyOpen, setConfirmBuyOpen] = useState(false);
  const [confirmSellOpen, setConfirmSellOpen] = useState(false);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);
  const [availableForBuyError, setAvailableForBuyError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Constants
  const PLATFORM_FEE_RATE = 0.02; // 2%
  const BLOCKCHAIN_FEE = 5.00; // Fixed AED 5.00
  const AED_TO_USD_RATE = 0.272; // Current approximate rate

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      const loadInitialData = async () => {
        try {
          await Promise.all([
            fetchOrderBook(),
            fetchHoldings(),
            fetchAvailableForBuy(),
            fetchTransactionHistory()
          ]);
        } catch (error) {
          console.error('Error loading initial data:', error);
        }
      };
      loadInitialData();
    }
  }, [user]);

  const fetchOrderBook = async () => {
    try {
      setOrderBookLoading(true);
      const response = await apiService.getOrderBook(20);
      if (response.success) {
        setOrderBook(response.data);
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
      toast.error('Failed to load order book');
    } finally {
      setOrderBookLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      setTransactionHistoryLoading(true);
      const response = await apiService.getTransactionHistory(20);
      if (response.success) {
        setTransactionHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setTransactionHistoryLoading(false);
    }
  };

  const fetchAvailableForBuy = async (filters?: {
    energyType?: string;
    emirate?: string;
    vintage?: number;
  }) => {
    try {
      setAvailableForBuyLoading(true);
      setAvailableForBuyError(null);
      
      const response = await apiService.getAvailableForBuy(filters);
      if (response.success && response.data) {
        // Ensure data structure is valid
        const data = response.data;
        setAvailableForBuy({
          facilities: Array.isArray(data.facilities) ? data.facilities : [],
          energyTypes: Array.isArray(data.energyTypes) ? data.energyTypes : [],
          emirates: Array.isArray(data.emirates) ? data.emirates : [],
          vintages: Array.isArray(data.vintages) ? data.vintages : [],
          totalSellOrders: typeof data.totalSellOrders === 'number' ? data.totalSellOrders : 0
        });
      } else {
        setAvailableForBuyError(response.message || 'Failed to load available options');
      }
    } catch (error: any) {
      console.error('Error fetching available for buy:', error);
      setAvailableForBuyError(error.message || 'Failed to load available options');
    } finally {
      setAvailableForBuyLoading(false);
    }
  };

  const fetchHoldings = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setHoldingsLoading(true);
      }
      setHoldingsError(null);
      setRetryCount(0);
      
      const response = await apiService.getUserHoldings();
      if (response.success) {
        const tradeableHoldings = response.data.holdings.filter((h: Holding) => !h.isLocked && h.quantity > 0);
        setHoldings(tradeableHoldings);
        
        // If no tradeable holdings and we had a selected holding, clear it
        if (tradeableHoldings.length === 0 && sellHolding && sellHolding !== 'loading' && sellHolding !== 'error' && sellHolding !== 'no-holdings') {
          setSellHolding("");
        } else if (sellHolding && sellHolding !== 'loading' && sellHolding !== 'error' && sellHolding !== 'no-holdings' && !tradeableHoldings.find(h => h._id === sellHolding)) {
          // If the selected holding is no longer available, clear it
          setSellHolding("");
        }
      } else {
        setHoldingsError(response.message || 'Failed to load holdings');
        toast.error('Failed to load holdings data');
      }
    } catch (error: any) {
      console.error('Error fetching holdings:', error);
      setHoldingsError(error.message || 'Failed to load holdings');
      setRetryCount(prev => prev + 1);
      
      // Only show toast for first error, not retries
      if (retryCount === 0) {
        toast.error('Failed to load holdings data');
      }
    } finally {
      if (showLoading) {
        setHoldingsLoading(false);
      }
    }
  }, [sellHolding]);

  // Refresh available options when buy form selections change
  useEffect(() => {
    if (user && (buyEnergyType || buyEmirate || buyVintage)) {
      const filters: any = {};
      if (buyEnergyType) filters.energyType = buyEnergyType;
      if (buyEmirate) filters.emirate = buyEmirate;
      if (buyVintage) filters.vintage = parseInt(buyVintage);
      
      fetchAvailableForBuy(filters);
    }
  }, [buyEnergyType, buyEmirate, buyVintage, user]);

  // Auto-populate form fields when facility is selected
  useEffect(() => {
    if (buyFacility && availableForBuy.facilities.length > 0) {
      const selectedFacility = availableForBuy.facilities.find(f => f.facilityId === buyFacility);
      if (selectedFacility) {
        // Auto-populate energy type, emirate, and vintage if not already set
        if (!buyEnergyType) setBuyEnergyType(selectedFacility.energyType);
        if (!buyEmirate) setBuyEmirate(selectedFacility.emirate);
        if (!buyVintage) setBuyVintage(selectedFacility.vintage.toString());
        
        // Set suggested price to the minimum available price
        if (!buyPrice) setBuyPrice(selectedFacility.minPrice.toString());
      }
    }
  }, [buyFacility, availableForBuy.facilities, buyEnergyType, buyEmirate, buyVintage]);

  const handleBuyOrder = async () => {
    console.log('🛒 Buy order button clicked');
    console.log('👤 User:', user);
    console.log('🔑 User permissions:', user?.permissions);
    
    if (!user) {
      toast.error('Please log in to place orders');
      return;
    }

    if (!user?.permissions?.canTrade) {
      toast.error('You do not have trading permissions');
      return;
    }

    if (!buyQuantity || !buyPrice || !buyEnergyType || !buyFacility || !buyVintage || !buyPurpose || !buyEmirate) {
      toast.error('Please fill in all required fields');
      console.log('❌ Missing fields:', { buyQuantity, buyPrice, buyEnergyType, buyFacility, buyVintage, buyPurpose, buyEmirate });
      return;
    }

    // Check if selected facility is still available
    const selectedFacility = availableForBuy.facilities.find(f => f.facilityId === buyFacility);
    if (!selectedFacility) {
      toast.error('Selected facility is no longer available. Please refresh and try again.');
      await fetchAvailableForBuy();
      return;
    }

    try {
      setPlacingOrder(true);
      console.log('📤 Sending buy order request...');
      
      const orderData = {
        facilityName: selectedFacility.facilityName,
        facilityId: selectedFacility.facilityId,
        energyType: selectedFacility.energyType,
        vintage: selectedFacility.vintage,
        quantity: parseFloat(buyQuantity),
        price: parseFloat(buyPrice),
        emirate: selectedFacility.emirate,
        purpose: buyPurpose,
        certificationStandard: 'I-REC'
      };
      
      console.log('📋 Order data:', orderData);
      
      const response = await apiService.createBuyOrder(orderData);
      console.log('📥 API response:', response);

      if (response.success) {
        toast.success(`Buy order placed successfully in the network! ${response.data.matchedQuantity > 0 ? `${response.data.matchedQuantity} I-RECs matched immediately with other network participants.` : 'Your order is now visible to all network participants.'}`);
        
        // Reset form
        setBuyQuantity("");
        setBuyPrice("");
        setBuyEnergyType("");
        setBuyFacility("");
        setBuyVintage("");
        setBuyPurpose("");
        setBuyEmirate("");
        
        // Refresh data
        await Promise.all([
          fetchOrderBook(),
          fetchHoldings(false), // Don't show loading for background refresh
          fetchAvailableForBuy(), // Refresh available options
          fetchTransactionHistory() // Refresh transaction history
        ]);
      } else {
        toast.error(response.message || 'Failed to place buy order');
      }
    } catch (error: any) {
      console.error('❌ Error placing buy order:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Failed to place buy order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSellOrder = async () => {
    if (!user?.permissions.canTrade) {
      toast.error('You do not have trading permissions');
      return;
    }

    if (!sellQuantity || !sellPrice || !sellHolding || sellHolding === 'loading' || sellHolding === 'error' || sellHolding === 'no-holdings') {
      toast.error('Please fill in all required fields');
      return;
    }

    const holding = holdings.find(h => h._id === sellHolding);
    if (!holding) {
      toast.error('Selected holding not found');
      return;
    }

    if (parseFloat(sellQuantity) > holding.quantity) {
      toast.error('Sell quantity exceeds available holding');
      return;
    }

    try {
      setPlacingOrder(true);
      
      const orderData = {
        holdingId: sellHolding,
        quantity: parseFloat(sellQuantity),
        price: parseFloat(sellPrice)
      };
      
      const response = await apiService.createSellOrder(orderData);

      if (response.success) {
        toast.success(`Sell order placed successfully! ${response.data.matchedQuantity > 0 ? `${response.data.matchedQuantity} I-RECs matched immediately.` : ''}`);
        
        // Reset form
        setSellQuantity("");
        setSellPrice("");
        setSellHolding("");
        
        // Refresh data
        await Promise.all([
          fetchOrderBook(),
          fetchHoldings(false), // Don't show loading for background refresh
          fetchAvailableForBuy(), // Refresh available options
          fetchTransactionHistory() // Refresh transaction history
        ]);
      } else {
        toast.error(response.message || 'Failed to place sell order');
      }
    } catch (error: any) {
      console.error('Error placing sell order:', error);
      toast.error(error.message || 'Failed to place sell order');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Buy order calculations
  const buyCalculations = useMemo(() => {
    const quantity = parseFloat(buyQuantity) || 0;
    const price = parseFloat(buyPrice) || 0;
    const subtotal = quantity * price;
    const platformFee = subtotal * PLATFORM_FEE_RATE;
    const blockchainFee = quantity > 0 ? BLOCKCHAIN_FEE : 0;
    const totalAED = subtotal + platformFee + blockchainFee;
    const totalUSD = totalAED * AED_TO_USD_RATE;

    return {
      subtotal,
      platformFee,
      blockchainFee,
      totalAED,
      totalUSD
    };
  }, [buyQuantity, buyPrice]);

  // Sell order calculations
  const sellCalculations = useMemo(() => {
    const quantity = parseFloat(sellQuantity) || 0;
    const price = parseFloat(sellPrice) || 0;
    const subtotal = quantity * price;
    const platformFee = subtotal * PLATFORM_FEE_RATE;
    const totalAED = subtotal - platformFee; // Seller pays the fee
    const totalUSD = totalAED * AED_TO_USD_RATE;

    return {
      subtotal,
      platformFee,
      totalAED,
      totalUSD
    };
  }, [sellQuantity, sellPrice]);

  // Format currency
  const formatAED = (amount: number) => amount.toFixed(2);
  const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Main Trading Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <span>Network Trading</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy I-RECs</TabsTrigger>
              <TabsTrigger value="sell">Sell I-RECs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="space-y-4 mt-4">
              
              <div className="space-y-2">
                <Label htmlFor="buy-energy-type">Energy Source</Label>
                <Select value={buyEnergyType} onValueChange={setBuyEnergyType}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      availableForBuyLoading 
                        ? "Loading energy types..." 
                        : availableForBuyError 
                          ? "Error loading options" 
                          : "Select energy type"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForBuyLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading energy types...</span>
                        </div>
                      </SelectItem>
                    ) : availableForBuyError ? (
                      <SelectItem value="error" disabled>
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span>Error loading options</span>
                        </div>
                      </SelectItem>
                    ) : availableForBuy.energyTypes.length > 0 ? (
                      availableForBuy.energyTypes.map((energyType) => (
                        <SelectItem key={energyType} value={energyType}>
                          {energyType.charAt(0).toUpperCase() + energyType.slice(1)} 
                          {energyType === 'solar' ? ' PV' : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-options" disabled>
                        <div className="text-center py-2">
                          <div className="text-sm text-muted-foreground">
                            No energy types available
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            No sell orders found in the market
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {availableForBuyError && (
                  <div className="flex items-center space-x-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{availableForBuyError}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAvailableForBuy()}
                      className="ml-auto"
                      disabled={availableForBuyLoading}
                    >
                      {availableForBuyLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        'Retry'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="buy-facility">UAE Facility</Label>
                <Select value={buyFacility} onValueChange={setBuyFacility}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      availableForBuyLoading 
                        ? "Loading facilities..." 
                        : availableForBuyError 
                          ? "Error loading options" 
                          : "Select certified facility"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForBuyLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading facilities...</span>
                        </div>
                      </SelectItem>
                    ) : availableForBuyError ? (
                      <SelectItem value="error" disabled>
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span>Error loading options</span>
                        </div>
                      </SelectItem>
                    ) : availableForBuy.facilities.length > 0 ? (
                      availableForBuy.facilities
                        .filter(facility => 
                          !buyEnergyType || facility.energyType === buyEnergyType
                        )
                        .map((facility) => (
                          <SelectItem key={facility.facilityId} value={facility.facilityId}>
                            <div className="flex flex-col">
                              <span>{facility.facilityName}</span>
                              <span className="text-xs text-muted-foreground">
                                {facility.energyType.charAt(0).toUpperCase() + facility.energyType.slice(1)} • {facility.vintage} • 
                                AED {facility.minPrice.toFixed(2)}-{facility.maxPrice.toFixed(2)}/MWh • 
                                {facility.totalQuantity.toLocaleString()} MWh available
                              </span>
                            </div>
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-options" disabled>
                        <div className="text-center py-2">
                          <div className="text-sm text-muted-foreground">
                            No facilities available
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {buyEnergyType ? `No ${buyEnergyType} facilities found` : 'No sell orders found in the market'}
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buy-quantity">Quantity (MWh)</Label>
                  <Input 
                    id="buy-quantity" 
                    placeholder="0" 
                    type="number" 
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buy-price">Price (AED/MWh)</Label>
                  <Input 
                    id="buy-price" 
                    placeholder="0.00" 
                    type="number" 
                    step="0.01"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buy-vintage">Vintage Year</Label>
                <Select value={buyVintage} onValueChange={setBuyVintage}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      availableForBuyLoading 
                        ? "Loading vintages..." 
                        : availableForBuyError 
                          ? "Error loading options" 
                          : "Select vintage"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForBuyLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading vintages...</span>
                        </div>
                      </SelectItem>
                    ) : availableForBuyError ? (
                      <SelectItem value="error" disabled>
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span>Error loading options</span>
                        </div>
                      </SelectItem>
                    ) : availableForBuy.vintages.length > 0 ? (
                      availableForBuy.vintages
                        .filter(vintage => 
                          !buyEnergyType || availableForBuy.facilities.some(f => f.energyType === buyEnergyType && f.vintage === vintage)
                        )
                        .map((vintage) => (
                          <SelectItem key={vintage} value={vintage.toString()}>
                            {vintage}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-options" disabled>
                        <div className="text-center py-2">
                          <div className="text-sm text-muted-foreground">
                            No vintages available
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            No sell orders found in the market
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buy-purpose">Purpose</Label>
                <Select value={buyPurpose} onValueChange={setBuyPurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="voluntary">Voluntary</SelectItem>
                    <SelectItem value="resale">Resale</SelectItem>
                    <SelectItem value="offset">Offset</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buy-emirate">Emirate</Label>
                <Select value={buyEmirate} onValueChange={setBuyEmirate}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      availableForBuyLoading 
                        ? "Loading emirates..." 
                        : availableForBuyError 
                          ? "Error loading options" 
                          : "Select emirate"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForBuyLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading emirates...</span>
                        </div>
                      </SelectItem>
                    ) : availableForBuyError ? (
                      <SelectItem value="error" disabled>
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span>Error loading options</span>
                        </div>
                      </SelectItem>
                    ) : availableForBuy.emirates.length > 0 ? (
                      availableForBuy.emirates
                        .filter(emirate => 
                          !buyEnergyType || availableForBuy.facilities.some(f => f.energyType === buyEnergyType && f.emirate === emirate)
                        )
                        .map((emirate) => (
                          <SelectItem key={emirate} value={emirate}>
                            {emirate}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-options" disabled>
                        <div className="text-center py-2">
                          <div className="text-sm text-muted-foreground">
                            No emirates available
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            No sell orders found in the market
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal (AED):</span>
                  <span className="font-medium">{formatAED(buyCalculations.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (2%):</span>
                  <span className="font-medium">{formatAED(buyCalculations.platformFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Blockchain Verification:</span>
                  <span className="font-medium">{formatAED(buyCalculations.blockchainFee)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total (AED):</span>
                  <span className="text-rectify-green">{formatAED(buyCalculations.totalAED)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total (USD):</span>
                  <span>{formatUSD(buyCalculations.totalUSD)}</span>
                </div>
              </div>
              
              {(() => {
                const requiredAED = buyCalculations.totalAED;
                const availableAED = (user as any)?.cashBalance ?? 0;
                const enough = availableAED >= requiredAED;
                return (
                  <AlertDialog open={confirmBuyOpen} onOpenChange={setConfirmBuyOpen}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        disabled={!buyQuantity || !buyPrice || !buyEnergyType || !buyFacility || !buyVintage || !buyPurpose || !buyEmirate || placingOrder}
                        className="w-full bg-rectify-green hover:bg-rectify-green-dark text-white disabled:opacity-50"
                      >
                        {placingOrder ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          <>
                            <FileCheck className="h-4 w-4 mr-2" />
                            Place Buy Order
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Buy Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          You are buying {buyQuantity} MWh at AED {buyPrice}/MWh. Total including fees: AED {formatAED(requiredAED)}.
                          {!enough && (
                            <div className="text-red-600 mt-2">
                              Insufficient funds. Required AED {formatAED(requiredAED)}, Available AED {formatAED(availableAED)}.
                            </div>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={!enough} onClick={() => handleBuyOrder()}>
                          {enough ? 'Confirm' : 'Add Funds'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                );
              })()}
            </TabsContent>
            
            <TabsContent value="sell" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sell-holdings">Select from Portfolio</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchHoldings()}
                    disabled={holdingsLoading}
                    className="h-6 px-2 text-xs"
                  >
                    {holdingsLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                </div>
                <Select 
                  value={sellHolding} 
                  onValueChange={setSellHolding}
                  disabled={holdingsLoading || placingOrder}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        holdingsLoading 
                          ? "Loading holdings..." 
                          : holdingsError 
                            ? "Error loading holdings" 
                            : "Select I-REC to sell"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {holdingsLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading holdings...</span>
                        </div>
                      </SelectItem>
                    ) : holdingsError ? (
                      <SelectItem value="error" disabled>
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span>Error loading holdings</span>
                        </div>
                      </SelectItem>
                    ) : holdings.length > 0 ? (
                      holdings.map((holding) => (
                        <SelectItem key={holding._id} value={holding._id}>
                          {holding.energyType.charAt(0).toUpperCase() + holding.energyType.slice(1)} - {holding.facilityName} {holding.vintage} ({holding.quantity.toLocaleString()} MWh)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-holdings" disabled>
                        <div className="text-center py-2">
                          <div className="text-sm text-muted-foreground">
                            No tradeable holdings available
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Holdings may be locked or have zero quantity
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {holdingsError && (
                  <div className="flex items-center space-x-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{holdingsError}</span>
                    {retryCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        (Attempt {retryCount + 1})
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchHoldings()}
                      className="ml-auto"
                      disabled={holdingsLoading}
                    >
                      {holdingsLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        'Retry'
                      )}
                    </Button>
                  </div>
                )}
              </div>
              
              {sellHolding && sellHolding !== 'loading' && sellHolding !== 'error' && sellHolding !== 'no-holdings' && holdings.find(h => h._id === sellHolding) && (
                <div className="bg-rectify-accent p-3 rounded-lg border border-rectify-border">
                  <div className="text-sm space-y-1">
                    <div className="font-medium">Holding Details:</div>
                    <div className="text-rectify-green-dark">
                      Available: {holdings.find(h => h._id === sellHolding)?.quantity.toLocaleString()} MWh
                    </div>
                    <div className="text-rectify-green-dark">
                      Avg. Purchase Price: AED {holdings.find(h => h._id === sellHolding)?.averagePurchasePrice.toFixed(2)}
                    </div>
                    <div className="text-rectify-green-dark">
                      Location: {holdings.find(h => h._id === sellHolding)?.emirate}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sell-quantity">Quantity (MWh)</Label>
                  <Input 
                    id="sell-quantity" 
                    placeholder="0" 
                    type="number"
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sell-price">Price (AED/MWh)</Label>
                  <Input 
                    id="sell-price" 
                    placeholder="0.00" 
                    type="number" 
                    step="0.01"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-rectify-blue-light p-3 rounded-lg border border-rectify-border">
                <div className="flex items-center space-x-2 text-sm text-rectify-blue-dark">
                  <Shield className="h-4 w-4" />
                  <span>Auto-retirement option available for corporate buyers</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Amount (AED):</span>
                  <span className="font-medium">{formatAED(sellCalculations.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (2%):</span>
                  <span className="font-medium text-orange-600">-{formatAED(sellCalculations.platformFee)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Net Total (AED):</span>
                  <span className="text-rectify-green">{formatAED(sellCalculations.totalAED)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Net Total (USD):</span>
                  <span>{formatUSD(sellCalculations.totalUSD)}</span>
                </div>
              </div>
              
              <AlertDialog open={confirmSellOpen} onOpenChange={setConfirmSellOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={!sellQuantity || !sellPrice || !sellHolding || sellHolding === 'loading' || sellHolding === 'error' || sellHolding === 'no-holdings' || placingOrder || holdingsLoading || holdingsError}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                  >
                    {placingOrder ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Sell Order'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Sell Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to sell {sellQuantity} MWh at AED {sellPrice}/MWh.
                      Net after fees: AED {formatAED(sellCalculations.totalAED)}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSellOrder()}>Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Order Book</span>
              <Calculator className="h-4 w-4" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchOrderBook();
                fetchTransactionHistory();
              }}
              disabled={orderBookLoading || transactionHistoryLoading}
            >
              {(orderBookLoading || transactionHistoryLoading) ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Live Orders</TabsTrigger>
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="space-y-4 mt-4">
          {orderBookLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-rectify-green" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Network Statistics */}
              {orderBook.networkStats && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <Activity className="h-5 w-5 text-blue-600 mb-1" />
                      <div className="text-2xl font-bold text-blue-600">{orderBook.networkStats.totalActiveOrders}</div>
                      <div className="text-xs text-muted-foreground">Active Orders</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <TrendingUp className="h-5 w-5 text-green-600 mb-1" />
                      <div className="text-2xl font-bold text-green-600">{orderBook.networkStats.totalBuyOrders}</div>
                      <div className="text-xs text-muted-foreground">Buy Orders</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <TrendingDown className="h-5 w-5 text-orange-600 mb-1" />
                      <div className="text-2xl font-bold text-orange-600">{orderBook.networkStats.totalSellOrders}</div>
                      <div className="text-xs text-muted-foreground">Sell Orders</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Users className="h-5 w-5 text-purple-600 mb-1" />
                      <div className="text-2xl font-bold text-purple-600">{orderBook.networkStats.uniqueParticipants}</div>
                      <div className="text-xs text-muted-foreground">Participants</div>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(orderBook.networkStats.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2 text-rectify-green flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Pending Buy Orders (AED/MWh)</span>
                  <Badge variant="secondary">{orderBook.buyOrders.length}</Badge>
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {orderBook.buyOrders.length > 0 ? (
                    orderBook.buyOrders.map((order) => (
                      <div key={order._id} className="flex justify-between items-center text-sm p-3 bg-green-50 rounded border border-green-200 hover:bg-green-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-rectify-green font-semibold">AED {order.price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">
                            by {order.createdBy}
                          </span>

                        </div>
                        <div className="text-right">
                          <div className="font-medium">{order.remainingQuantity.toLocaleString()} MWh</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {order.energyType} • {order.emirate}
                          </div>

                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="text-sm">No pending buy orders in network</div>
                      <div className="text-xs mt-1">Place a buy order to start trading</div>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2 text-orange-500 flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4" />
                  <span>Pending Sell Orders (AED/MWh)</span>
                  <Badge variant="secondary">{orderBook.sellOrders.length}</Badge>
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {orderBook.sellOrders.length > 0 ? (
                    orderBook.sellOrders.map((order) => (
                      <div key={order._id} className="flex justify-between items-center text-sm p-3 bg-orange-50 rounded border border-orange-200 hover:bg-orange-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 font-semibold">AED {order.price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">
                            by {order.createdBy}
                          </span>

                        </div>
                        <div className="text-right">
                          <div className="font-medium">{order.remainingQuantity.toLocaleString()} MWh</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {order.energyType} • {order.emirate}
                          </div>

                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="text-sm">No pending sell orders in network</div>
                      <div className="text-xs mt-1">Place a sell order to start trading</div>
                    </div>
                  )}
                </div>
              </div>
              
              {orderBook.buyOrders.length === 0 && orderBook.sellOrders.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active orders in the network</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Be the first to place an order and start network trading!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your orders will be visible to all network participants
                  </p>
                </div>
              )}
            </div>
          )}
            </TabsContent>
            
            <TabsContent value="transactions" className="space-y-4 mt-4">
              {transactionHistoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-rectify-green" />
                </div>
              ) : (
                <div className="space-y-4">
                  {transactionHistory.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {transactionHistory.map((transaction) => {
                        // Determine if current user is the buyer or seller
                        const isCurrentUserBuyer = user && transaction.buyerId._id === user.id;
                        const isCurrentUserSeller = user && transaction.sellerId._id === user.id;
                        
                        // Set colors based on user's role in transaction
                        const bgColor = isCurrentUserBuyer ? 'bg-blue-50' : isCurrentUserSeller ? 'bg-red-50' : 'bg-green-50';
                        const borderColor = isCurrentUserBuyer ? 'border-blue-200' : isCurrentUserSeller ? 'border-red-200' : 'border-green-200';
                        const hoverColor = isCurrentUserBuyer ? 'hover:bg-blue-100' : isCurrentUserSeller ? 'hover:bg-red-100' : 'hover:bg-green-100';
                        const buyerTextColor = isCurrentUserBuyer ? 'text-blue-600' : 'text-green-600';
                        const sellerTextColor = isCurrentUserSeller ? 'text-red-600' : 'text-orange-600';
                        
                        return (
                          <div key={transaction._id} className={`flex justify-between items-center text-sm p-3 ${bgColor} rounded border ${borderColor} ${hoverColor} transition-colors`}>
                            <div className="flex items-center gap-2">
                              <span className={`${buyerTextColor} font-semibold`}>
                                {transaction.buyerId.firstName} {transaction.buyerId.lastName}
                              </span>
                              <span className="text-muted-foreground">bought from</span>
                              <span className={`${sellerTextColor} font-semibold`}>
                                {transaction.sellerId.firstName} {transaction.sellerId.lastName}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{transaction.quantity} MWh</div>
                              <div className="text-xs text-muted-foreground">
                                AED {transaction.pricePerUnit.toFixed(2)}/MWh • {transaction.energyType} • {transaction.emirate}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No completed transactions yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Completed trades will appear here
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>

      {/* Blockchain Monitor */}
      <BlockchainMonitor />
    </div>
  );
}