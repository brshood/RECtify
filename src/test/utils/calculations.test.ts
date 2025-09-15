import { describe, it, expect } from 'vitest'

describe('Calculation Utilities', () => {
  describe('REC Price Calculations', () => {
    it('should calculate total REC value correctly', () => {
      const calculateTotalValue = (quantity: number, pricePerREC: number) => {
        return quantity * pricePerREC
      }

      expect(calculateTotalValue(100, 50.00)).toBe(5000.00)
      expect(calculateTotalValue(50, 75.50)).toBe(3775.00)
      expect(calculateTotalValue(25, 100.00)).toBe(2500.00)
    })

    it('should calculate trading fees correctly', () => {
      const calculateTradingFee = (totalValue: number, feeRate: number = 0.02) => {
        return totalValue * feeRate
      }

      expect(calculateTradingFee(1000, 0.02)).toBe(20.00)
      expect(calculateTradingFee(5000, 0.015)).toBe(75.00)
      expect(calculateTradingFee(10000, 0.01)).toBe(100.00)
    })

    it('should calculate net proceeds after fees', () => {
      const calculateNetProceeds = (totalValue: number, feeRate: number = 0.02) => {
        const fee = totalValue * feeRate
        return totalValue - fee
      }

      expect(calculateNetProceeds(1000, 0.02)).toBe(980.00)
      expect(calculateNetProceeds(5000, 0.015)).toBe(4925.00)
      expect(calculateNetProceeds(10000, 0.01)).toBe(9900.00)
    })
  })

  describe('Portfolio Calculations', () => {
    it('should calculate portfolio value correctly', () => {
      const holdings = [
        { quantity: 100, price: 50.00 },
        { quantity: 50, price: 75.00 },
        { quantity: 25, price: 100.00 }
      ]

      const calculatePortfolioValue = (holdings: Array<{ quantity: number; price: number }>) => {
        return holdings.reduce((total, holding) => total + (holding.quantity * holding.price), 0)
      }

      expect(calculatePortfolioValue(holdings)).toBe(10000.00)
    })

    it('should calculate portfolio performance percentage', () => {
      const calculatePerformance = (currentValue: number, initialValue: number) => {
        return ((currentValue - initialValue) / initialValue) * 100
      }

      expect(calculatePerformance(11000, 10000)).toBe(10.00)
      expect(calculatePerformance(9000, 10000)).toBe(-10.00)
      expect(calculatePerformance(10000, 10000)).toBe(0.00)
    })

    it('should calculate average purchase price', () => {
      const transactions = [
        { quantity: 100, price: 50.00 },
        { quantity: 50, price: 60.00 },
        { quantity: 25, price: 70.00 }
      ]

      const calculateAveragePrice = (transactions: Array<{ quantity: number; price: number }>) => {
        const totalCost = transactions.reduce((sum, t) => sum + (t.quantity * t.price), 0)
        const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0)
        return totalCost / totalQuantity
      }

      expect(calculateAveragePrice(transactions)).toBe(56.00)
    })
  })

  describe('Emissions Calculations', () => {
    it('should calculate CO2 emissions avoided', () => {
      const calculateEmissionsAvoided = (recQuantity: number, emissionFactor: number) => {
        return recQuantity * emissionFactor
      }

      expect(calculateEmissionsAvoided(100, 0.8)).toBe(80.00)
      expect(calculateEmissionsAvoided(50, 1.2)).toBe(60.00)
      expect(calculateEmissionsAvoided(25, 0.5)).toBe(12.50)
    })

    it('should calculate emissions reduction percentage', () => {
      const calculateReductionPercentage = (baselineEmissions: number, currentEmissions: number) => {
        return ((baselineEmissions - currentEmissions) / baselineEmissions) * 100
      }

      expect(calculateReductionPercentage(1000, 800)).toBe(20.00)
      expect(calculateReductionPercentage(1000, 900)).toBe(10.00)
      expect(calculateReductionPercentage(1000, 1000)).toBe(0.00)
    })

    it('should calculate equivalent trees planted', () => {
      const calculateTreesEquivalent = (emissionsAvoided: number, treeAbsorptionRate: number = 22) => {
        return emissionsAvoided / treeAbsorptionRate
      }

      expect(calculateTreesEquivalent(220, 22)).toBe(10)
      expect(calculateTreesEquivalent(440, 22)).toBe(20)
      expect(calculateTreesEquivalent(110, 22)).toBe(5)
    })
  })

  describe('Date and Time Calculations', () => {
    it('should calculate days until expiration', () => {
      const calculateDaysUntilExpiration = (expirationDate: Date, currentDate: Date = new Date()) => {
        const timeDiff = expirationDate.getTime() - currentDate.getTime()
        return Math.ceil(timeDiff / (1000 * 3600 * 24))
      }

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)

      expect(calculateDaysUntilExpiration(futureDate)).toBe(30)
    })

    it('should check if REC is expired', () => {
      const isExpired = (expirationDate: Date, currentDate: Date = new Date()) => {
        return currentDate > expirationDate
      }

      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      expect(isExpired(pastDate)).toBe(true)
      expect(isExpired(futureDate)).toBe(false)
    })

    it('should calculate holding period in days', () => {
      const calculateHoldingPeriod = (purchaseDate: Date, currentDate: Date = new Date()) => {
        const timeDiff = currentDate.getTime() - purchaseDate.getTime()
        return Math.ceil(timeDiff / (1000 * 3600 * 24))
      }

      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 30)

      expect(calculateHoldingPeriod(pastDate)).toBe(30)
    })
  })

  describe('Validation Utilities', () => {
    it('should validate REC quantity', () => {
      const isValidQuantity = (quantity: number) => {
        return quantity > 0 && Number.isInteger(quantity)
      }

      expect(isValidQuantity(1)).toBe(true)
      expect(isValidQuantity(100)).toBe(true)
      expect(isValidQuantity(0)).toBe(false)
      expect(isValidQuantity(-1)).toBe(false)
      expect(isValidQuantity(1.5)).toBe(false)
    })

    it('should validate price range', () => {
      const isValidPrice = (price: number, minPrice: number = 0.01, maxPrice: number = 1000) => {
        return price >= minPrice && price <= maxPrice
      }

      expect(isValidPrice(0.01)).toBe(true)
      expect(isValidPrice(100.50)).toBe(true)
      expect(isValidPrice(1000)).toBe(true)
      expect(isValidPrice(0)).toBe(false)
      expect(isValidPrice(-1)).toBe(false)
      expect(isValidPrice(1001)).toBe(false)
    })

    it('should validate email format', () => {
      const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      expect(isValidEmail('test@rectify.ae')).toBe(true)
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('admin@test.org')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
    })

    it('should validate UAE phone number', () => {
      const isValidUAEPhone = (phone: string) => {
        const phoneRegex = /^(\+971|971|0)?[1-9][0-9]{7}$/
        return phoneRegex.test(phone.replace(/\s/g, ''))
      }

      expect(isValidUAEPhone('+971501234567')).toBe(true)
      expect(isValidUAEPhone('971501234567')).toBe(true)
      expect(isValidUAEPhone('0501234567')).toBe(true)
      expect(isValidUAEPhone('501234567')).toBe(true)
      expect(isValidUAEPhone('123456789')).toBe(false)
      expect(isValidUAEPhone('050123456')).toBe(false)
    })
  })
})
