import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../../../components/ui/input'

describe('Input Component', () => {
  it('should render input with placeholder', () => {
    render(<Input placeholder="Enter your email" />)

    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
  })

  it('should handle text input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Enter text" />)

    const input = screen.getByPlaceholderText('Enter text')
    await user.type(input, 'Hello World')

    expect(input).toHaveValue('Hello World')
  })

  it('should handle onChange events', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Input placeholder="Enter text" onChange={handleChange} />)

    const input = screen.getByPlaceholderText('Enter text')
    await user.type(input, 'test')

    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input placeholder="Disabled input" disabled />)

    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
  })

  it('should show error state when error prop is provided', () => {
    render(<Input placeholder="Input with error" error="This field is required" />)

    const input = screen.getByPlaceholderText('Input with error')
    expect(input).toHaveClass('border-red-500')
  })

  it('should handle different input types', () => {
    render(<Input type="password" placeholder="Password" />)

    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should handle required attribute', () => {
    render(<Input placeholder="Required field" required />)

    const input = screen.getByPlaceholderText('Required field')
    expect(input).toHaveAttribute('required')
  })

  it('should handle maxLength attribute', () => {
    render(<Input placeholder="Limited input" maxLength={10} />)

    const input = screen.getByPlaceholderText('Limited input')
    expect(input).toHaveAttribute('maxLength', '10')
  })
})
