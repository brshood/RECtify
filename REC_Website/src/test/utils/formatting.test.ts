import { describe, it, expect } from 'vitest'

// Test utility functions for formatting
describe('Formatting Utilities', () => {
  it('should format currency correctly', () => {
    const formatCurrency = (amount: number, currency: string = 'AED') => {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: currency
      }).format(amount)
    }

    expect(formatCurrency(1000)).toBe('AED\u00a01,000.00')
    expect(formatCurrency(1500, 'USD')).toBe('$1,500.00')
    expect(formatCurrency(0)).toBe('AED\u00a00.00')
  })

  it('should format numbers correctly', () => {
    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('en-AE').format(num)
    }

    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1500000)).toBe('1,500,000')
    expect(formatNumber(0)).toBe('0')
  })

  it('should format dates correctly', () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-AE')
    }

    const testDate = new Date('2024-01-15')
    expect(formatDate(testDate)).toBe('15/01/2024')
  })

  it('should format percentages correctly', () => {
    const formatPercentage = (value: number) => {
      return `${value.toFixed(1)}%`
    }

    expect(formatPercentage(85.67)).toBe('85.7%')
    expect(formatPercentage(0)).toBe('0.0%')
    expect(formatPercentage(100)).toBe('100.0%')
  })

  it('should format file sizes correctly', () => {
    const formatFileSize = (bytes: number) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      if (bytes === 0) return '0 Bytes'
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    expect(formatFileSize(0)).toBe('0 Bytes')
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1048576)).toBe('1 MB')
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })

  it('should truncate text correctly', () => {
    const truncateText = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    expect(truncateText('Short text', 20)).toBe('Short text')
    expect(truncateText('This is a very long text that should be truncated', 20)).toBe('This is a very long ...')
  })

  it('should validate email format', () => {
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user@rectify.ae')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
    expect(isValidEmail('test@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
  })

  it('should generate random IDs', () => {
    const generateId = () => {
      return Math.random().toString(36).substr(2, 9)
    }

    const id1 = generateId()
    const id2 = generateId()
    
    expect(id1).toBeDefined()
    expect(id2).toBeDefined()
    expect(id1).not.toBe(id2)
    expect(id1.length).toBe(9)
  })
})
