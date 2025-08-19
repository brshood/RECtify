import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";

export function PriceChart() {
  const priceData = [
    // Winter - Higher solar prices due to lower production, moderate wind
    { date: '2024-01-01', solar: 18.5, wind: 22.3, nuclear: 14.2 },
    { date: '2024-01-15', solar: 19.2, wind: 21.8, nuclear: 14.5 },
    { date: '2024-02-01', solar: 17.8, wind: 24.1, nuclear: 14.1 },
    { date: '2024-02-15', solar: 16.9, wind: 23.5, nuclear: 14.3 },
    
    // Spring - Solar prices dropping as production increases
    { date: '2024-03-01', solar: 15.2, wind: 20.7, nuclear: 14.0 },
    { date: '2024-03-15', solar: 13.8, wind: 19.4, nuclear: 14.2 },
    { date: '2024-04-01', solar: 12.1, wind: 18.9, nuclear: 13.9 },
    { date: '2024-04-15', solar: 11.5, wind: 17.6, nuclear: 14.1 },
    
    // Summer - Lowest solar prices due to peak production
    { date: '2024-05-01', solar: 9.8, wind: 25.3, nuclear: 13.8 },
    { date: '2024-05-15', solar: 8.9, wind: 26.8, nuclear: 14.0 },
    { date: '2024-06-01', solar: 8.2, wind: 28.1, nuclear: 13.7 },
    { date: '2024-06-15', solar: 7.8, wind: 29.5, nuclear: 13.9 },
    { date: '2024-07-01', solar: 7.5, wind: 31.2, nuclear: 13.6 },
    { date: '2024-07-15', solar: 7.9, wind: 30.8, nuclear: 13.8 },
    { date: '2024-08-01', solar: 8.3, wind: 29.4, nuclear: 13.5 },
    { date: '2024-08-15', solar: 9.1, wind: 28.7, nuclear: 13.7 },
    
    // Fall - Solar prices rising as production decreases
    { date: '2024-09-01', solar: 10.7, wind: 26.2, nuclear: 13.9 },
    { date: '2024-09-15', solar: 12.3, wind: 24.8, nuclear: 14.1 },
    { date: '2024-10-01', solar: 14.1, wind: 23.1, nuclear: 14.0 },
    { date: '2024-10-15', solar: 15.8, wind: 22.5, nuclear: 14.2 },
    { date: '2024-11-01', solar: 17.2, wind: 21.9, nuclear: 14.3 },
    { date: '2024-11-15', solar: 18.6, wind: 22.8, nuclear: 14.4 },
    
    // Early Winter - Return to higher solar prices
    { date: '2024-12-01', solar: 19.4, wind: 23.4, nuclear: 14.5 },
    { date: '2024-12-15', solar: 20.1, wind: 24.0, nuclear: 14.6 }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>UAE I-REC Price Trends</span>
            <TrendingUp className="h-4 w-4 text-rectify-green" />
          </CardTitle>
          <Badge variant="outline">AED/MWh</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time pricing from UAE certified renewable facilities
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  `AED ${value} (≈$${(value / 3.69).toFixed(2)})`, 
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="solar" 
                stroke="var(--rectify-green)" 
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--rectify-green)" }}
                name="Solar"
              />
              <Line 
                type="monotone" 
                dataKey="wind" 
                stroke="var(--rectify-blue)" 
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--rectify-blue)" }}
                name="Wind"
              />
              <Line 
                type="monotone" 
                dataKey="nuclear" 
                stroke="#8b5cf6" 
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#8b5cf6" }}
                name="Nuclear"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-8 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rectify-green"></div>
            <span className="text-sm">Solar PV</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rectify-blue"></div>
            <span className="text-sm">Wind</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm">Nuclear</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-rectify-green-light rounded-lg border border-rectify-border">
          <div className="text-sm text-rectify-green-dark">
            <strong>Market Insight:</strong> Solar I-RECs show seasonal trends with lowest prices during peak summer production (AED 7-9/MWh). 
            Wind certificates trade at premium due to limited UAE wind resources. Nuclear maintains stable baseload pricing year-round.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}