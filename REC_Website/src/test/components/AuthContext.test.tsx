import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth, User } from '../../../components/AuthContext'
import { apiService } from '../../../services/api'

// Mock the API service
vi.mock('../../../services/api', () => ({
  apiService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    getCurrentUser: vi.fn()
  }
}))

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, logout, updateProfile, isLoading } = useAuth()
  
  return (
    <div>
      <div data-testid="user-info">
        {user ? `${user.firstName} ${user.lastName}` : 'No user'}
      </div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => login('test@test.com', 'password')}>
        Login
      </button>
      <button onClick={() => logout()}>
        Logout
      </button>
      <button onClick={() => updateProfile({ firstName: 'Updated' })}>
        Update Profile
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should provide initial state with no user', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
  })

  it('should handle successful login', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
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

    vi.mocked(apiService.login).mockResolvedValue({
      success: true,
      token: 'mock-token',
      user: mockUser
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe')
    })

    expect(localStorage.setItem).toHaveBeenCalledWith('rectify-token', 'mock-token')
  })

  it('should handle login failure', async () => {
    vi.mocked(apiService.login).mockResolvedValue({
      success: false
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
    })

    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('should handle logout', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
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

    // First login
    vi.mocked(apiService.login).mockResolvedValue({
      success: true,
      token: 'mock-token',
      user: mockUser
    })

    vi.mocked(apiService.logout).mockResolvedValue(undefined)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const user = userEvent.setup()
    
    // Login first
    await user.click(screen.getByText('Login'))
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe')
    })

    // Then logout
    await user.click(screen.getByText('Logout'))

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
    })

    expect(localStorage.removeItem).toHaveBeenCalledWith('rectify-token')
  })

  it('should handle profile update', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
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

    const updatedUser = { ...mockUser, firstName: 'Updated' }

    vi.mocked(apiService.login).mockResolvedValue({
      success: true,
      token: 'mock-token',
      user: mockUser
    })

    vi.mocked(apiService.updateProfile).mockResolvedValue({
      success: true,
      user: updatedUser
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const user = userEvent.setup()
    
    // Login first
    await user.click(screen.getByText('Login'))
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe')
    })

    // Update profile
    await user.click(screen.getByText('Update Profile'))

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('Updated Doe')
    })
  })

  it('should initialize with existing token', async () => {
    localStorage.setItem('rectify-token', 'existing-token')
    
    const mockUser: User = {
      id: '1',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
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

    vi.mocked(apiService.getCurrentUser).mockResolvedValue({
      success: true,
      user: mockUser
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe')
    })

    expect(apiService.getCurrentUser).toHaveBeenCalled()
  })

  it('should clear token on invalid authentication', async () => {
    localStorage.setItem('rectify-token', 'invalid-token')
    
    vi.mocked(apiService.getCurrentUser).mockResolvedValue({
      success: false
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
    })

    expect(localStorage.removeItem).toHaveBeenCalledWith('rectify-token')
  })
})
