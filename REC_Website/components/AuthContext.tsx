import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

export type UserRole = 'trader' | 'facility-owner' | 'compliance-officer' | 'admin';
export type UserTier = 'basic' | 'premium' | 'enterprise';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: UserRole;
  tier: UserTier;
  emirate: string;
  joinedDate: string;
  lastLogin: string;
  profileImage?: string;
  preferences: {
    currency: 'AED' | 'USD';
    language: 'en' | 'ar';
    notifications: boolean;
    darkMode: boolean;
    dashboardLayout: 'default' | 'compact' | 'detailed';
  };
  permissions: {
    canTrade: boolean;
    canRegisterFacilities: boolean;
    canViewAnalytics: boolean;
    canExportReports: boolean;
    canManageUsers: boolean;
  };
  portfolioValue?: number;
  totalRecs?: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUsers: Record<string, User & { password: string }> = {
  'ahmed.alshamsi@adnoc.ae': {
    id: '1',
    email: 'ahmed.alshamsi@adnoc.ae',
    password: 'demo123',
    firstName: 'Ahmed',
    lastName: 'Al Shamsi',
    company: 'ADNOC Clean Energy',
    role: 'facility-owner',
    tier: 'enterprise',
    emirate: 'Abu Dhabi',
    joinedDate: '2023-01-15',
    lastLogin: '2024-01-20 14:30:00',
    profileImage: undefined,
    preferences: {
      currency: 'AED',
      language: 'en',
      notifications: true,
      darkMode: false,
      dashboardLayout: 'detailed'
    },
    permissions: {
      canTrade: true,
      canRegisterFacilities: true,
      canViewAnalytics: true,
      canExportReports: true,
      canManageUsers: false
    },
    portfolioValue: 2456789,
    totalRecs: 15420,
    verificationStatus: 'verified'
  },
  'fatima.hassan@masdar.ae': {
    id: '2',
    email: 'fatima.hassan@masdar.ae',
    password: 'demo123',
    firstName: 'Fatima',
    lastName: 'Hassan',
    company: 'Masdar City',
    role: 'trader',
    tier: 'premium',
    emirate: 'Abu Dhabi',
    joinedDate: '2023-06-10',
    lastLogin: '2024-01-20 09:15:00',
    preferences: {
      currency: 'USD',
      language: 'en',
      notifications: true,
      darkMode: true,
      dashboardLayout: 'compact'
    },
    permissions: {
      canTrade: true,
      canRegisterFacilities: false,
      canViewAnalytics: true,
      canExportReports: true,
      canManageUsers: false
    },
    portfolioValue: 856432,
    totalRecs: 4250,
    verificationStatus: 'verified'
  },
  'omar.khalil@dewa.gov.ae': {
    id: '3',
    email: 'omar.khalil@dewa.gov.ae',
    password: 'demo123',
    firstName: 'Omar',
    lastName: 'Khalil',
    company: 'Dubai Electricity & Water Authority',
    role: 'compliance-officer',
    tier: 'enterprise',
    emirate: 'Dubai',
    joinedDate: '2023-03-20',
    lastLogin: '2024-01-19 16:45:00',
    preferences: {
      currency: 'AED',
      language: 'en',
      notifications: true,
      darkMode: false,
      dashboardLayout: 'default'
    },
    permissions: {
      canTrade: false,
      canRegisterFacilities: false,
      canViewAnalytics: true,
      canExportReports: true,
      canManageUsers: true
    },
    portfolioValue: 0,
    totalRecs: 0,
    verificationStatus: 'verified'
  },
  'demo@rectify.ae': {
    id: '4',
    email: 'demo@rectify.ae',
    password: 'demo123',
    firstName: 'Guest',
    lastName: 'User',
    company: 'RECtify Demo',
    role: 'trader',
    tier: 'basic',
    emirate: 'Dubai',
    joinedDate: '2024-01-20',
    lastLogin: '2024-01-20 10:00:00',
    preferences: {
      currency: 'AED',
      language: 'en',
      notifications: false,
      darkMode: false,
      dashboardLayout: 'default'
    },
    permissions: {
      canTrade: true,
      canRegisterFacilities: false,
      canViewAnalytics: false,
      canExportReports: false,
      canManageUsers: false
    },
    portfolioValue: 45231,
    totalRecs: 1234,
    verificationStatus: 'pending'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('rectify-token');
      if (token) {
        try {
          const response = await apiService.getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            // Invalid token, clear it
            localStorage.removeItem('rectify-token');
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          localStorage.removeItem('rectify-token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.token && response.user) {
        localStorage.setItem('rectify-token', response.token);
        setUser(response.user);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.register({
        email: userData.email!,
        password: userData.password,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        company: userData.company!,
        role: userData.role || 'trader',
        emirate: userData.emirate!
      });
      
      if (response.success && response.token && response.user) {
        localStorage.setItem('rectify-token', response.token);
        setUser(response.user);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('rectify-token');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const response = await apiService.updateProfile(updates);
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      updateProfile,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


