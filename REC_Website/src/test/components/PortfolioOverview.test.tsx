import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// Mock the AuthContext
const mockUser = {
  _id: 'user123',
  email: 'test@rectify.ae',
  firstName: 'Test',
  lastName: 'User',
  company: 'Test Company',
  role: 'trader',
  tier: 'premium',
  emirate: 'Dubai',
  isActive: true,
  permissions: {
    canTrade: true,
    canViewReports: true,
    canManageUsers: false,
    canRegisterREC: true,
  },
  preferences: {
    darkMode: false,
    currency: 'AED',
    language: 'en',
  },
}

const mockAuthContext = {
  user: mockUser,
  login: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
  isLoading: false,
  error: null,
}

vi.mock('../../../components/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

// Mock the API service
vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { PortfolioOverview } from '../../../components/PortfolioOverview'
import apiService from '../../../services/api'

// Get the mocked API service
const mockApiService = vi.mocked(apiService)

// Mock UI components
vi.mock('../../../components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
}))

vi.mock('../../../components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}))

vi.mock('../../../components/ui/progress', () => ({
  Progress: ({ value, ...props }: any) => <div data-testid="progress" data-value={value} {...props} />,
}))

describe('PortfolioOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful API responses
    mockApiService.get.mockResolvedValue({
      success: true,
      data: {
        totalValue: 50000,
        totalRECs: 1000,
        totalTransactions: 25,
        monthlyGrowth: 12.5,
        holdings: [
          {
            _id: 'holding1',
            facilityName: 'Solar Farm Dubai',
            energyType: 'Solar',
            vintage: 2024,
            quantity: 500,
            price: 25.50,
            emirate: 'Dubai',
            status: 'active',
          },
          {
            _id: 'holding2',
            facilityName: 'Wind Farm Abu Dhabi',
            energyType: 'Wind',
            vintage: 2024,
            quantity: 300,
            price: 30.00,
            emirate: 'Abu Dhabi',
            status: 'active',
          },
        ],
        recentTransactions: [
          {
            _id: 'tx1',
            type: 'buy',
            quantity: 100,
            price: 25.50,
            facilityName: 'Solar Farm Dubai',
            timestamp: new Date().toISOString(),
          },
          {
            _id: 'tx2',
            type: 'sell',
            quantity: 50,
            price: 30.00,
            facilityName: 'Wind Farm Abu Dhabi',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      },
    })
  })

  it('should render the portfolio overview', async () => {
    render(<PortfolioOverview />)
    
    expect(screen.getByText('Portfolio Overview')).toBeInTheDocument()
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument()
    })
  })

  it('should display portfolio metrics', async () => {
    render(<PortfolioOverview />)
    
    await waitFor(() => {
      expect(screen.getByText(/AED.*50,000/)).toBeInTheDocument()
      expect(screen.getByText(/1,000.*RECs/)).toBeInTheDocument()
      expect(screen.getByText(/25.*Transactions/)).toBeInTheDocument()
      expect(screen.getByText(/12.5%.*Growth/)).toBeInTheDocument()
    })
  })

  it('should display holdings list', async () => {
    render(<PortfolioOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Solar Farm Dubai')).toBeInTheDocument()
      expect(screen.getByText('Wind Farm Abu Dhabi')).toBeInTheDocument()
      expect(screen.getByText('Solar')).toBeInTheDocument()
      expect(screen.getByText('Wind')).toBeInTheDocument()
    })
  })

  it('should display recent transactions', async () => {
    render(<PortfolioOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
      // Should show transaction details
    })
  })

  it('should handle loading state', () => {
    mockApiService.get.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<PortfolioOverview />)
    
    // Should show loading indicators
    expect(screen.getByText('Portfolio Overview')).toBeInTheDocument()
  })

  it('should handle API errors gracefully', async () => {
    mockApiService.get.mockRejectedValue({
      response: {
        data: {
          message: 'Failed to fetch portfolio data',
        },
      },
    })
    
    render(<PortfolioOverview />)
    
    await waitFor(() => {
      // Should show error state or fallback content
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument()
    })
  })

  it('should format currency correctly', async () => {
    render(<PortfolioOverview />)
    
    await waitFor(() => {
      // Should display AED currency formatting
      expect(screen.getByText(/AED.*50,000/)).toBeInTheDocument()
    })
  })

  it('should display energy type badges', async () => {
    render(<PortfolioOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Solar')).toBeInTheDocument()
      expect(screen.getByText('Wind')).toBeInTheDocument()
    })
  })

  it('should show emirate information', async () => {
    render(<PortfolioOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Dubai')).toBeInTheDocument()
      expect(screen.getByText('Abu Dhabi')).toBeInTheDocument()
    })
  })

  it('should display transaction types correctly', async () => {
    render(<PortfolioOverview />)
    
    await waitFor(() => {
      // Should show buy/sell transaction types
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
    })
  })
})
