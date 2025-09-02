import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown, DollarSign, Zap, Leaf, FileCheck, Sparkles, Shield, Globe, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

// Mock portfolio data
const portfolioData = {
  totalValue: 45231.89,
  totalCertificates: 1234,
  monthlyChange: 8.5,
  holdings: [
    { type: "Solar", quantity: 750, value: 28500, region: "Dubai", change: 12.3 },
    { type: "Wind", quantity: 350, value: 13200, region: "Abu Dhabi", change: -2.1 },
    { type: "Biomass", quantity: 134, value: 3531.89, region: "Sharjah", change: 5.7 }
  ]
};

// Portfolio value trend data (last 12 months)
const portfolioValueData = [
  { month: "Jan", value: 32000, certificates: 800 },
  { month: "Feb", value: 34500, certificates: 850 },
  { month: "Mar", value: 31200, certificates: 780 },
  { month: "Apr", value: 36800, certificates: 920 },
  { month: "May", value: 38900, certificates: 970 },
  { month: "Jun", value: 35600, certificates: 890 },
  { month: "Jul", value: 40200, certificates: 1005 },
  { month: "Aug", value: 42800, certificates: 1070 },
  { month: "Sep", value: 41500, certificates: 1038 },
  { month: "Oct", value: 43900, certificates: 1098 },
  { month: "Nov", value: 44600, certificates: 1115 },
  { month: "Dec", value: 45231, certificates: 1234 }
];

// Energy sources distribution data
const energySourcesData = [
  { name: "Solar", value: 60.8, count: 750, region: "Dubai, Abu Dhabi", color: "#f59e0b" },
  { name: "Wind", value: 28.4, count: 350, region: "Abu Dhabi Coast", color: "#3b82f6" },
  { name: "Biomass", value: 10.8, count: 134, region: "Sharjah, Ajman", color: "#16a085" }
];

// ESG Impact data - Before vs After implementing renewable energy
const esgImpactData = [
  { 
    category: "Carbon Emissions", 
    before: 5200, 
    after: 2732, 
    unit: "tCO₂/year",
    improvement: "47% Reduction"
  },
  { 
    category: "Water Usage", 
    before: 850, 
    after: 620, 
    unit: "ML/year",
    improvement: "27% Reduction"
  },
  { 
    category: "Air Quality Index", 
    before: 45, 
    after: 78, 
    unit: "AQI Score",
    improvement: "73% Improvement"
  },
  { 
    category: "Renewable %", 
    before: 15, 
    after: 68, 
    unit: "% Clean Energy",
    improvement: "353% Increase"
  }
];

const CHART_COLORS = {
  primary: "#16a085",
  secondary: "#3b82f6", 
  accent: "#f59e0b",
  success: "#16a085",
  warning: "#f59e0b",
  danger: "#ef4444"
};

