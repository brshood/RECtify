import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'
import { AuthProvider } from '../components/AuthContext'

// Mock user data for testing
export const mockUser = {
  id: '1',
  email: 'test@rectify.ae',
  firstName: 'Test',
  lastName: 'User',
  company: 'Test Company',
  role: 'trader' as const,
  tier: 'premium' as const,
  emirate: 'Dubai',
  joinedDate: '2024-01-01',
  lastLogin: new Date().toISOString(),
  preferences: {
    currency: 'AED' as const,
    language: 'en' as const,
    notifications: true,
    darkMode: false,
    dashboardLayout: 'default' as const
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
  verificationStatus: 'verified' as const
}

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: typeof mockUser | null
}

const AllTheProviders = ({ children, user }: { children: React.ReactNode; user?: typeof mockUser | null }) => {
  // Mock the AuthContext with the provided user
  const mockAuthContext = {
    user,
    login: vi.fn().mockResolvedValue(true),
    signup: vi.fn().mockResolvedValue(true),
    logout: vi.fn().mockResolvedValue(undefined),
    updateProfile: vi.fn().mockResolvedValue(undefined),
    isLoading: false
  }

  // Replace the AuthProvider with our mock
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user = null, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders user={user}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Utility functions for testing
export const createMockFile = (name: string, type: string, size: number = 1024): File => {
  const file = new File(['mock content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    })
  }
}

export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock data generators
export const generateMockHoldings = (count: number = 5) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${index + 1}`,
    certificateId: `REC-2024-${String(index + 1).padStart(3, '0')}`,
    type: ['solar', 'wind', 'nuclear'][index % 3] as 'solar' | 'wind' | 'nuclear',
    quantity: Math.floor(Math.random() * 1000) + 100,
    purchasePrice: Math.floor(Math.random() * 30) + 10,
    purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active' as const,
    facility: `Facility ${index + 1}`
  }))
}

export const generateMockTransactions = (count: number = 10) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${index + 1}`,
    type: ['purchase', 'sale'][index % 2] as 'purchase' | 'sale',
    certificateType: ['solar', 'wind', 'nuclear'][index % 3] as 'solar' | 'wind' | 'nuclear',
    quantity: Math.floor(Math.random() * 500) + 50,
    price: Math.floor(Math.random() * 30) + 10,
    totalAmount: 0, // Will be calculated
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: ['completed', 'pending', 'cancelled'][index % 3] as 'completed' | 'pending' | 'cancelled'
  })).map(transaction => ({
    ...transaction,
    totalAmount: transaction.quantity * transaction.price
  }))
}

// Test helpers for common user interactions
export const userEventHelpers = {
  async fillForm(element: HTMLElement, data: Record<string, string>) {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    for (const [field, value] of Object.entries(data)) {
      const input = element.querySelector(`[name="${field}"]`) as HTMLInputElement
      if (input) {
        await user.clear(input)
        await user.type(input, value)
      }
    }
  },

  async clickButton(element: HTMLElement, text: string) {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    const button = element.querySelector(`button:has-text("${text}")`) || 
                   element.querySelector(`[role="button"]:has-text("${text}")`)
    
    if (button) {
      await user.click(button as HTMLElement)
    }
  }
}
