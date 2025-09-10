const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// API configuration for production

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: T;
  token?: string;
  errors?: any[];
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('rectify-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(fullUrl, {
        headers: this.getAuthHeaders(),
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company: string;
    role: string;
    emirate: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/auth/me');
  }

  async updateProfile(updates: any): Promise<ApiResponse> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // User management (admin only)
  async getUserStats(): Promise<ApiResponse> {
    return this.request('/users/stats');
  }

  // Holdings endpoints
  async getUserHoldings(): Promise<ApiResponse> {
    return this.request('/holdings');
  }

  async getHolding(id: string): Promise<ApiResponse> {
    return this.request(`/holdings/${id}`);
  }

  async createHolding(holdingData: {
    facilityName: string;
    facilityId: string;
    energyType: string;
    vintage: number;
    quantity: number;
    averagePurchasePrice: number;
    emirate: string;
    certificationStandard?: string;
  }): Promise<ApiResponse> {
    return this.request('/holdings', {
      method: 'POST',
      body: JSON.stringify(holdingData)
    });
  }

  async lockHolding(id: string, lockUntil?: string): Promise<ApiResponse> {
    return this.request(`/holdings/${id}/lock`, {
      method: 'PUT',
      body: JSON.stringify({ lockUntil })
    });
  }

  async unlockHolding(id: string): Promise<ApiResponse> {
    return this.request(`/holdings/${id}/unlock`, {
      method: 'PUT'
    });
  }

  // Orders endpoints
  async getUserOrders(status?: string, type?: string, limit?: number): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    return this.request(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrderBook(limit?: number): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    return this.request(`/orders/book${queryString ? `?${queryString}` : ''}`);
  }

  async getAvailableForBuy(filters?: {
    energyType?: string;
    emirate?: string;
    vintage?: number;
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters?.energyType) params.append('energyType', filters.energyType);
    if (filters?.emirate) params.append('emirate', filters.emirate);
    if (filters?.vintage) params.append('vintage', filters.vintage.toString());
    
    const queryString = params.toString();
    
    try {
      return await this.request(`/orders/available-for-buy${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      // If backend is not available, return empty data structure
      console.warn('Backend not available for available-for-buy, returning empty data');
      return {
        success: true,
        message: 'No data available',
        data: {
          facilities: [],
          energyTypes: [],
          emirates: [],
          vintages: [],
          totalSellOrders: 0
        }
      };
    }
  }

  async createBuyOrder(orderData: {
    facilityName: string;
    facilityId: string;
    energyType: string;
    vintage: number;
    quantity: number;
    price: number;
    emirate: string;
    purpose: string;
    certificationStandard?: string;
    expiresAt?: string;
    allowPartialFill?: boolean;
    minFillQuantity?: number;
  }): Promise<ApiResponse> {
    return this.request('/orders/buy', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async createSellOrder(orderData: {
    holdingId: string;
    quantity: number;
    price: number;
    expiresAt?: string;
    allowPartialFill?: boolean;
    minFillQuantity?: number;
  }): Promise<ApiResponse> {
    return this.request('/orders/sell', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async cancelOrder(id: string): Promise<ApiResponse> {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PUT'
    });
  }

  async getOrder(id: string): Promise<ApiResponse> {
    return this.request(`/orders/${id}`);
  }

  // Transactions endpoints
  async getUserTransactions(limit?: number, status?: string): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    
    return await this.request(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getTransactionHistory(limit?: number): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    
    try {
      return await this.request(`/transactions/history${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }


  async getTransaction(id: string): Promise<ApiResponse> {
    return this.request(`/transactions/${id}`);
  }

  async getMarketStats(timeframe?: string): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (timeframe) params.append('timeframe', timeframe);
    
    const queryString = params.toString();
    return this.request(`/transactions/market/stats${queryString ? `?${queryString}` : ''}`);
  }

  async getPriceHistory(facilityName: string, days?: number): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    
    const queryString = params.toString();
    return this.request(`/transactions/market/price-history/${encodeURIComponent(facilityName)}${queryString ? `?${queryString}` : ''}`);
  }

  // Payments
  async getBalance(): Promise<ApiResponse> {
    return this.request('/payments/balance');
  }

  async createTopupIntent(amount: number, currency: 'aed' | 'usd' = 'aed'): Promise<ApiResponse> {
    return this.request('/payments/create-topup-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency })
    });
  }
}

export const apiService = new ApiService();
export default apiService;
