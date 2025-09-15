import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../../../components/ui/badge'

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Test Badge</Badge>)
    
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('should render badge with variant', () => {
    render(<Badge variant="destructive">Error Badge</Badge>)
    
    expect(screen.getByText('Error Badge')).toBeInTheDocument()
  })

  it('should render badge with outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>)
    
    expect(screen.getByText('Outline Badge')).toBeInTheDocument()
  })

  it('should render badge with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>)
    
    expect(screen.getByText('Secondary Badge')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>)
    
    const badge = screen.getByText('Custom Badge')
    expect(badge).toHaveClass('custom-class')
  })
})
