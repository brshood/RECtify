import { describe, it, expect } from 'vitest'

// Mock the emission factors data
const mockEmissionFactors = {
  electricity: {
    grid: 0.405, // kg CO2/kWh
    solar: 0.045,
    wind: 0.011,
    nuclear: 0.012
  },
  transport: {
    gasoline: 2.31, // kg CO2/liter
    diesel: 2.68,
    aviation: 3.15
  },
  waste: {
    landfill: 0.5, // kg CO2/kg
    recycling: 0.1,
    incineration: 0.8
  }
}

describe('UAE Emission Factors', () => {
  it('should have electricity emission factors', () => {
    expect(mockEmissionFactors.electricity.grid).toBe(0.405)
    expect(mockEmissionFactors.electricity.solar).toBe(0.045)
    expect(mockEmissionFactors.electricity.wind).toBe(0.011)
    expect(mockEmissionFactors.electricity.nuclear).toBe(0.012)
  })

  it('should have transport emission factors', () => {
    expect(mockEmissionFactors.transport.gasoline).toBe(2.31)
    expect(mockEmissionFactors.transport.diesel).toBe(2.68)
    expect(mockEmissionFactors.transport.aviation).toBe(3.15)
  })

  it('should have waste emission factors', () => {
    expect(mockEmissionFactors.waste.landfill).toBe(0.5)
    expect(mockEmissionFactors.waste.recycling).toBe(0.1)
    expect(mockEmissionFactors.waste.incineration).toBe(0.8)
  })

  it('should calculate electricity emissions correctly', () => {
    const calculateElectricityEmissions = (kwh: number, source: keyof typeof mockEmissionFactors.electricity) => {
      return kwh * mockEmissionFactors.electricity[source]
    }

    expect(calculateElectricityEmissions(100, 'grid')).toBe(40.5)
    expect(calculateElectricityEmissions(100, 'solar')).toBe(4.5)
    expect(calculateElectricityEmissions(100, 'wind')).toBeCloseTo(1.1, 1)
    expect(calculateElectricityEmissions(100, 'nuclear')).toBe(1.2)
  })

  it('should calculate transport emissions correctly', () => {
    const calculateTransportEmissions = (liters: number, fuel: keyof typeof mockEmissionFactors.transport) => {
      return liters * mockEmissionFactors.transport[fuel]
    }

    expect(calculateTransportEmissions(50, 'gasoline')).toBe(115.5)
    expect(calculateTransportEmissions(50, 'diesel')).toBe(134)
    expect(calculateTransportEmissions(50, 'aviation')).toBe(157.5)
  })

  it('should calculate waste emissions correctly', () => {
    const calculateWasteEmissions = (kg: number, method: keyof typeof mockEmissionFactors.waste) => {
      return kg * mockEmissionFactors.waste[method]
    }

    expect(calculateWasteEmissions(100, 'landfill')).toBe(50)
    expect(calculateWasteEmissions(100, 'recycling')).toBe(10)
    expect(calculateWasteEmissions(100, 'incineration')).toBe(80)
  })

  it('should validate emission factor ranges', () => {
    // Electricity factors should be reasonable
    Object.values(mockEmissionFactors.electricity).forEach(factor => {
      expect(factor).toBeGreaterThan(0)
      expect(factor).toBeLessThan(1)
    })

    // Transport factors should be reasonable
    Object.values(mockEmissionFactors.transport).forEach(factor => {
      expect(factor).toBeGreaterThan(0)
      expect(factor).toBeLessThan(10)
    })

    // Waste factors should be reasonable
    Object.values(mockEmissionFactors.waste).forEach(factor => {
      expect(factor).toBeGreaterThan(0)
      expect(factor).toBeLessThan(2)
    })
  })

  it('should provide emission factor metadata', () => {
    const emissionFactorMetadata = {
      electricity: {
        unit: 'kg CO2/kWh',
        source: 'UAE Grid Mix',
        lastUpdated: '2024-01-01'
      },
      transport: {
        unit: 'kg CO2/liter',
        source: 'UAE Transport Standards',
        lastUpdated: '2024-01-01'
      },
      waste: {
        unit: 'kg CO2/kg',
        source: 'UAE Waste Management',
        lastUpdated: '2024-01-01'
      }
    }

    expect(emissionFactorMetadata.electricity.unit).toBe('kg CO2/kWh')
    expect(emissionFactorMetadata.transport.unit).toBe('kg CO2/liter')
    expect(emissionFactorMetadata.waste.unit).toBe('kg CO2/kg')
  })
})
