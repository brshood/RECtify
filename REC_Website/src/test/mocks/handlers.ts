import { http, HttpResponse } from 'msw'

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string }
    
    // Mock demo users
    const demoUsers = {
      'ahmed.alshamsi@adnoc.ae': { password: 'demo123', user: 'ahmed' },
      'fatima.hassan@masdar.ae': { password: 'demo123', user: 'fatima' },
      'demo@rectify.ae': { password: 'demo123', user: 'demo' }
    }
    
    const userData = demoUsers[email as keyof typeof demoUsers]
    if (userData && userData.password === password) {
      return HttpResponse.json({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email,
          firstName: userData.user,
          lastName: 'User',
          company: 'Demo Company',
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
      })
    }
    
    return HttpResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const userData = await request.json()
    return HttpResponse.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 'new-user-id',
        ...userData,
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
    })
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      user: {
        id: '1',
        email: 'demo@rectify.ae',
        firstName: 'Demo',
        lastName: 'User',
        company: 'Demo Company',
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
    })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true })
  }),

  // Profile update
  http.put('/api/user/profile', async ({ request }) => {
    const updates = await request.json()
    return HttpResponse.json({
      success: true,
      user: {
        id: '1',
        email: 'demo@rectify.ae',
        firstName: 'Demo',
        lastName: 'User',
        company: 'Demo Company',
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
          dashboardLayout: 'default',
          ...updates.preferences
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
    })
  }),

  // Holdings endpoints
  http.get('/api/holdings', () => {
    return HttpResponse.json({
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
    })
  }),

  // Transactions endpoints
  http.get('/api/transactions', () => {
    return HttpResponse.json({
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
    })
  }),

  // Orders endpoints
  http.get('/api/orders', () => {
    return HttpResponse.json({
      success: true,
      orders: []
    })
  }),

  // Market data endpoints
  http.get('/api/market-data', () => {
    return HttpResponse.json({
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
    })
  }),

  // Error simulation endpoints
  http.get('/api/error-test', () => {
    return HttpResponse.json(
      { success: false, message: 'Test error' },
      { status: 500 }
    )
  })
]
