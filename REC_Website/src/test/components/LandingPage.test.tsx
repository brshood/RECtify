import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LandingPage } from '../../../components/LandingPage'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    textarea: ({ children, ...props }: any) => <textarea {...props}>{children}</textarea>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>
  }
}))

// Mock Iridescence component
vi.mock('../../../components/figma/Iridescence', () => ({
  default: ({ children }: any) => <div data-testid="iridescence">{children}</div>
}))

// Mock EmailJS
vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn().mockResolvedValue({ status: 200 })
  }
}))

// Mock InfoModal
vi.mock('../../../components/InfoModal', () => ({
  InfoModal: ({ isOpen, onClose, onEnterPlatform }: any) => (
    isOpen ? (
      <div data-testid="info-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onEnterPlatform}>Enter Platform</button>
      </div>
    ) : null
  )
}))

describe('LandingPage', () => {
  const mockOnEnterPlatform = vi.fn()
  const mockOnNavigateToEIReports = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the main heading', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    // Check that the heading contains all parts (text is broken up by span)
    expect(screen.getByText(/UAE's First Digital/)).toBeInTheDocument()
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'SPAN' && element?.textContent === 'I-REC'
    })).toBeInTheDocument()
    // Check for "Trading Platform" specifically in the H1 heading
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'H1' && element?.textContent?.includes('Trading Platform')
    })).toBeInTheDocument()
  })

  it('should render the Arabic text', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    // Use getAllByText and check that at least one exists
    expect(screen.getAllByText('ريكتيفاي - منصة تداول شهادات الطاقة المتجددة الرقمية الأولى في دولة الإمارات')).toHaveLength(2)
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

  it('should render the logo', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    // Use getAllByAltText since there are multiple logos
    const logos = screen.getAllByAltText('RECtify Logo')
    expect(logos).toHaveLength(2)
    expect(logos[0]).toHaveAttribute('src', '/logo.png')
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

  it('should call onEnterPlatform when Enter Trading Platform button is clicked', async () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByText('Enter Trading Platform'))

    expect(mockOnEnterPlatform).toHaveBeenCalledTimes(1)
  })

  it('should call onNavigateToEIReports when Access EI Reports button is clicked', async () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByText('Access EI Reports'))

    expect(mockOnNavigateToEIReports).toHaveBeenCalledTimes(1)
  })

  it('should render the Learn More button', () => {
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
    // Get the first "Learn More" button (there are multiple)
    const learnMoreButtons = screen.getAllByText('Learn More')
    await user.click(learnMoreButtons[0])

    expect(screen.getByTestId('info-modal')).toBeInTheDocument()
  })

  it('should render the demo notice', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    expect(screen.getByText(/DEMO ONLY/)).toBeInTheDocument()
  })

  it('should render the main heading', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    expect(screen.getByText(/UAE's First Digital/)).toBeInTheDocument()
    // Use getAllByText since "Trading Platform" appears multiple times
    expect(screen.getAllByText(/Trading Platform/)).toHaveLength(4)
    // Check for I-REC in the main heading specifically
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'SPAN' && element?.textContent === 'I-REC'
    })).toBeInTheDocument()
  })

  it('should render the subtitle text', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    expect(screen.getByText(/Empowering the UAE's renewable energy future/)).toBeInTheDocument()
  })

  it('should render the Arabic text', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    // Check for Arabic text in the main heading specifically
    expect(screen.getAllByText((content, element) => {
      return element?.tagName === 'DIV' && 
             element?.textContent?.includes('ريكتيفاي') &&
             element?.getAttribute('dir') === 'rtl'
    })).toHaveLength(2)
  })

  it('should render the logo', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    // Use getAllByAltText since there are multiple logos
    const logos = screen.getAllByAltText('RECtify Logo')
    expect(logos).toHaveLength(2)
    expect(logos[0]).toHaveAttribute('src', '/logo.png')
  })

  it('should render the contact form', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    expect(screen.getByLabelText(/Your Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Subject/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument()
  })

  it('should submit contact form successfully', async () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    const user = userEvent.setup()
    
    await user.type(screen.getByLabelText(/Your Name/), 'John Doe')
    await user.type(screen.getByLabelText(/Email Address/), 'john@example.com')
    await user.type(screen.getByLabelText(/Subject/), 'Test Subject')
    await user.type(screen.getByLabelText(/Message/), 'Test message')

    await user.click(screen.getByText('Send Message'))

    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
    })
  })

  it('should render the footer with contact information', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    expect(screen.getByText('Contact Information')).toBeInTheDocument()
    expect(screen.getByText('+971 50 683 5444')).toBeInTheDocument()
    expect(screen.getByText('alsamrikhaled@gmail.com')).toBeInTheDocument()
  })

  it('should render stats section', () => {
    render(
      <LandingPage 
        onEnterPlatform={mockOnEnterPlatform}
        onNavigateToEIReports={mockOnNavigateToEIReports}
      />
    )

    expect(screen.getByText('MWh Available')).toBeInTheDocument()
    expect(screen.getByText('Platform Uptime')).toBeInTheDocument()
    expect(screen.getByText('Trading Available')).toBeInTheDocument()
  })
})
