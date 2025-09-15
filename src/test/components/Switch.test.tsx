import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from '../../../components/ui/switch'

describe('Switch Component', () => {
  it('should render switch component', () => {
    render(<Switch />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
  })

  it('should be checked when checked prop is true', () => {
    render(<Switch checked={true} />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  })

  it('should be unchecked when checked prop is false', () => {
    render(<Switch checked={false} />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleCheckedChange = vi.fn()
    render(<Switch onCheckedChange={handleCheckedChange} />)

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    expect(handleCheckedChange).toHaveBeenCalledWith(true)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Switch disabled />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('data-disabled')
  })

  it('should not trigger onCheckedChange when disabled', async () => {
    const user = userEvent.setup()
    const handleCheckedChange = vi.fn()
    render(<Switch disabled onCheckedChange={handleCheckedChange} />)

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    expect(handleCheckedChange).not.toHaveBeenCalled()
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    const handleCheckedChange = vi.fn()
    render(<Switch onCheckedChange={handleCheckedChange} />)

    const switchElement = screen.getByRole('switch')
    await user.tab()
    await user.keyboard(' ')

    expect(handleCheckedChange).toHaveBeenCalledWith(true)
  })

  it('should toggle state on multiple clicks', async () => {
    const user = userEvent.setup()
    const handleCheckedChange = vi.fn()
    render(<Switch onCheckedChange={handleCheckedChange} />)

    const switchElement = screen.getByRole('switch')
    
    // First click
    await user.click(switchElement)
    expect(handleCheckedChange).toHaveBeenCalledWith(true)
    
    // Second click
    await user.click(switchElement)
    expect(handleCheckedChange).toHaveBeenCalledWith(false)
  })
})
