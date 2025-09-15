import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceChart } from '../../../components/PriceChart'

// Mock recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke, strokeWidth, dot, name }: any) => (
    <div 
      data-testid={`line-${dataKey}`}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-name={name}
    />
  ),
  XAxis: ({ dataKey, tick, tickFormatter }: any) => (
    <div 
      data-testid="x-axis"
      data-data-key={dataKey}
      data-tick-formatter={tickFormatter ? 'yes' : 'no'}
    />
  ),
  YAxis: ({ tick, tickFormatter }: any) => (
    <div 
      data-testid="y-axis"
      data-tick-formatter={tickFormatter ? 'yes' : 'no'}
    />
  ),
  CartesianGrid: ({ strokeDasharray }: any) => (
    <div 
      data-testid="cartesian-grid"
      data-stroke-dasharray={strokeDasharray}
    />
  ),
  Tooltip: ({ labelFormatter, formatter, contentStyle }: any) => (
    <div 
      data-testid="tooltip"
      data-label-formatter={labelFormatter ? 'yes' : 'no'}
      data-formatter={formatter ? 'yes' : 'no'}
      data-content-style={JSON.stringify(contentStyle)}
    />
  ),
  ResponsiveContainer: ({ children, width, height }: any) => (
    <div 
      data-testid="responsive-container"
      data-width={width}
      data-height={height}
    >
      {children}
    </div>
  )
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />
}))

