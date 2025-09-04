import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";

export function MarketData() {

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
          
          {/* Market Data Coming Soon Alert */}
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Market data coming soon
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
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Market data will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}