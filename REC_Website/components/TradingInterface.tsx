import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Shield, FileCheck, Calculator } from "lucide-react";

export function TradingInterface() {
  // Buy order state
  const [buyQuantity, setBuyQuantity] = useState<string>("");
  const [buyPrice, setBuyPrice] = useState<string>("");
  const [buyEnergyType, setBuyEnergyType] = useState<string>("");
  const [buyFacility, setBuyFacility] = useState<string>("");
  const [buyVintage, setBuyVintage] = useState<string>("");
  const [buyPurpose, setBuyPurpose] = useState<string>("");

  // Sell order state
  const [sellQuantity, setSellQuantity] = useState<string>("");
  const [sellPrice, setSellPrice] = useState<string>("");
  const [sellHolding, setSellHolding] = useState<string>("");

  // Constants
  const PLATFORM_FEE_RATE = 0.02; // 2%
  const BLOCKCHAIN_FEE = 5.00; // Fixed AED 5.00
  const AED_TO_USD_RATE = 0.272; // Current approximate rate

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

  // Handle form submissions
  const handleBuyOrder = () => {
    if (!buyQuantity || !buyPrice || !buyEnergyType || !buyFacility) {
      alert("Please fill in all required fields");
      return;
    }
    
    alert(`Buy Order Placed!\nQuantity: ${buyQuantity} MWh\nPrice: AED ${buyPrice}/MWh\nTotal: AED ${formatAED(buyCalculations.totalAED)}`);
    
    // Reset form
    setBuyQuantity("");
    setBuyPrice("");
    setBuyEnergyType("");
    setBuyFacility("");
    setBuyVintage("");
    setBuyPurpose("");
  };

  const handleSellOrder = () => {
    if (!sellQuantity || !sellPrice || !sellHolding) {
      alert("Please fill in all required fields");
      return;
    }
    
    alert(`Sell Order Placed!\nQuantity: ${sellQuantity} MWh\nPrice: AED ${sellPrice}/MWh\nTotal: AED ${formatAED(sellCalculations.totalAED)}`);
    
    // Reset form
    setSellQuantity("");
    setSellPrice("");
    setSellHolding("");
  };

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
                    <SelectItem value="scope2">Scope 2 Compliance</SelectItem>
                    <SelectItem value="voluntary">Voluntary Commitment</SelectItem>
                    <SelectItem value="esg">ESG Reporting</SelectItem>
                    <SelectItem value="netzero">Net Zero Strategy</SelectItem>
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
                disabled={!buyQuantity || !buyPrice || !buyEnergyType || !buyFacility}
                className="w-full bg-rectify-green hover:bg-rectify-green-dark text-white disabled:opacity-50"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Place Buy Order
              </Button>
            </TabsContent>
            
            <TabsContent value="sell" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="sell-holdings">Select from Portfolio</Label>
                <Select value={sellHolding} onValueChange={setSellHolding}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select I-REC to sell" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solar-maktoum-2024">Solar - Maktoum Park 2024 (450 MWh)</SelectItem>
                    <SelectItem value="wind-dhafra-2024">Wind - Al Dhafra 2024 (280 MWh)</SelectItem>
                    <SelectItem value="nuclear-barakah-2024">Nuclear - Barakah 2024 (820 MWh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
                disabled={!sellQuantity || !sellPrice || !sellHolding}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
              >
                Place Sell Order
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Order Book</span>
            <Calculator className="h-4 w-4" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-rectify-green flex items-center space-x-2">
                <span>Buy Orders (AED/MWh)</span>
              </h4>
              <div className="space-y-1">
                {[
                  { price: 167.25, quantity: 150, facility: "Maktoum" },
                  { price: 167.20, quantity: 200, facility: "Dubai Solar" },
                  { price: 167.15, quantity: 100, facility: "Maktoum" },
                  { price: 167.10, quantity: 300, facility: "Al Dhafra" }
                ].map((order, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-rectify-green">AED {order.price}</span>
                    <span>{order.quantity} MWh</span>
                    <span className="text-muted-foreground text-xs">{order.facility}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2 text-orange-500">
                Sell Orders (AED/MWh)
              </h4>
              <div className="space-y-1">
                {[
                  { price: 167.35, quantity: 120, facility: "Barakah" },
                  { price: 167.40, quantity: 180, facility: "Maktoum" },
                  { price: 167.45, quantity: 250, facility: "Al Dhafra" },
                  { price: 167.50, quantity: 90, facility: "Dubai Solar" }
                ].map((order, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-orange-500">AED {order.price}</span>
                    <span>{order.quantity} MWh</span>
                    <span className="text-muted-foreground text-xs">{order.facility}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}