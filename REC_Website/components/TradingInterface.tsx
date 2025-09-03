import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Shield, FileCheck, Calculator, Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "./AuthContext";
import apiService from "../services/api";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);
  const [orderBookLoading, setOrderBookLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);
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
            fetchHoldings()
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

  const handleBuyOrder = async () => {
    if (!user?.permissions.canTrade) {
      toast.error('You do not have trading permissions');
      return;
    }

    if (!buyQuantity || !buyPrice || !buyEnergyType || !buyFacility || !buyVintage || !buyPurpose || !buyEmirate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setPlacingOrder(true);
      const response = await apiService.createBuyOrder({
        facilityName: buyFacility,
        facilityId: `${buyFacility.toLowerCase().replace(/\s+/g, '-')}-${buyVintage}`,
        energyType: buyEnergyType,
        vintage: parseInt(buyVintage),
        quantity: parseFloat(buyQuantity),
        price: parseFloat(buyPrice),
        emirate: buyEmirate,
        purpose: buyPurpose,
        certificationStandard: 'I-REC'
      });

      if (response.success) {
        toast.success(`Buy order placed successfully! ${response.data.matchedQuantity > 0 ? `${response.data.matchedQuantity} I-RECs matched immediately.` : ''}`);
        
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
          fetchHoldings(false) // Don't show loading for background refresh
        ]);
      } else {
        toast.error(response.message || 'Failed to place buy order');
      }
    } catch (error: any) {
      console.error('Error placing buy order:', error);
      toast.error(error.message || 'Failed to place buy order');
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
          fetchHoldings(false) // Don't show loading for background refresh
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Trade I-RECs</span>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>KYC Verified</span>
            </Badge>
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
                    <SelectValue placeholder="Select energy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solar">Solar PV</SelectItem>
                    <SelectItem value="wind">Wind</SelectItem>
                    <SelectItem value="nuclear">Nuclear</SelectItem>
                    <SelectItem value="csp">Concentrated Solar Power</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buy-facility">UAE Facility</Label>
                <Select value={buyFacility} onValueChange={setBuyFacility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select certified facility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maktoum">Mohammed bin Rashid Al Maktoum Solar Park</SelectItem>
                    <SelectItem value="dhafra">Al Dhafra Wind Farm</SelectItem>
                    <SelectItem value="barakah">Barakah Nuclear Power Plant</SelectItem>
                    <SelectItem value="dubai-solar">Dubai Solar Park</SelectItem>
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
                    <SelectValue placeholder="Select vintage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
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
                    <SelectValue placeholder="Select emirate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                    <SelectItem value="Dubai">Dubai</SelectItem>
                    <SelectItem value="Sharjah">Sharjah</SelectItem>
                    <SelectItem value="Ajman">Ajman</SelectItem>
                    <SelectItem value="Fujairah">Fujairah</SelectItem>
                    <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                    <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
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
              
              <Button 
                onClick={handleBuyOrder}
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
              
              <Button 
                onClick={handleSellOrder}
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
              onClick={fetchOrderBook}
              disabled={orderBookLoading}
            >
              {orderBookLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orderBookLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-rectify-green" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-rectify-green flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Buy Orders (AED/MWh)</span>
                  <Badge variant="secondary">{orderBook.buyOrders.length}</Badge>
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {orderBook.buyOrders.length > 0 ? (
                    orderBook.buyOrders.map((order) => (
                      <div key={order._id} className="flex justify-between items-center text-sm p-2 bg-green-50 rounded border">
                        <div className="flex items-center gap-2">
                          <span className="text-rectify-green font-medium">AED {order.price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">
                            by {order.createdBy}
                          </span>
                        </div>
                        <div className="text-right">
                          <div>{order.remainingQuantity.toLocaleString()} MWh</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {order.energyType} • {order.emirate}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No buy orders available
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2 text-orange-500 flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4" />
                  <span>Sell Orders (AED/MWh)</span>
                  <Badge variant="secondary">{orderBook.sellOrders.length}</Badge>
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {orderBook.sellOrders.length > 0 ? (
                    orderBook.sellOrders.map((order) => (
                      <div key={order._id} className="flex justify-between items-center text-sm p-2 bg-orange-50 rounded border">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 font-medium">AED {order.price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">
                            by {order.createdBy}
                          </span>
                        </div>
                        <div className="text-right">
                          <div>{order.remainingQuantity.toLocaleString()} MWh</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {order.energyType} • {order.emirate}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No sell orders available
                    </div>
                  )}
                </div>
              </div>
              
              {orderBook.buyOrders.length === 0 && orderBook.sellOrders.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active orders in the market</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Be the first to place an order and start trading!
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}