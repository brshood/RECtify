import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TradingInterface } from "./TradingInterface";
import { PortfolioOverview } from "./PortfolioOverview";
import { MarketData } from "./MarketData";
import { RecentTransactions } from "./RecentTransactions";
import { EmissionsReport } from "./EmissionsReport";
import RECRegistration from "./RECRegistration";
import { BarChart3, TrendingUp, DollarSign, Activity, FileText, Leaf, Shield, Users } from "lucide-react";
import { useAuth } from "./AuthContext";
import apiService from "../services/api";
import { AdminFundsManager } from "./AdminFundsManager";

interface DashboardProps {
  initialTab?: string;
}

export function Dashboard({ initialTab = "overview" }: DashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalQuantity: 0,
    uniqueFacilities: 0,
    energyTypes: 0
  });
  const [activeOrders, setActiveOrders] = useState(0);
  const [monthlyTrading, setMonthlyTrading] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch holdings data
      const holdingsResponse = await apiService.getUserHoldings();
      if (holdingsResponse.success) {
        const summary = holdingsResponse.data.summary;
        setPortfolioData({
          totalValue: summary.totalValue || 0,
          totalQuantity: summary.totalQuantity || 0,
          uniqueFacilities: summary.uniqueFacilities?.length || 0,
          energyTypes: summary.energyTypes?.length || 0
        });
      }

      // Fetch active orders
      const ordersResponse = await apiService.getUserOrders();
      if (ordersResponse.success) {
        const activeOrdersCount = ordersResponse.data.filter((order: any) => order.status === 'active').length;
        setActiveOrders(activeOrdersCount);
      }

      // Fetch recent transactions for monthly trading
      const transactionsResponse = await apiService.getUserTransactions(30, 'completed');
      if (transactionsResponse.success) {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const monthlyTxns = transactionsResponse.data.filter((txn: any) => 
          new Date(txn.completedAt) >= thisMonth
        );
        const monthlyQuantity = monthlyTxns.reduce((sum: number, txn: any) => sum + txn.quantity, 0);
        setMonthlyTrading(monthlyQuantity);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const baseTabs = useMemo(() => {
    const items = [
      { value: "overview", label: "Overview", icon: BarChart3 },
      { value: "trading", label: "Trading", icon: TrendingUp },
      { value: "portfolio", label: "Portfolio", icon: DollarSign },
      { value: "market", label: "Market Data", icon: Activity },
      { value: "ei-reports", label: "EI Reports", icon: FileText },
      { value: "rec-registration", label: "REC Registration", icon: Shield },
    ];

    if (user?.role === "admin") {
      items.push({ value: "admin", label: "Admin", icon: Users });
    }

    return items;
  }, [user?.role]);

  const filteredTabs = useMemo(() => {
    if (!user) return baseTabs;
    return baseTabs.filter((t) => {
      if (t.value === 'trading') return user.permissions.canTrade;
      // Always show REC Registration tab; we'll gate content below
      return true;
    });
  }, [user, baseTabs]);

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4">
      {/* Dashboard Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Monitor your I-REC portfolio, execute trades, and track market performance
        </p>
      </div>

      {/* Mobile Tab Selector (visible on small screens) */}
      <div className="sm:hidden">
        <Card className="p-3">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a tab" />
            </SelectTrigger>
            <SelectContent>
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SelectItem key={tab.value} value={tab.value}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Desktop/Tablet Tab List (hidden on mobile) */}
        <div className="hidden sm:block">
          <Card className="p-1">
            <TabsList className="flex w-full flex-wrap gap-1">
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value} 
                    className="flex items-center justify-center space-x-1 px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[80px]"
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">
                      {tab.value === "market" ? "Market" : 
                       tab.value === "ei-reports" ? "Reports" : 
                       tab.value === "rec-registration" ? "Registration" : 
                       tab.label}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Card>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">AED {portfolioData.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{portfolioData.uniqueFacilities} facilities</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total I-RECs</CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{portfolioData.totalQuantity.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">MWh Certificates</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Trading</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">+{monthlyTrading.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{portfolioData.energyTypes} energy types</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{activeOrders}</div>
                <p className="text-xs text-muted-foreground">pending orders</p>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Overview - Full Width */}
          <div className="w-full">
            <PortfolioOverview />
          </div>

          {/* Recent Transactions - Full Width */}
          <div className="w-full">
            <RecentTransactions />
          </div>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-4">
          <TradingInterface />
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <PortfolioOverview />
        </TabsContent>

        {/* Market Data Tab */}
        <TabsContent value="market" className="space-y-4">
          <MarketData />
        </TabsContent>

        {/* EI Reports Tab */}
        <TabsContent value="ei-reports" className="space-y-4">
          <EmissionsReport />
        </TabsContent>

        {/* REC Registration Tab */}
        <TabsContent value="rec-registration" className="space-y-4">
          {user && !user.permissions.canRegisterFacilities ? (
            <Card>
              <CardHeader>
                <CardTitle>REC Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your account does not have permission to register facilities. Please switch to a Facility Owner account or contact support.
                </p>
              </CardContent>
            </Card>
          ) : (
            <RECRegistration />
          )}
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-4">
          {user?.role === "admin" ? (
            <AdminFundsManager />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Administrator Access Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You need an administrator account to view this section.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}