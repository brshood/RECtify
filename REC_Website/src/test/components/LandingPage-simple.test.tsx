import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LandingPage } from '../../../components/LandingPage'

// Mock the InfoModal component
vi.mock('../../../components/InfoModal', () => ({
  InfoModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="info-modal">Info Modal Content</div> : null
  )
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}))

// Mock Iridescence component
vi.mock('../../../components/figma/Iridescence', () => ({
  default: () => <div data-testid="iridescence">Iridescence Component</div>
}))

describe('LandingPage - Simple Tests', () => {
  const mockOnEnterPlatform = vi.fn()
  const mockOnNavigateToEIReports = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )
    
    expect(screen.getByText(/UAE's First Digital/)).toBeInTheDocument()
  })

  it('should render the demo banner', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    expect(screen.getByText(/DEMO ONLY/)).toBeInTheDocument()
  })

  it('should render the main heading components', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    expect(screen.getByText(/UAE's First Digital/)).toBeInTheDocument()
    expect(screen.getByText(/Trading Platform/)).toBeInTheDocument()
  })

  it('should render the subtitle', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    expect(screen.getByText(/Empowering the UAE's renewable energy future/)).toBeInTheDocument()
  })

  it('should render the Enter Trading Platform button', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    const button = screen.getByText('Enter Trading Platform')
    expect(button).toBeInTheDocument()
  })

  it('should call onEnterPlatform when Enter Trading Platform button is clicked', async () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    const user = userEvent.setup()
    const button = screen.getByText('Enter Trading Platform')
    await user.click(button)

    expect(mockOnEnterPlatform).toHaveBeenCalledTimes(1)
  })

  it('should render the Access EI Reports button', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    const button = screen.getByText('Access EI Reports')
    expect(button).toBeInTheDocument()
  })

  it('should call onNavigateToEIReports when Access EI Reports button is clicked', async () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    const user = userEvent.setup()
    const button = screen.getByText('Access EI Reports')
    await user.click(button)

    expect(mockOnNavigateToEIReports).toHaveBeenCalledTimes(1)
  })

  it('should render Iridescence component', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    expect(screen.getByTestId('iridescence')).toBeInTheDocument()
  })

  it('should render Learn More buttons', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    const learnMoreButtons = screen.getAllByText('Learn More')
    expect(learnMoreButtons.length).toBeGreaterThan(0)
  })

  it('should open InfoModal when Learn More button is clicked', async () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    const user = userEvent.setup()
    const learnMoreButtons = screen.getAllByText('Learn More')
    await user.click(learnMoreButtons[0])

    expect(screen.getByTestId('info-modal')).toBeInTheDocument()
  })
})
