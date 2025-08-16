'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  Zap,
  Shield
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock trading data
const mockPriceData = [
  { time: '00:00', price: 42500, volume: 1250 },
  { time: '04:00', price: 43200, volume: 1890 },
  { time: '08:00', price: 41800, volume: 2100 },
  { time: '12:00', price: 44500, volume: 1750 },
  { time: '16:00', price: 45200, volume: 2300 },
  { time: '20:00', price: 46800, volume: 1950 },
];

const mockTokens = [
  { symbol: 'REC', name: 'Renewable Energy Credits', price: 45.67, change: 5.23, changePercent: 12.95 },
  { symbol: 'CARB', name: 'Carbon Credits', price: 28.45, change: -1.23, changePercent: -4.14 },
  { symbol: 'SOLAR', name: 'Solar Energy Tokens', price: 15.89, change: 2.45, changePercent: 18.22 },
  { symbol: 'WIND', name: 'Wind Energy Credits', price: 32.11, change: 0.89, changePercent: 2.85 },
];

const mockNews = [
  { title: 'Global REC Market Reaches New High', time: '2 hours ago', impact: 'bullish' },
  { title: 'New Carbon Trading Regulations Announced', time: '4 hours ago', impact: 'neutral' },
  { title: 'Renewable Energy Investment Surge', time: '6 hours ago', impact: 'bullish' },
];

export default function TradingPlatform() {
  const [selectedToken, setSelectedToken] = useState(mockTokens[0]);
  const [currentPrice, setCurrentPrice] = useState(45.67);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 2;
      setCurrentPrice(prev => Math.max(0, prev + change));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  RECtify
                </h1>
                <p className="text-xs text-slate-400">Trading Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <span className="text-slate-300">Market Status:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">Open</span>
                </div>
              </div>
              
              <button
                onClick={() => setIsConnected(!isConnected)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isConnected 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {isConnected ? 'Connected' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Trade Renewable Energy Credits
            <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Sustainably
            </span>
          </h2>
                     <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
             Access the world&apos;s largest marketplace for renewable energy credits, carbon offsets, 
             and sustainable energy tokens. Trade with confidence on our secure, transparent platform.
           </p>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-green-400">$2.4B</div>
              <div className="text-sm text-slate-400">24h Volume</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-blue-400">150+</div>
              <div className="text-sm text-slate-400">Active Tokens</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-purple-400">50K+</div>
              <div className="text-sm text-slate-400">Traders</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-yellow-400">99.9%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Price Chart */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">{selectedToken.symbol}/USD</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                    selectedToken.change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedToken.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="text-sm font-medium">
                      {selectedToken.change > 0 ? '+' : ''}{selectedToken.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">1H</button>
                <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors">24H</button>
                <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">7D</button>
                <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">1M</button>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPriceData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Book / Trading Panel */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold mb-4">Quick Trade</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                  Buy
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                  Sell
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Amount (USD)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Quantity</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-medium transition-all">
                Place Order
              </button>
            </div>
          </div>
        </div>

        {/* Token List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold mb-4">Market Overview</h3>
                         <div className="space-y-3">
               {mockTokens.map((token) => (
                 <div 
                   key={token.symbol}
                   onClick={() => setSelectedToken(token)}
                   className={`p-4 rounded-lg cursor-pointer transition-all ${
                     selectedToken.symbol === token.symbol 
                       ? 'bg-green-500/20 border border-green-500/30' 
                       : 'bg-slate-700/30 hover:bg-slate-700/50'
                   }`}
                 >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-slate-400">{token.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${token.price.toFixed(2)}</div>
                      <div className={`text-sm flex items-center ${
                        token.change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {token.change > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {token.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News & Updates */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold mb-4">Market News</h3>
            <div className="space-y-4">
              {mockNews.map((news, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{news.title}</h4>
                    <div className={`w-2 h-2 rounded-full ${
                      news.impact === 'bullish' ? 'bg-green-500' : 
                      news.impact === 'bearish' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                  </div>
                  <p className="text-xs text-slate-400">{news.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Secure Trading</h3>
            <p className="text-slate-400 text-sm">
              Bank-grade security with multi-signature wallets and cold storage protection.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Global Markets</h3>
            <p className="text-slate-400 text-sm">
              Access renewable energy credits from markets worldwide, 24/7 trading.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Real-time Data</h3>
            <p className="text-slate-400 text-sm">
              Live market data, advanced charts, and professional trading tools.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800/30 border-t border-slate-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-400">
            <p>&copy; 2024 RECtify Trading Platform. Powering sustainable finance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
