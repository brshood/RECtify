import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Activity, 
  Shield, 
  Network, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  Database,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface BlockchainStatus {
  initialized: boolean;
  network: string;
  purpose: string;
  totalTransactions: number;
  status: string;
}

interface NetworkInfo {
  name: string;
  chainId: string;
  blockNumber: number;
  purpose: string;
}

interface TransactionRecord {
  blockchainTxId: string;
  blockchainHash: string;
  buyerAddress: string;
  sellerAddress: string;
  recQuantity: number;
  timestamp: string;
  status: string;
  facilityDetails?: {
    facilityName: string;
    facilityId: string;
    energyType: string;
    vintage: number;
  };
}

interface BlockchainMonitorProps {
  className?: string;
}

const BlockchainMonitor: React.FC<BlockchainMonitorProps> = ({ className }) => {
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const authenticated = !!token;
    setIsAuthenticated(authenticated);
    if (!authenticated) {
      setError('Please log in to access blockchain monitoring');
    } else {
      setError(null);
    }
    return authenticated;
  };

  // Fetch blockchain status
  const fetchBlockchainStatus = async () => {
    try {
      if (!checkAuthentication()) return;

      const token = localStorage.getItem('token');
      const response = await fetch('/api/rec-security/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlockchainStatus(data.data.status);
        setError(null);
      } else if (response.status === 401) {
        setError('Authentication expired. Please log in again.');
        setIsAuthenticated(false);
      } else {
        setError('Failed to fetch blockchain status');
      }
    } catch (err) {
      setError('Network error while fetching blockchain status');
    }
  };

  // Fetch network information
  const fetchNetworkInfo = async () => {
    try {
      if (!checkAuthentication()) return;

      const token = localStorage.getItem('token');
      const response = await fetch('/api/rec-security/network-info', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNetworkInfo(data.data);
      } else if (response.status === 401) {
        setError('Authentication expired. Please log in again.');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to fetch network info:', err);
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async () => {
    try {
      if (!checkAuthentication()) return;

      const token = localStorage.getItem('token');
      const response = await fetch('/api/rec-security/transaction-history?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTransactionHistory(data.data.transactions);
        }
      } else if (response.status === 401) {
        setError('Authentication expired. Please log in again.');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to fetch transaction history:', err);
    }
  };

  // Initialize blockchain service
  const initializeBlockchain = async () => {
    setLoading(true);
    try {
      if (!checkAuthentication()) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/rec-security/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchAllData();
          setError(null);
        } else {
          setError(data.message || 'Failed to initialize blockchain service');
        }
      } else if (response.status === 401) {
        setError('Authentication expired. Please log in again.');
        setIsAuthenticated(false);
      } else {
        setError('Failed to initialize blockchain service');
      }
    } catch (err) {
      setError('Network error while initializing blockchain service');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all blockchain data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBlockchainStatus(),
        fetchNetworkInfo(),
        fetchTransactionHistory()
      ]);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to fetch blockchain data');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication and auto-refresh data every 30 seconds
  useEffect(() => {
    checkAuthentication();
    if (isAuthenticated) {
      fetchAllData();
    }
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchAllData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Collapsible Header */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold">Blockchain Monitor</h2>
              <Badge 
                variant="outline" 
                className={`${blockchainStatus?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {blockchainStatus?.status === 'active' ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchAllData();
                    }}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  {!blockchainStatus?.initialized && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        initializeBlockchain();
                      }}
                      disabled={loading}
                      size="sm"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Initialize
                    </Button>
                  )}
                </>
              )}
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-6">

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status & Network</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitor</TabsTrigger>
        </TabsList>

        {/* Status & Network Tab */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Blockchain Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Blockchain Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {blockchainStatus ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Service Status</span>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(blockchainStatus.status)} text-white`}
                      >
                        {getStatusIcon(blockchainStatus.status)}
                        <span className="ml-1 capitalize">{blockchainStatus.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Network</span>
                      <Badge variant="outline">{blockchainStatus.network}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Transactions</span>
                      <span className="text-sm font-mono">{blockchainStatus.totalTransactions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Purpose</span>
                      <span className="text-xs text-gray-600">{blockchainStatus.purpose}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2" />
                    <p>Loading blockchain status...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Network Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="h-5 w-5" />
                  <span>Network Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {networkInfo ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Network Name</span>
                      <Badge variant="outline">{networkInfo.name}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Chain ID</span>
                      <span className="text-sm font-mono">{networkInfo.chainId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Block Number</span>
                      <span className="text-sm font-mono">{networkInfo.blockNumber.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Purpose</span>
                      <span className="text-xs text-gray-600">{networkInfo.purpose}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    <Network className="h-8 w-8 mx-auto mb-2" />
                    <p>Loading network info...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Connection Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${blockchainStatus?.initialized ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">Blockchain Service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${networkInfo ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">Network Connection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${transactionHistory.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm">Transaction History</span>
                </div>
              </div>
              {lastUpdate && (
                <div className="mt-4 text-xs text-gray-500">
                  Last updated: {lastUpdate.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>REC Transaction History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionHistory.length > 0 ? (
                <div className="space-y-4">
                  {transactionHistory.map((tx, index) => (
                    <div key={tx.blockchainTxId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{tx.status}</Badge>
                          <span className="text-sm font-mono">{tx.blockchainTxId}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatTimestamp(tx.timestamp)}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Buyer:</span> {formatAddress(tx.buyerAddress)}
                        </div>
                        <div>
                          <span className="font-medium">Seller:</span> {formatAddress(tx.sellerAddress)}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {tx.recQuantity} RECs
                        </div>
                        <div>
                          <span className="font-medium">Hash:</span> 
                          <span className="font-mono text-xs ml-1">{formatAddress(tx.blockchainHash)}</span>
                        </div>
                      </div>

                      {tx.facilityDetails && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="text-sm">
                            <span className="font-medium">Facility:</span> {tx.facilityDetails.facilityName}
                            <span className="ml-2 text-gray-600">({tx.facilityDetails.energyType}, {tx.facilityDetails.vintage})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4" />
                  <p>No transactions recorded yet</p>
                  <p className="text-sm">Transactions will appear here as they are processed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Monitor Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Real-time Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Live Status</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${blockchainStatus?.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm">
                      {blockchainStatus?.status === 'active' ? 'Blockchain Active' : 'Blockchain Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Auto-refresh</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm">Every 30 seconds</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Recent Activity</h4>
                <div className="space-y-2">
                  {transactionHistory.slice(0, 3).map((tx) => (
                    <div key={tx.blockchainTxId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>REC Transfer: {tx.recQuantity} units</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {transactionHistory.length === 0 && (
                    <div className="text-sm text-gray-500">No recent activity</div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Network Health</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Connection:</span>
                    <span className={`ml-2 ${networkInfo ? 'text-green-600' : 'text-red-600'}`}>
                      {networkInfo ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Latency:</span>
                    <span className="ml-2 text-green-600">~200ms</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      )}
    </div>
  );
};

export default BlockchainMonitor;
