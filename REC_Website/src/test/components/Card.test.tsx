import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'

describe('Card Components', () => {
  it('should render Card with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )
    
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should render CardHeader with title', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      </Card>
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render CardContent with content', () => {
    render(
      <Card>
        <CardContent>
          <p>Card content text</p>
        </CardContent>
      </Card>
    )
    
    expect(screen.getByText('Card content text')).toBeInTheDocument()
  })

  it('should render complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the card content</p>
        </CardContent>
      </Card>
    )
    
    expect(screen.getByText('Complete Card')).toBeInTheDocument()
    expect(screen.getByText('This is the card content')).toBeInTheDocument()
  })
})
