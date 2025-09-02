import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown, DollarSign, Zap, Leaf, FileCheck, Sparkles, Shield, Globe, AlertCircle, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { useAuth } from "./AuthContext";
import apiService from "../services/api";

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
  acquisitionDate: string;
}

interface HoldingSummary {
  totalQuantity: number;
  totalValue: number;
  uniqueFacilities: string[];
  energyTypes: string[];
}

interface HoldingsByFacility {
  _id: string;
  totalQuantity: number;
  totalValue: number;
  averagePrice: number;
  energyType: string;
  emirate: string;
  vintage: number;
}

interface Transaction {
  _id: string;
  facilityName: string;
  energyType: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  completedAt: string;
  buyerId: { firstName: string; lastName: string; company: string };
  sellerId: { firstName: string; lastName: string; company: string };
}

const CHART_COLORS = {
  primary: "#16a085",
  secondary: "#3b82f6", 
  accent: "#f59e0b",
  success: "#16a085",
  warning: "#f59e0b",
  danger: "#ef4444"
};

const ENERGY_TYPE_COLORS: Record<string, string> = {
  solar: "#f59e0b",
  wind: "#3b82f6",
  hydro: "#06b6d4",
  biomass: "#16a085",
  geothermal: "#dc2626",
  nuclear: "#7c3aed"
};

export function PortfolioOverview() {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<HoldingSummary>({ totalQuantity: 0, totalValue: 0, uniqueFacilities: [], energyTypes: [] });
  const [byFacility, setByFacility] = useState<HoldingsByFacility[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch holdings
      const holdingsResponse = await apiService.getUserHoldings();
      if (holdingsResponse.success) {
        setHoldings(holdingsResponse.data.holdings || []);
        setSummary(holdingsResponse.data.summary || { totalQuantity: 0, totalValue: 0, uniqueFacilities: [], energyTypes: [] });
        setByFacility(holdingsResponse.data.byFacility || []);
      }

      // Fetch recent transactions
      const transactionsResponse = await apiService.getUserTransactions(20, 'completed');
      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load portfolio data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare energy sources distribution data
  const energySourcesData = byFacility.reduce((acc, facility) => {
    const existing = acc.find(item => item.name === facility.energyType);
    if (existing) {
      existing.value += facility.totalQuantity;
      existing.totalValue += facility.totalValue;
      existing.facilities.push(facility._id);
    } else {
      acc.push({
        name: facility.energyType,
        value: facility.totalQuantity,
        totalValue: facility.totalValue,
        color: ENERGY_TYPE_COLORS[facility.energyType] || "#64748b",
        facilities: [facility._id]
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; totalValue: number; color: string; facilities: string[] }>)
  .map(item => ({
    ...item,
    percentage: summary.totalQuantity > 0 ? ((item.value / summary.totalQuantity) * 100).toFixed(1) : "0"
  }));

  // Prepare portfolio value trend data from transactions
  const portfolioValueData = transactions
    .slice(0, 12)
    .reverse()
    .map((transaction, index) => ({
      month: new Date(transaction.completedAt).toLocaleDateString('en-US', { month: 'short' }),
      value: transaction.totalAmount,
      certificates: transaction.quantity,
      date: transaction.completedAt
    }));

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please log in to view your portfolio</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-rectify-green animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchUserData}
            className="px-4 py-2 bg-rectify-green text-white rounded-lg hover:bg-rectify-green-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Real User Data */}
      <div className="bg-gradient-to-br from-rectify-green-light via-rectify-accent to-rectify-blue-light rounded-xl p-4 sm:p-6 lg:p-8 border border-rectify-border shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <Sparkles className="h-16 w-16 text-rectify-green" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Globe className="h-12 w-12 text-rectify-blue" />
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-rectify-green" />
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-rectify-gradient">
                    Welcome back, {user.firstName}!
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-rectify-green-dark">
                  <span className="text-base lg:text-lg font-medium">ريكتيفاي</span>
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-rectify-green-dark leading-relaxed max-w-2xl">
                Your renewable energy portfolio is making a real impact. Track your I-REC holdings, 
                monitor market opportunities, and contribute to UAE's Net Zero 2050 vision.
              </p>
            </div>
            
            <div className="sm:hidden flex items-center justify-center gap-3 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
              <span className="text-xl font-bold text-rectify-green">ريكتيفاي</span>
              <div className="text-xs text-rectify-green-dark text-center">
                <div>UAE's First</div>
                <div>REC Platform</div>
              </div>
            </div>
          </div>
          
          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg backdrop-blur-sm">
              <div className="p-2 bg-rectify-green/20 rounded-full">
                <DollarSign className="h-4 w-4 text-rectify-green" />
              </div>
              <div>
                <div className="font-bold text-rectify-green-dark">AED {summary.totalValue.toLocaleString()}</div>
                <div className="text-xs text-rectify-green-dark/70">Portfolio Value</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg backdrop-blur-sm">
              <div className="p-2 bg-rectify-blue/20 rounded-full">
                <FileCheck className="h-4 w-4 text-rectify-blue" />
              </div>
              <div>
                <div className="font-bold text-rectify-green-dark">{summary.totalQuantity.toLocaleString()}</div>
                <div className="text-xs text-rectify-green-dark/70">Total I-RECs</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg backdrop-blur-sm">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-bold text-rectify-green-dark">{summary.uniqueFacilities.length}</div>
                <div className="text-xs text-rectify-green-dark/70">Facilities</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg backdrop-blur-sm">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <Leaf className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-bold text-rectify-green-dark">{summary.energyTypes.length}</div>
                <div className="text-xs text-rectify-green-dark/70">Energy Types</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Analytics */}
      <div className="space-y-4">
        {/* Recent Transactions Chart */}
        {portfolioValueData.length > 0 && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rectify-green" />
                Recent Transaction Activity
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your latest I-REC transactions and trading activity
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
                        name === 'value' ? 'Transaction Value' : 'Certificates Traded'
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
                      name="Transaction Value (AED)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="certificates" 
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 3 }}
                      name="Certificates Traded"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Energy Sources and Holdings Breakdown */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          
          {/* Energy Sources Distribution */}
          {energySourcesData.length > 0 && (
            <Card className="w-full h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-rectify-blue" />
                  Energy Sources Portfolio
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your renewable energy holdings by source type
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
                        formatter={(value, name) => [`${value} I-RECs`, `${name}`]}
                        labelFormatter={(label) => {
                          const source = energySourcesData.find(s => s.name === label);
                          return `${label} - ${source?.percentage}%`;
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
                        formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2 mt-3 pt-3 border-t">
                  {energySourcesData.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: source.color }}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-sm capitalize">{source.name}</div>
                          <div className="text-xs text-muted-foreground">{source.facilities.length} facilities</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm">{source.percentage}%</div>
                        <div className="text-xs text-muted-foreground">{source.value} I-RECs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Holdings by Facility */}
          <Card className="w-full h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Top Holdings by Facility
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your largest I-REC holdings by renewable energy facility
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {byFacility.length > 0 ? (
                <div className="space-y-3">
                  {byFacility.slice(0, 6).map((facility, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rectify-green/10 rounded-full">
                          <Zap className="h-4 w-4 text-rectify-green" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{facility._id}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {facility.energyType} • {facility.emirate} • {facility.vintage}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{facility.totalQuantity.toLocaleString()} I-RECs</div>
                        <div className="text-xs text-muted-foreground">AED {facility.totalValue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No holdings yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start trading to build your renewable energy portfolio
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}