describe('PriceChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the chart title', () => {
    render(<PriceChart />)

    expect(screen.getByText('UAE I-REC Price Trends')).toBeInTheDocument()
  })

  it('should render the trending up icon', () => {
    render(<PriceChart />)

    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
  })

  it('should render the currency badge', () => {
    render(<PriceChart />)

    expect(screen.getByText('AED/MWh')).toBeInTheDocument()
  })

  it('should render the chart description', () => {
    render(<PriceChart />)

    expect(screen.getByText('Real-time pricing from UAE certified renewable facilities')).toBeInTheDocument()
  })

  it('should render the line chart', () => {
    render(<PriceChart />)

    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('should render the responsive container', () => {
    render(<PriceChart />)

    const responsiveContainer = screen.getByTestId('responsive-container')
    expect(responsiveContainer).toBeInTheDocument()
    expect(responsiveContainer).toHaveAttribute('data-width', '100%')
    expect(responsiveContainer).toHaveAttribute('data-height', '100%')
  })

  it('should render the cartesian grid', () => {
    render(<PriceChart />)

    const grid = screen.getByTestId('cartesian-grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveAttribute('data-stroke-dasharray', '3 3')
  })

  it('should render the X-axis', () => {
    render(<PriceChart />)

    const xAxis = screen.getByTestId('x-axis')
    expect(xAxis).toBeInTheDocument()
    expect(xAxis).toHaveAttribute('data-data-key', 'date')
    expect(xAxis).toHaveAttribute('data-tick-formatter', 'yes')
  })

  it('should render the Y-axis', () => {
    render(<PriceChart />)

    const yAxis = screen.getByTestId('y-axis')
    expect(yAxis).toBeInTheDocument()
    expect(yAxis).toHaveAttribute('data-tick-formatter', 'yes')
  })

  it('should render the tooltip', () => {
    render(<PriceChart />)

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveAttribute('data-label-formatter', 'yes')
    expect(tooltip).toHaveAttribute('data-formatter', 'yes')
  })

  it('should render all three data lines (solar, wind, nuclear)', () => {
    render(<PriceChart />)

    expect(screen.getByTestId('line-solar')).toBeInTheDocument()
    expect(screen.getByTestId('line-wind')).toBeInTheDocument()
    expect(screen.getByTestId('line-nuclear')).toBeInTheDocument()
  })

  it('should render solar line with correct properties', () => {
    render(<PriceChart />)

    const solarLine = screen.getByTestId('line-solar')
    expect(solarLine).toHaveAttribute('data-stroke', 'var(--rectify-green)')
    expect(solarLine).toHaveAttribute('data-stroke-width', '2.5')
    expect(solarLine).toHaveAttribute('data-name', 'Solar')
  })

  it('should render wind line with correct properties', () => {
    render(<PriceChart />)

    const windLine = screen.getByTestId('line-wind')
    expect(windLine).toHaveAttribute('data-stroke', 'var(--rectify-blue)')
    expect(windLine).toHaveAttribute('data-stroke-width', '2.5')
    expect(windLine).toHaveAttribute('data-name', 'Wind')
  })

  it('should render nuclear line with correct properties', () => {
    render(<PriceChart />)

    const nuclearLine = screen.getByTestId('line-nuclear')
    expect(nuclearLine).toHaveAttribute('data-stroke', '#8b5cf6')
    expect(nuclearLine).toHaveAttribute('data-stroke-width', '2.5')
    expect(nuclearLine).toHaveAttribute('data-name', 'Nuclear')
  })

  it('should render the legend', () => {
    render(<PriceChart />)

    expect(screen.getByText('Solar PV')).toBeInTheDocument()
    expect(screen.getByText('Wind')).toBeInTheDocument()
    expect(screen.getByText('Nuclear')).toBeInTheDocument()
  })

  it('should render the market insight section', () => {
    render(<PriceChart />)

    expect(screen.getByText(/Market Insight:/)).toBeInTheDocument()
    expect(screen.getByText(/Solar I-RECs show seasonal trends/)).toBeInTheDocument()
  })

  it('should contain price data for all months', () => {
    render(<PriceChart />)

    const lineChart = screen.getByTestId('line-chart')
    const chartData = JSON.parse(lineChart.getAttribute('data-chart-data') || '[]')
    
    // Should have data for multiple months
    expect(chartData.length).toBeGreaterThan(10)
    
    // Should have solar, wind, and nuclear data for each entry
    chartData.forEach((entry: any) => {
      expect(entry).toHaveProperty('date')
      expect(entry).toHaveProperty('solar')
      expect(entry).toHaveProperty('wind')
      expect(entry).toHaveProperty('nuclear')
    })
  })

  it('should have realistic price ranges', () => {
    render(<PriceChart />)

    const lineChart = screen.getByTestId('line-chart')
    const chartData = JSON.parse(lineChart.getAttribute('data-chart-data') || '[]')
    
    // Check that prices are within reasonable ranges
    chartData.forEach((entry: any) => {
      expect(entry.solar).toBeGreaterThan(0)
      expect(entry.solar).toBeLessThan(50)
      expect(entry.wind).toBeGreaterThan(0)
      expect(entry.wind).toBeLessThan(50)
      expect(entry.nuclear).toBeGreaterThan(0)
      expect(entry.nuclear).toBeLessThan(50)
    })
  })

  it('should show seasonal price variations', () => {
    render(<PriceChart />)

    const lineChart = screen.getByTestId('line-chart')
    const chartData = JSON.parse(lineChart.getAttribute('data-chart-data') || '[]')
    
    // Find summer months (should have lower solar prices)
    const summerData = chartData.filter((entry: any) => {
      const month = new Date(entry.date).getMonth()
      return month >= 4 && month <= 8 // May to September
    })
    
    // Find winter months (should have higher solar prices)
    const winterData = chartData.filter((entry: any) => {
      const month = new Date(entry.date).getMonth()
      return month <= 1 || month >= 11 // December to February
    })
    
    if (summerData.length > 0 && winterData.length > 0) {
      const avgSummerSolar = summerData.reduce((sum: number, entry: any) => sum + entry.solar, 0) / summerData.length
      const avgWinterSolar = winterData.reduce((sum: number, entry: any) => sum + entry.solar, 0) / winterData.length
      
      // Summer should have lower solar prices than winter
      expect(avgSummerSolar).toBeLessThan(avgWinterSolar)
    }
  })
})
