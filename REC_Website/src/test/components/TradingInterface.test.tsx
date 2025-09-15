import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TradingInterface } from '../../../components/TradingInterface'

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
    getAvailableForBuy: vi.fn(),
    getUserHoldings: vi.fn(),
    getUserOrders: vi.fn(),
    createOrder: vi.fn(),
    getOrderBook: vi.fn(),
    getUserTransactions: vi.fn(),
  },
}))

// Mock BlockchainMonitor
vi.mock('../../../components/BlockchainMonitor', () => ({
  default: () => <div data-testid="blockchain-monitor">Blockchain Monitor</div>
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock UI components
vi.mock('../../../components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
}))

vi.mock('../../../components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
}))

vi.mock('../../../components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}))

vi.mock('../../../components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

vi.mock('../../../components/ui/select', () => ({
  Select: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectValue: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

vi.mock('../../../components/ui/tabs', () => ({
  Tabs: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

vi.mock('../../../components/ui/separator', () => ({
  Separator: () => <hr />,
}))

vi.mock('../../../components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}))

vi.mock('../../../components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDialogAction: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AlertDialogCancel: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AlertDialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDialogDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDialogFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDialogHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDialogTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

// Mock data
const mockAvailableForBuy = {
  facilities: [
    {
      facilityName: 'Solar Farm Alpha',
      facilityId: 'facility1',
      energyType: 'solar',
      vintage: 2024,
      emirate: 'Dubai',
      minPrice: 15.50,
      maxPrice: 18.50,
      totalQuantity: 1000,
      orderCount: 5
    }
  ],
  energyTypes: ['solar', 'wind'],
  emirates: ['Dubai', 'Abu Dhabi'],
  vintages: [2024, 2023],
  totalSellOrders: 10
}

const mockHoldings = [
  {
    _id: 'holding1',
    facilityName: 'My Solar Farm',
    facilityId: 'facility2',
    energyType: 'solar',
    vintage: 2024,
    quantity: 500,
    averagePurchasePrice: 16.00,
    totalValue: 8000,
    emirate: 'Dubai',
    certificationStandard: 'I-REC',
    isLocked: false
  }
]

const mockOrderBook = {
  buyOrders: [
    {
      _id: 'order1',
      orderType: 'buy',
      facilityName: 'Solar Farm Alpha',
      energyType: 'solar',
      vintage: 2024,
      quantity: 100,
      remainingQuantity: 100,
      price: 17.50,
      emirate: 'Dubai',
      createdBy: 'user123',
      status: 'active',
      userId: {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Corp'
      }
    }
  ],
  sellOrders: [],
  networkStats: {
    totalActiveOrders: 1,
    totalBuyOrders: 1,
    totalSellOrders: 0,
    uniqueParticipants: 1,
    lastUpdated: new Date().toISOString()
  }
}

describe('TradingInterface', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get the mocked API service
    const { default: apiService } = await import('../../../services/api')
    
    // Setup mock API responses
    vi.mocked(apiService.getAvailableForBuy).mockResolvedValue({
      success: true,
      data: mockAvailableForBuy
    })
    
    vi.mocked(apiService.getUserHoldings).mockResolvedValue({
      success: true,
      data: mockHoldings
    })
    
    vi.mocked(apiService.getOrderBook).mockResolvedValue({
      success: true,
      data: mockOrderBook
    })
    
    vi.mocked(apiService.getUserTransactions).mockResolvedValue({
      success: true,
      data: []
    })
    
    vi.mocked(apiService.createOrder).mockResolvedValue({
      success: true,
      data: { _id: 'new-order' }
    })
  })

  it('should render the trading interface', async () => {
    render(<TradingInterface />)
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Network Trading')).toBeInTheDocument()
    })
    
    expect(screen.getByTestId('blockchain-monitor')).toBeInTheDocument()
  })

  it('should render buy and sell buttons', async () => {
    render(<TradingInterface />)
    
    await waitFor(() => {
      expect(screen.getByText('Buy I-RECs')).toBeInTheDocument()
      expect(screen.getByText('Sell I-RECs')).toBeInTheDocument()
    })
  })

  it('should render energy source selection', async () => {
    render(<TradingInterface />)
    
    await waitFor(() => {
      expect(screen.getByText('Energy Source')).toBeInTheDocument()
    })
  })

  it('should render without crashing', async () => {
    render(<TradingInterface />)
    
    await waitFor(() => {
      expect(screen.getAllByTestId('card')).toHaveLength(2)
    })
  })

  it('should handle API errors gracefully', async () => {
    // Get the mocked API service
    const { default: apiService } = await import('../../../services/api')
    
    // Mock API error
    vi.mocked(apiService.getAvailableForBuy).mockRejectedValue(new Error('API Error'))
    
    render(<TradingInterface />)
    
    // Should still render without crashing
    await waitFor(() => {
      expect(screen.getByText('Network Trading')).toBeInTheDocument()
    })
  })

  it('should render with authenticated user', async () => {
    render(<TradingInterface />)
    
    await waitFor(() => {
      expect(screen.getByText('Network Trading')).toBeInTheDocument()
    })
    
    // Should show user-specific content
    expect(screen.getAllByTestId('card')).toHaveLength(2)
  })
})