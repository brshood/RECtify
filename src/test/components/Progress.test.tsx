import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress } from '../../../components/ui/progress'

describe('Progress Component', () => {
  it('should render progress component', () => {
    render(<Progress value={50} />)

    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toBeInTheDocument()
  })

  it('should display correct progress value', () => {
    render(<Progress value={75} />)

    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toHaveAttribute('aria-valuenow', '75')
  })

  it('should handle zero progress', () => {
    render(<Progress value={0} />)

    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toHaveAttribute('aria-valuenow', '0')
  })

  it('should handle maximum progress', () => {
    render(<Progress value={100} />)

    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toHaveAttribute('aria-valuenow', '100')
  })

  it('should handle undefined value', () => {
    render(<Progress />)

    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toHaveAttribute('aria-valuenow', '0')
  })

  it('should have correct accessibility attributes', () => {
    render(<Progress value={50} />)

    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toHaveAttribute('aria-valuemin', '0')
    expect(progressElement).toHaveAttribute('aria-valuemax', '100')
    expect(progressElement).toHaveAttribute('aria-valuenow', '50')
  })

  it('should handle custom className', () => {
    render(<Progress value={50} className="custom-progress" />)

    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toHaveClass('custom-progress')
  })

  it('should handle fractional values', () => {
    render(<Progress value={33.33} />)

    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toHaveAttribute('aria-valuenow', '33.33')
  })
})
