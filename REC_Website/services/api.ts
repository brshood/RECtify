const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Debug: Log the API URL being used
console.log('🔍 API_BASE_URL:', API_BASE_URL);
console.log('🔍 VITE_API_URL env var:', import.meta.env.VITE_API_URL);

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
    console.log('🌐 Making API request to:', fullUrl);
    
    try {
      const response = await fetch(fullUrl, {
        headers: this.getAuthHeaders(),
        ...options
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Response data:', data);

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
    
    try {
      return await this.request(`/transactions${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      // If backend is not available, return mock data for testing
      console.warn('Backend not available, returning mock transaction data');
      return this.getMockTransactions(limit, status);
    }
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

  // Mock data for testing when backend is not available
  private getMockTransactions(limit?: number, status?: string): ApiResponse {
    const mockTransactions = [
      {
        _id: "507f1f77bcf86cd799439011",
        internalRef: "TXN-2024-001",
        buyerId: {
          _id: "507f1f77bcf86cd799439012",
          firstName: "Ahmed",
          lastName: "Al Mansouri",
          company: "Emirates Solar Trading LLC"
        },
        sellerId: {
          _id: "507f1f77bcf86cd799439013",
          firstName: "Fatima",
          lastName: "Al Zahra",
          company: "Green Energy Solutions"
        },
        facilityName: "Mohammed bin Rashid Al Maktoum Solar Park Phase IV",
        facilityId: "maktoum-solar-park-phase4",
        energyType: "solar",
        vintage: 2024,
        emirate: "Dubai",
        certificationStandard: "I-REC",
        quantity: 500,
        pricePerUnit: 12.50,
        totalAmount: 6250.00,
        status: "completed",
        settlementStatus: "completed",
        settlementDate: "2024-03-15T10:30:00Z",
        blockchainTxHash: "0x1234567890abcdef",
        registryTransferRef: "AE-I-REC-001234567",
        matchedAt: "2024-03-15T09:00:00Z",
        completedAt: "2024-03-15T10:30:00Z",
        notes: "Completed successfully",
        createdAt: "2024-03-15T08:00:00Z",
        updatedAt: "2024-03-15T10:30:00Z"
      },
      {
        _id: "507f1f77bcf86cd799439014",
        internalRef: "TXN-2024-002",
        buyerId: {
          _id: "507f1f77bcf86cd799439015",
          firstName: "Mohammed",
          lastName: "Al Rashid",
          company: "Sustainable Industries Corp"
        },
        sellerId: {
          _id: "507f1f77bcf86cd799439012",
          firstName: "Ahmed",
          lastName: "Al Mansouri",
          company: "Emirates Solar Trading LLC"
        },
        facilityName: "Taweelah Wind Power Plant",
        facilityId: "taweelah-wind-plant",
        energyType: "wind",
        vintage: 2024,
        emirate: "Abu Dhabi",
        certificationStandard: "I-REC",
        quantity: 250,
        pricePerUnit: 11.80,
        totalAmount: 2950.00,
        status: "pending",
        settlementStatus: "pending",
        matchedAt: "2024-03-14T14:00:00Z",
        notes: "Awaiting settlement",
        createdAt: "2024-03-14T13:00:00Z",
        updatedAt: "2024-03-14T14:00:00Z"
      },
      {
        _id: "507f1f77bcf86cd799439016",
        internalRef: "TXN-2024-003",
        buyerId: {
          _id: "507f1f77bcf86cd799439012",
          firstName: "Ahmed",
          lastName: "Al Mansouri",
          company: "Emirates Solar Trading LLC"
        },
        sellerId: {
          _id: "507f1f77bcf86cd799439013",
          firstName: "Fatima",
          lastName: "Al Zahra",
          company: "Green Energy Solutions"
        },
        facilityName: "Noor Abu Dhabi Solar Plant",
        facilityId: "noor-abu-dhabi-solar",
        energyType: "solar",
        vintage: 2024,
        emirate: "Abu Dhabi",
        certificationStandard: "I-REC",
        quantity: 750,
        pricePerUnit: 13.20,
        totalAmount: 9900.00,
        status: "completed",
        settlementStatus: "completed",
        settlementDate: "2024-03-13T16:45:00Z",
        blockchainTxHash: "0xabcdef1234567890",
        registryTransferRef: "AE-I-REC-001234569",
        matchedAt: "2024-03-13T15:00:00Z",
        completedAt: "2024-03-13T16:45:00Z",
        notes: "ESG compliance purchase",
        createdAt: "2024-03-13T14:00:00Z",
        updatedAt: "2024-03-13T16:45:00Z"
      }
    ];

    let filteredTransactions = mockTransactions;
    
    if (status) {
      filteredTransactions = mockTransactions.filter(t => t.status === status);
    }
    
    if (limit) {
      filteredTransactions = filteredTransactions.slice(0, limit);
    }

    return {
      success: true,
      data: filteredTransactions
    };
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
}

export const apiService = new ApiService();
export default apiService;
