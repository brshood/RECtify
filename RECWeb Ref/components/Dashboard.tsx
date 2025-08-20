import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TradingInterface } from "./TradingInterface";
import { PortfolioOverview } from "./PortfolioOverview";
import { MarketData } from "./MarketData";
import { RecentTransactions } from "./RecentTransactions";
import { EmissionsReport } from "./EmissionsReport";
import { BarChart3, TrendingUp, DollarSign, Activity, FileText, Leaf } from "lucide-react";

interface DashboardProps {
  initialTab?: string;
}

export function Dashboard({ initialTab = "overview" }: DashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { value: "overview", label: "Overview", icon: BarChart3 },
    { value: "trading", label: "Trading", icon: TrendingUp },
    { value: "portfolio", label: "Portfolio", icon: DollarSign },
    { value: "market", label: "Market Data", icon: Activity },
    { value: "ei-reports", label: "EI Reports", icon: FileText },
  ];

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
              {tabs.map((tab) => {
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value} 
                    className="flex items-center justify-center space-x-1 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">
                      {tab.value === "market" ? "Market" : 
                       tab.value === "ei-reports" ? "Reports" : 
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
                <div className="text-lg sm:text-2xl font-bold">AED 45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total I-RECs</CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">MWh Certificates</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Trading</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">3 buy, 9 sell orders</p>
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
      </Tabs>
    </div>
  );
}