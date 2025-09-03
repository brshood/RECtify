import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { TrendingUp, TrendingDown, Shield, MapPin, Eye, ShoppingCart, AlertCircle, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function MarketData() {
  const [selectedREC, setSelectedREC] = useState<any>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState("100");
  const [isProcessing, setIsProcessing] = useState(false);

  const marketData = [
    {
      id: "UAE-SOL-001",
      type: "Solar",
      vintage: "2024",
      region: "Abu Dhabi",
      facility: "Mohammed bin Rashid Al Maktoum Solar Park",
      facilityDetails: "World's largest single-site solar park with innovative concentrated solar power technology",
      price: 167.2,
      priceUSD: 45.32,
      change: +2.1,
      volume: "1,250",
      certification: "I-REC",
      available: "5,420",
      verified: true,
      coordinates: "24.5588° N, 55.3047° E",
      capacity: "5,000 MW",
      yearBuilt: "2020",
      technology: "Photovoltaic + CSP",
      carbonOffset: "0.45 tCO₂e/MWh"
    },
    {
      id: "UAE-WIN-002", 
      type: "Wind",
      vintage: "2024",
      region: "Ras Al Khaimah",
      facility: "Al Dhafra Wind Farm",
      facilityDetails: "UAE's first utility-scale wind power project with 62 wind turbines",
      price: 155.8,
      priceUSD: 42.18,
      change: -1.5,
      volume: "2,180",
      certification: "I-REC",
      available: "8,930",
      verified: true,
      coordinates: "24.2048° N, 54.6972° E",
      capacity: "117.5 MW",
      yearBuilt: "2022",
      technology: "Onshore Wind Turbines",
      carbonOffset: "0.42 tCO₂e/MWh"
    },
    {
      id: "UAE-SOL-003",
      type: "Solar",
      vintage: "2024",
      region: "Dubai",
      facility: "Dubai Solar Park Phase V",
      facilityDetails: "Advanced solar installation with energy storage capabilities and smart grid integration",
      price: 165.3,
      priceUSD: 44.77,
      change: +3.2,
      volume: "1,560",
      certification: "I-REC",
      available: "4,120",
      verified: true,
      coordinates: "24.9526° N, 55.1650° E",
      capacity: "900 MW",
      yearBuilt: "2023",
      technology: "Photovoltaic + Storage",
      carbonOffset: "0.46 tCO₂e/MWh"
    },
    {
      id: "UAE-NUC-004",
      type: "Nuclear",
      vintage: "2024",
      region: "Abu Dhabi",
      facility: "Barakah Nuclear Power Plant",
      facilityDetails: "UAE's first nuclear power plant providing clean baseload electricity with advanced safety systems",
      price: 152.5,
      priceUSD: 41.25,
      change: +1.8,
      volume: "3,420",
      certification: "I-REC",
      available: "12,500",
      verified: true,
      coordinates: "24.5244° N, 52.9216° E",
      capacity: "5,600 MW",
      yearBuilt: "2020",
      technology: "APR-1400 Reactors",
      carbonOffset: "0.02 tCO₂e/MWh"
    }
  ];

  const handleBuyClick = (rec: any) => {
    setSelectedREC(rec);
    setShowBuyModal(true);
    setBuyQuantity("100");
  };

  const handleDetailsClick = (rec: any) => {
    setSelectedREC(rec);
    setShowDetailsModal(true);
  };

  const handleBuySubmit = async () => {
    if (!selectedREC || !buyQuantity || parseInt(buyQuantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const quantity = parseInt(buyQuantity);
    const available = parseInt(selectedREC.available.replace(",", ""));
    
    if (quantity > available) {
      toast.error(`Only ${selectedREC.available} MWh available`);
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const totalCostAED = (selectedREC.price * quantity).toFixed(2);
      const totalCostUSD = (selectedREC.priceUSD * quantity).toFixed(2);

      toast.success(
        `Successfully purchased ${quantity} MWh of ${selectedREC.type} I-RECs for AED ${Number(totalCostAED).toLocaleString()}`
      );

      setShowBuyModal(false);
    } catch (error) {
      toast.error("Failed to process purchase. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedREC || !buyQuantity) return { aed: "0.00", usd: "0.00" };
    const quantity = parseInt(buyQuantity) || 0;
    return {
      aed: (selectedREC.price * quantity).toFixed(2),
      usd: (selectedREC.priceUSD * quantity).toFixed(2)
    };
  };

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>UAE I-REC Market</span>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Live prices updated every 5 minutes
            </div>
          </div>
          
          {/* Demo Disclaimer Bar */}
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Demo Data: This market data is for demonstration purposes only and does not reflect real market conditions.
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-200"
                  onClick={() => window.open('https://www.argusmedia.com/en/methodology/key-commodity-prices/argus-international-renewable-energy-certificate-i-recs', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Argus I-REC
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-200"
                  onClick={() => window.open('https://prod-us3.plattslive.com/price-assessments/energy-transition/i-recs', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  S&P Global
                </Button>
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-700">
              For real I-REC market data, visit: <a href="https://www.argusmedia.com/en/methodology/key-commodity-prices/argus-international-renewable-energy-certificate-i-recs" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-800">Argus I-REC Pricing</a> • 
              <a href="https://prod-us3.plattslive.com/price-assessments/energy-transition/i-recs" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-800 ml-1">S&P Global I-RECs</a>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Increase table container size and remove height constraint */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">I-REC ID</TableHead>
                  <TableHead className="min-w-[120px]">Energy Type</TableHead>
                  <TableHead className="min-w-[250px]">Facility</TableHead>
                  <TableHead className="min-w-[120px]">Region</TableHead>
                  <TableHead className="min-w-[110px]">Price (AED)</TableHead>
                  <TableHead className="min-w-[110px]">Price (USD)</TableHead>
                  <TableHead className="min-w-[100px]">24h Change</TableHead>
                  <TableHead className="min-w-[120px]">Available (MWh)</TableHead>
                  <TableHead className="min-w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketData.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{rec.id}</span>
                        {rec.verified && <Shield className="h-3 w-3 text-green-600" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={
                        rec.type === 'Solar' ? 'bg-yellow-100 text-yellow-800' :
                        rec.type === 'Wind' ? 'bg-blue-100 text-blue-800' :
                        rec.type === 'Nuclear' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {rec.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <div className="space-y-1">
                        <div className="font-medium text-sm truncate" title={rec.facility}>
                          {rec.facility}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rec.capacity} • Built {rec.yearBuilt}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{rec.region}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      AED {rec.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ${rec.priceUSD.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`flex items-center ${rec.change >= 0 ? 'text-rectify-green' : 'text-red-500'}`}>
                        {rec.change >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {rec.change >= 0 ? '+' : ''}{rec.change.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {rec.available}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-rectify-green hover:bg-rectify-green-dark text-white flex items-center gap-1"
                          onClick={() => handleBuyClick(rec)}
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Buy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-rectify-border hover:bg-rectify-accent flex items-center gap-1"
                          onClick={() => handleDetailsClick(rec)}
                        >
                          <Eye className="h-3 w-3" />
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Market stats section */}
          <div className="mt-6 p-6 bg-rectify-accent border-t border-rectify-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-rectify-green">
                  {marketData.reduce((sum, rec) => sum + parseInt(rec.available.replace(",", "")), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Available MWh</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-rectify-blue">
                  AED {(marketData.reduce((sum, rec) => sum + rec.price, 0) / marketData.length).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Average Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {marketData.filter(rec => rec.change > 0).length}/{marketData.length}
                </div>
                <div className="text-sm text-muted-foreground">Trending Up</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {marketData.filter(rec => rec.verified).length}
                </div>
                <div className="text-sm text-muted-foreground">Verified Sources</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buy Modal */}
      <Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-rectify-green" />
              Purchase I-RECs
            </DialogTitle>
            <DialogDescription>
              Buy {selectedREC?.type} I-RECs from {selectedREC?.facility}
            </DialogDescription>
          </DialogHeader>

          {selectedREC && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>I-REC ID:</span>
                  <span className="font-mono">{selectedREC.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Energy Type:</span>
                  <Badge className={
                    selectedREC.type === 'Solar' ? 'bg-yellow-100 text-yellow-800' :
                    selectedREC.type === 'Wind' ? 'bg-blue-100 text-blue-800' :
                    selectedREC.type === 'Nuclear' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {selectedREC.type}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price per MWh:</span>
                  <div className="text-right">
                    <div>AED {selectedREC.price.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">${selectedREC.priceUSD.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available:</span>
                  <span>{selectedREC.available} MWh</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (MWh)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={parseInt(selectedREC.available.replace(",", ""))}
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="p-4 bg-rectify-accent rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost:</span>
                  <div className="text-right">
                    <div className="font-bold text-lg">AED {Number(calculateTotal().aed).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">${Number(calculateTotal().usd).toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Carbon offset: ~{((parseFloat(buyQuantity) || 0) * parseFloat(selectedREC.carbonOffset)).toFixed(2)} tCO₂e
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowBuyModal(false)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBuySubmit}
                  disabled={isProcessing || !buyQuantity || parseInt(buyQuantity) <= 0}
                  className="bg-rectify-green hover:bg-rectify-green-dark text-white flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirm Purchase
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-rectify-blue" />
              I-REC Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about {selectedREC?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedREC && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm mb-1">I-REC ID</h4>
                  <p className="font-mono text-sm">{selectedREC.id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Certification</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedREC.certification}
                    </Badge>
                    <Shield className="h-3 w-3 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Facility Information */}
              <div>
                <h4 className="font-medium mb-3">Facility Information</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <p className="text-sm text-muted-foreground">{selectedREC.facility}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Location:</span>
                      <p className="text-sm text-muted-foreground">{selectedREC.region}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Coordinates:</span>
                      <p className="text-sm font-mono text-muted-foreground">{selectedREC.coordinates}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Capacity:</span>
                      <p className="text-sm text-muted-foreground">{selectedREC.capacity}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Technology:</span>
                      <p className="text-sm text-muted-foreground">{selectedREC.technology}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Year Built:</span>
                      <p className="text-sm text-muted-foreground">{selectedREC.yearBuilt}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Description:</span>
                    <p className="text-sm text-muted-foreground mt-1">{selectedREC.facilityDetails}</p>
                  </div>
                </div>
              </div>

              {/* Market Data */}
              <div>
                <h4 className="font-medium mb-3">Market Data</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-rectify-accent rounded-lg">
                    <div className="text-lg font-bold">AED {selectedREC.price.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Price per MWh</div>
                    <div className="text-xs">${selectedREC.priceUSD.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold">{selectedREC.available}</div>
                    <div className="text-xs text-muted-foreground">Available MWh</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold">{selectedREC.carbonOffset}</div>
                    <div className="text-xs text-muted-foreground">Carbon Offset Rate</div>
                  </div>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm text-green-800">Environmental Impact</span>
                </div>
                <p className="text-xs text-green-700">
                  Each MWh from this facility offsets {selectedREC.carbonOffset} of CO₂ emissions, 
                  contributing to UAE's Vision 2050 and Net Zero goals. This {selectedREC.type.toLowerCase()} 
                  energy source provides clean, renewable power to the UAE grid.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
                <Button 
                  className="bg-rectify-green hover:bg-rectify-green-dark text-white"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleBuyClick(selectedREC);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase I-RECs
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}