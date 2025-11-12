import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Loader2, Users, DollarSign, Mail, Calendar, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

type Currency = 'AED' | 'USD';

interface AdminUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tier: string;
  company: string;
  cashBalance: number;
  cashCurrency: Currency;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  lastLogin?: string;
  createdAt?: string;
  isSelf?: boolean;
}

export function AdminFundsManager() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [currencySelections, setCurrencySelections] = useState<Record<string, Currency>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUsers();

      if (response.success && Array.isArray(response.data)) {
        const fetchedUsers = response.data as AdminUserSummary[];
        setUsers(fetchedUsers);
        const defaults = fetchedUsers.reduce<Record<string, Currency>>((acc, current) => {
          acc[current.id] = current.cashCurrency || 'AED';
          return acc;
        }, {});
        setCurrencySelections(defaults);
      } else {
        toast.error(response.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Failed to load users', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const sortedUsers = useMemo(() => {
    const copy = [...users];
    copy.sort((a, b) => {
      if (a.isSelf && !b.isSelf) return 1;
      if (!a.isSelf && b.isSelf) return -1;
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });
    return copy;
  }, [users]);

  const formatBalance = (amount: number, currency: Currency) => {
    try {
      return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-AE', {
        style: 'currency',
        currency
      }).format(amount ?? 0);
    } catch {
      return `${currency} ${amount?.toFixed(2) ?? '0.00'}`;
    }
  };

  const handleAmountChange = (userId: string, value: string) => {
    setAmounts(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleCurrencyChange = (userId: string, value: Currency) => {
    setCurrencySelections(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleManualCredit = async (userId: string) => {
    const rawAmount = amounts[userId];
    const parsedAmount = parseFloat(rawAmount ?? '');
    if (!rawAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Enter a valid amount greater than zero');
      return;
    }

    const currency = currencySelections[userId] || 'AED';

    try {
      setSubmittingId(userId);
      const response = await apiService.manualCreditUser(userId, parsedAmount, currency);
      if (response.success && response.data) {
        toast.success(response.message || 'Funds added successfully');
        setUsers(prev =>
          prev.map(u =>
            u.id === userId
              ? {
                  ...u,
                  cashBalance: response.data.cashBalance,
                  cashCurrency: response.data.cashCurrency
                }
              : u
          )
        );
        setAmounts(prev => ({ ...prev, [userId]: '' }));
      } else {
        toast.error(response.message || 'Failed to add funds');
      }
    } catch (error: any) {
      console.error('Manual credit failed', error);
      toast.error(error?.message || 'Failed to add funds');
    } finally {
      setSubmittingId(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Access Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need an administrator account to manage user balances.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = users.length;
  const totalBalance = useMemo(() => {
    return users.reduce((sum, u) => sum + (u.cashBalance || 0), 0);
  }, [users]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Platform Balance</p>
                <p className="text-2xl font-bold">AED {totalBalance.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified Users</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.verificationStatus === 'verified').length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users & Fund Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              View all registered users and manually add funds to their accounts. All changes are recorded in the audit trail.
            </p>
          </div>
          <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing
              </span>
            ) : (
              'Refresh List'
            )}
          </Button>
        </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : sortedUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : (
          <div className="space-y-4">
            {sortedUsers.map(summary => {
              const amountValue = amounts[summary.id] ?? '';
              const selectedCurrency = currencySelections[summary.id] || summary.cashCurrency || 'AED';
              const isSubmitting = submittingId === summary.id;
              const isSelf = !!summary.isSelf;
              const disableCredit = isSelf || isSubmitting;
              const canSubmit =
                !disableCredit && amountValue.trim() !== '' && !Number.isNaN(parseFloat(amountValue)) && parseFloat(amountValue) > 0;

              return (
                <div
                  key={summary.id}
                  className="rounded-lg border bg-muted/30 p-4 backdrop-blur-sm transition hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          {summary.firstName} {summary.lastName}
                        </span>
                        <Badge variant="outline">{summary.role.toUpperCase()}</Badge>
                        <Badge variant="secondary">{summary.tier.toUpperCase()}</Badge>
                        {summary.verificationStatus === 'verified' && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Verified
                          </Badge>
                        )}
                        {isSelf && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {summary.email}
                      </div>
                      <div className="text-sm">
                        Balance:{' '}
                        <span className="font-medium">
                          {formatBalance(summary.cashBalance ?? 0, summary.cashCurrency || 'AED')}
                        </span>
                      </div>
                      {summary.company && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {summary.company}
                        </div>
                      )}
                      {summary.lastLogin && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last login: {new Date(summary.lastLogin).toLocaleDateString()}
                        </div>
                      )}
                      {summary.createdAt && (
                        <div className="text-xs text-muted-foreground">
                          Joined: {new Date(summary.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-end">
                      <div className="flex w-full gap-2 md:w-auto">
                        <div className="w-full md:w-40">
                          <Label htmlFor={`amount-${summary.id}`} className="sr-only">
                            Amount
                          </Label>
                          <Input
                            id={`amount-${summary.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Amount"
                            value={amountValue}
                            onChange={event => handleAmountChange(summary.id, event.target.value)}
                            disabled={disableCredit}
                          />
                        </div>
                        <div className="w-28">
                          <Label htmlFor={`currency-${summary.id}`} className="sr-only">
                            Currency
                          </Label>
                          <Select
                            value={selectedCurrency}
                            onValueChange={(value: Currency) => handleCurrencyChange(summary.id, value)}
                            disabled={disableCredit}
                          >
                            <SelectTrigger id={`currency-${summary.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AED">AED</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleManualCredit(summary.id)}
                        disabled={!canSubmit}
                        className="md:w-32"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                          </span>
                        ) : (
                          'Add Funds'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}