export function PortfolioOverview() {
  const [isWelcomeBannerVisible, setIsWelcomeBannerVisible] = useState(true);

  const handleCloseBanner = () => {
    setIsWelcomeBannerVisible(false);
  };

  return (
    <div className="space-y-6">
      {/* Redesigned Welcome Banner */}
      {isWelcomeBannerVisible && (
        <div className="bg-gradient-to-br from-rectify-green-light via-rectify-accent to-rectify-blue-light rounded-xl p-4 sm:p-6 lg:p-8 border border-rectify-border shadow-sm relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleCloseBanner}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors duration-200 group"
          aria-label="Close welcome banner"
        >
          <X className="h-4 w-4 text-rectify-green-dark group-hover:text-rectify-green" />
        </button>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <Sparkles className="h-16 w-16 text-rectify-green" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Globe className="h-12 w-12 text-rectify-blue" />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-rectify-green" />
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-rectify-gradient">
                    Welcome to RECtify
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-rectify-green-dark">
                  <span className="text-base lg:text-lg font-medium">ريكتيفاي</span>
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-rectify-green-dark leading-relaxed max-w-2xl">
                The UAE's first digital platform for transparent, traceable, and streamlined I-REC trading. 
                Fully aligned with UAE Energy Strategy 2050 and blockchain-verified for complete trust.
              </p>
            </div>
            
            {/* Mobile Arabic Branding */}
            <div className="sm:hidden flex items-center justify-center gap-3 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
              <span className="text-xl font-bold text-rectify-green">ريكتيفاي</span>
              <div className="text-xs text-rectify-green-dark text-center">
                <div>UAE's First</div>
                <div>REC Platform</div>
              </div>
            </div>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg backdrop-blur-sm">
              <div className="p-2 bg-rectify-green/20 rounded-full">
                <Shield className="h-4 w-4 text-rectify-green" />
              </div>
              <div>
                <div className="font-medium text-rectify-green-dark text-sm">Blockchain Verified</div>
                <div className="text-xs text-rectify-green-dark/70">100% Transparent</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg backdrop-blur-sm">
              <div className="p-2 bg-rectify-blue/20 rounded-full">
                <Globe className="h-4 w-4 text-rectify-blue" />
              </div>
              <div>
                <div className="font-medium text-rectify-green-dark text-sm">UAE Vision 2050</div>
                <div className="text-xs text-rectify-green-dark/70">Fully Aligned</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg backdrop-blur-sm">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Leaf className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-rectify-green-dark text-sm">Net Zero Ready</div>
                <div className="text-xs text-rectify-green-dark/70">Carbon Neutral</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg backdrop-blur-sm">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <Zap className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium text-rectify-green-dark text-sm">Real-Time Trading</div>
                <div className="text-xs text-rectify-green-dark/70">24/7 Platform</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      

      {/* Portfolio Analytics Charts Section */}
      <div className="space-y-4">
        
        {/* Portfolio Value Trend Chart - Full Width Row */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rectify-green" />
              Portfolio Value Performance
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              12-month portfolio value trends and certificate accumulation analysis
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioValueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'value' ? `AED ${value.toLocaleString()}` : `${value} I-RECs`,
                      name === 'value' ? 'Portfolio Value' : 'Total Certificates'
                    ]}
                    labelStyle={{ color: '#1a202c' }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: `1px solid ${CHART_COLORS.primary}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: CHART_COLORS.primary, strokeWidth: 2, fill: 'white' }}
                    name="Portfolio Value (AED)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="certificates" 
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 3 }}
                    name="Total Certificates"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Portfolio Performance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pt-3 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-rectify-green">+41.3%</div>
                <div className="text-sm text-muted-foreground">12-Month Growth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-rectify-blue">+434</div>
                <div className="text-sm text-muted-foreground">New I-RECs Added</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">AED 1,127</div>
                <div className="text-sm text-muted-foreground">Avg. Monthly Increase</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Sources and ESG Impact Charts - Shared Row */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          
          {/* Energy Sources Distribution Pie Chart */}
          <Card className="w-full h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-rectify-blue" />
                Energy Sources Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Renewable energy portfolio across UAE regions
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energySourcesData}
                      cx="50%"
                      cy="50%"
                      outerRadius="85%"
                      innerRadius="50%"
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {energySourcesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, `${name} Share`]}
                      labelFormatter={(label) => {
                        const source = energySourcesData.find(s => s.name === label);
                        return `${label} - ${source?.count} I-RECs`;
                      }}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: `1px solid ${CHART_COLORS.primary}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={32}
                      formatter={(value) => `${value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Energy Sources Breakdown */}
              <div className="space-y-2 mt-3 pt-3 border-t">
                {energySourcesData.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: source.color }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{source.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{source.region}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-sm">{source.value}%</div>
                      <div className="text-xs text-muted-foreground">{source.count} I-RECs</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Regional Distribution Summary */}
              <div className="mt-3 p-3 bg-rectify-accent rounded-lg">
                <div className="font-medium text-sm mb-1">Regional Impact</div>
                <div className="text-xs text-rectify-green-dark">
                  Diversified portfolio across 4 UAE emirates, supporting local renewable energy goals
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ESG Impact Before/After Histogram */}
          <Card className="w-full h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                ESG Impact Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Environmental impact comparison: traditional vs renewable energy
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={esgImpactData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="category" 
                      stroke="#64748b"
                      fontSize={10}
                      angle={-35}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} ${props.payload.unit}`,
                        name === 'before' ? 'Before Renewable Energy' : 'After Renewable Energy'
                      ]}
                      labelFormatter={(label) => {
                        const item = esgImpactData.find(d => d.category === label);
                        return `${label} - ${item?.improvement}`;
                      }}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: `1px solid ${CHART_COLORS.primary}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="before" 
                      fill="#ef4444" 
                      name="Before"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="after" 
                      fill={CHART_COLORS.success}
                      name="After"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Impact Methodology */}
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t">
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Traditional Energy</div>
                  <div className="text-xs text-red-600 mt-1">High Environmental Cost</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Renewable Energy</div>
                  <div className="text-xs text-green-600 mt-1">Sustainable Impact</div>
                </div>
              </div>
              
              {/* Key Environmental Metrics */}
              <div className="mt-3 space-y-2">
                <h4 className="font-medium text-sm">Environmental Achievements:</h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-rectify-accent rounded">
                    <span>Carbon Footprint Reduction</span>
                    <span className="font-bold text-green-600">2,468 tCO₂ saved</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span>Water Conservation</span>
                    <span className="font-bold text-blue-600">230 ML saved annually</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span>UAE Vision 2050 Contribution</span>
                    <span className="font-bold text-yellow-600">68% Clean Energy</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}