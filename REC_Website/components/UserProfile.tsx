import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { useAuth, UserRole, UserTier } from './AuthContext';
import apiService from '../services/api';
import { BankTransferInstructions } from './BankTransferInstructions';
import { 
  User, 
  Mail, 
  Building, 
  MapPin, 
  Calendar, 
  Shield, 
  Settings, 
  Bell, 
  Moon, 
  Globe, 
  DollarSign,
  Crown,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard
} from 'lucide-react';

interface UserProfileProps {
  onClose?: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user || {});
  const [balance, setBalance] = useState<{ cashBalance: number; cashCurrency: 'AED' | 'USD'; reservedBalance?: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBankInstructions, setShowBankInstructions] = useState(false);

  if (!user) return null;

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'facility-owner':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'trader':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'compliance-officer':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'admin':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getTierColor = (tier: UserTier) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'premium':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'basic':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'enterprise':
        return <Crown className="h-4 w-4" />;
      case 'premium':
        return <Shield className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getVerificationStatus = () => {
    switch (user.verificationStatus) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = user.preferences.currency;
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount * 0.27);
    }
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const refreshBalance = async () => {
    try {
      setIsRefreshing(true);
      const res = await apiService.getCashBalance();
      if (res.success) setBalance(res.data);
    } catch (error) {
      console.error('Failed to refresh balance', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshBalance();
  }, []);

  // Apply theme when user toggles Dark Mode in preferences
  useEffect(() => {
    if (!user) return;
    try {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const forceDark = !!user.preferences?.darkMode;
      if (forceDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        // Follow system preference
        document.documentElement.classList.toggle('dark', prefersDark);
        localStorage.removeItem('theme');
      }
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', document.documentElement.classList.contains('dark') ? '#0b0f14' : '#16a085');
    } catch {}
  }, [user?.preferences?.darkMode]);


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>User Profile</span>
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Available Cash</div>
                <div className="text-2xl font-bold">{balance ? `${balance.cashCurrency} ${balance.cashBalance.toFixed(2)}` : '—'}</div>
                {balance?.reservedBalance !== undefined && (
                  <div className="text-xs text-muted-foreground">Reserved: {balance.reservedBalance.toFixed(2)} AED</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={refreshBalance} disabled={isRefreshing}>
                  {isRefreshing ? 'Refreshing…' : 'Refresh'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowBankInstructions(!showBankInstructions)}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {showBankInstructions ? 'Hide' : 'Add Funds'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showBankInstructions && (
            <div className="mt-4">
              <BankTransferInstructions />
            </div>
          )}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{user.firstName} {user.lastName}</h3>
              <div className="flex items-center space-x-2">
                <Badge className={getRoleColor(user.role)}>
                  {user.role.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge className={getTierColor(user.tier)}>
                  {getTierIcon(user.tier)}
                  <span className="ml-1">{user.tier.toUpperCase()}</span>
                </Badge>
                {getVerificationStatus()}
              </div>
              <div className="text-sm text-muted-foreground">
                Member since {new Date(user.joinedDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <Separator />

          {(user.portfolioValue !== undefined || user.totalRecs !== undefined) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.portfolioValue !== undefined && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-rectify-green" />
                        <span className="text-sm text-muted-foreground">Portfolio Value</span>
                      </div>
                      <div className="text-2xl font-bold">{formatCurrency(user.portfolioValue)}</div>
                    </CardContent>
                  </Card>
                )}
                {user.totalRecs !== undefined && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-rectify-blue" />
                        <span className="text-sm text-muted-foreground">Total RECs</span>
                      </div>
                      <div className="text-2xl font-bold">{user.totalRecs.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <Separator />
            </>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium">Profile Information</h4>
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-first-name">First Name</Label>
                {isEditing ? (
                  <Input
                    id="profile-first-name"
                    value={(editData as any).firstName || ''}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    autoComplete="given-name"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user.firstName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-last-name">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="profile-last-name"
                    value={(editData as any).lastName || ''}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    autoComplete="family-name"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user.lastName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-company">Company</Label>
                {isEditing ? (
                  <Input
                    id="profile-company"
                    value={(editData as any).company || ''}
                    onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                    autoComplete="organization"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{user.company}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Emirate</Label>
                {isEditing ? (
                  <Select
                    value={(editData as any).emirate || ''}
                    onValueChange={(value) => setEditData({ ...editData, emirate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                      <SelectItem value="Dubai">Dubai</SelectItem>
                      <SelectItem value="Sharjah">Sharjah</SelectItem>
                      <SelectItem value="Ajman">Ajman</SelectItem>
                      <SelectItem value="Fujairah">Fujairah</SelectItem>
                      <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                      <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user.emirate}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Last Login</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(user.lastLogin).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-currency">Currency</Label>
                <Select
                  value={user.preferences.currency}
                  onValueChange={(value: 'AED' | 'USD') => 
                    updateProfile({ 
                      preferences: { ...user.preferences, currency: value } 
                    })
                  }
                >
                  <SelectTrigger id="profile-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED (Dirham)</SelectItem>
                    <SelectItem value="USD">USD (Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-dashboard-layout">Dashboard Layout</Label>
                <Select
                  value={user.preferences.dashboardLayout}
                  onValueChange={(value: 'default' | 'compact' | 'detailed') => 
                    updateProfile({ 
                      preferences: { ...user.preferences, dashboardLayout: value } 
                    })
                  }
                >
                  <SelectTrigger id="profile-dashboard-layout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <Label>Email Notifications</Label>
                </div>
                <Switch
                  checked={user.preferences.notifications}
                  onCheckedChange={(checked) =>
                    updateProfile({
                      preferences: { ...user.preferences, notifications: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4" />
                  <Label>Dark Mode</Label>
                </div>
                <Switch
                  checked={user.preferences.darkMode}
                  onCheckedChange={(checked) => {
                    updateProfile({
                      preferences: { ...user.preferences, darkMode: checked }
                    });
                    // Apply dark mode to DOM
                    if (checked) {
                      document.documentElement.classList.add('dark');
                      localStorage.setItem('theme', 'dark');
                      const meta = document.querySelector('meta[name="theme-color"]');
                      if (meta) meta.setAttribute('content', '#0b0f14');
                    } else {
                      document.documentElement.classList.remove('dark');
                      localStorage.setItem('theme', 'light');
                      const meta = document.querySelector('meta[name="theme-color"]');
                      if (meta) meta.setAttribute('content', '#16a085');
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Account Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(user.permissions).map(([permission, hasAccess]) => (
                <div key={permission} className="flex items-center space-x-2">
                  {hasAccess ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${hasAccess ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                await logout();
                onClose?.();
              }} 
              className="flex-1"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}


