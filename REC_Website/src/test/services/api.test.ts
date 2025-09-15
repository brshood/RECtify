import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiService } from '../../../services/api'

// Mock fetch
Object.defineProperty(globalThis, 'fetch', {
  value: vi.fn(),
  writable: true
})

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage properly
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    localStorage.clear()
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@rectify.ae',
          firstName: 'Test',
          lastName: 'User',
          company: 'Test Company',
          role: 'trader',
          tier: 'premium',
          emirate: 'Dubai',
          joinedDate: '2024-01-01',
          lastLogin: new Date().toISOString(),
          preferences: {
            currency: 'AED',
            language: 'en',
            notifications: true,
            darkMode: false,
            dashboardLayout: 'default'
          },
          permissions: {
            canTrade: true,
            canRegisterFacilities: false,
            canViewAnalytics: true,
            canExportReports: true,
            canManageUsers: false
          },
          portfolioValue: 100000,
          totalRecs: 1000,
          verificationStatus: 'verified'
        }
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await apiService.login('test@rectify.ae', 'demo123')

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@rectify.ae',
          password: 'demo123'
        })
      })
    })

    it('should handle login failure with invalid credentials', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials'
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      await expect(apiService.login('invalid@test.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      await expect(apiService.login('test@test.com', 'password'))
        .rejects.toThrow('Network error')
    })
  })

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockResponse = {
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 'new-user-id',
          email: 'newuser@rectify.ae',
          firstName: 'New',
          lastName: 'User',
          company: 'New Company',
          role: 'trader',
          tier: 'basic',
          emirate: 'Dubai',
          joinedDate: '2024-01-20',
          lastLogin: new Date().toISOString(),
          preferences: {
            currency: 'AED',
            language: 'en',
            notifications: true,
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
          verificationStatus: 'pending'
        }
      }

      const registrationData = {
        email: 'newuser@rectify.ae',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        company: 'New Company',
        role: 'trader' as const,
        emirate: 'Dubai'
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await apiService.register(registrationData)

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })
    })

    it('should handle registration failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Email already exists'
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      await expect(apiService.register({
        email: 'existing@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        company: 'Test Company',
        role: 'trader',
        emirate: 'Dubai'
      })).rejects.toThrow('Email already exists')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user with valid token', async () => {
      // Mock localStorage to return a token
      vi.spyOn(localStorage, 'getItem').mockReturnValue('valid-token')
      
      const mockResponse = {
        success: true,
        user: {
          id: '1',
          email: 'test@rectify.ae',
          firstName: 'Test',
          lastName: 'User',
          company: 'Test Company',
          role: 'trader',
          tier: 'premium',
          emirate: 'Dubai',
          joinedDate: '2024-01-01',
          lastLogin: new Date().toISOString(),
          preferences: {
            currency: 'AED',
            language: 'en',
            notifications: true,
            darkMode: false,
            dashboardLayout: 'default'
          },
          permissions: {
            canTrade: true,
            canRegisterFacilities: false,
            canViewAnalytics: true,
            canExportReports: true,
            canManageUsers: false
          },
          portfolioValue: 100000,
          totalRecs: 1000,
          verificationStatus: 'verified'
        }
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await apiService.getCurrentUser()

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        }
      })
    })

    it('should handle invalid token', async () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('invalid-token')
      
      const mockResponse = {
        success: false,
        message: 'Invalid token'
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      await expect(apiService.getCurrentUser())
        .rejects.toThrow('Invalid token')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Mock localStorage to return a token
      vi.spyOn(localStorage, 'getItem').mockReturnValue('valid-token')
      
      const mockResponse = {
        success: true
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await apiService.logout()

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        }
      })
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      // Mock localStorage to return a token
      vi.spyOn(localStorage, 'getItem').mockReturnValue('valid-token')
      
      const updates = {
        firstName: 'Updated',
        preferences: {
          darkMode: true
        }
      }

      const mockResponse = {
        success: true,
        user: {
          id: '1',
          email: 'test@rectify.ae',
          firstName: 'Updated',
          lastName: 'User',
          company: 'Test Company',
          role: 'trader',
          tier: 'premium',
          emirate: 'Dubai',
          joinedDate: '2024-01-01',
          lastLogin: new Date().toISOString(),
          preferences: {
            currency: 'AED',
            language: 'en',
            notifications: true,
            darkMode: true,
            dashboardLayout: 'default'
          },
          permissions: {
            canTrade: true,
            canRegisterFacilities: false,
            canViewAnalytics: true,
            canExportReports: true,
            canManageUsers: false
          },
          portfolioValue: 100000,
          totalRecs: 1000,
          verificationStatus: 'verified'
        }
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await apiService.updateProfile(updates)

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
    })

    it('should handle profile update failure', async () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('valid-token')
      
      const mockResponse = {
        success: false,
        message: 'Update failed'
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      await expect(apiService.updateProfile({ firstName: 'Updated' }))
        .rejects.toThrow('Update failed')
    })
  })

  describe('getUserHoldings', () => {
    it('should fetch holdings successfully', async () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('valid-token')
      
      const mockResponse = {
        success: true,
        holdings: [
          {
            id: '1',
            certificateId: 'REC-2024-001',
            type: 'solar',
            quantity: 100,
            purchasePrice: 15.50,
            purchaseDate: '2024-01-15',
            status: 'active',
            facility: 'Solar Farm Alpha'
          }
        ]
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await apiService.getUserHoldings()

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/holdings', {
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        }
      })
    })
  })

  describe('getUserTransactions', () => {
    it('should fetch transactions successfully', async () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('valid-token')
      
      const mockResponse = {
        success: true,
        transactions: [
          {
            id: '1',
            type: 'purchase',
            certificateType: 'solar',
            quantity: 100,
            price: 15.50,
            totalAmount: 1550,
            timestamp: new Date().toISOString(),
            status: 'completed'
          }
        ]
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await apiService.getUserTransactions()

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/transactions', {
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        }
      })
    })
  })

  describe('getMarketStats', () => {
    it('should fetch market data successfully', async () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('valid-token')
      
      const mockResponse = {
        success: true,
        data: {
          currentPrices: {
            solar: 18.5,
            wind: 22.3,
            nuclear: 14.2
          },
          trends: {
            solar: 'up',
            wind: 'down',
            nuclear: 'stable'
          }
        }
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await apiService.getMarketStats()

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/transactions/market/stats', {
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json',
        }
      })
    })
  })
})
