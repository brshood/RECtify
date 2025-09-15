# RECtify Testing Guide

This document provides comprehensive information about the testing setup and strategy for the RECtify platform.

## 🧪 Testing Stack

- **Test Runner**: Vitest (fast, Vite-native)
- **Testing Library**: React Testing Library
- **User Interactions**: @testing-library/user-event
- **API Mocking**: MSW (Mock Service Worker)
- **Coverage**: @vitest/coverage-v8
- **Environment**: jsdom

## 📁 Test Structure

```
src/test/
├── setup.ts                 # Global test setup
├── utils.tsx                # Testing utilities and helpers
├── mocks/
│   ├── server.ts           # MSW server setup
│   └── handlers.ts         # API mock handlers
├── components/             # Component tests
│   ├── AuthContext.test.tsx
│   ├── LandingPage.test.tsx
│   └── PriceChart.test.tsx
├── services/               # Service tests
│   └── api.test.ts
└── integration/            # Integration tests
    └── user-flows.test.tsx
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Specific Test Patterns

```bash
# Run tests matching a pattern
npm test -- --grep "AuthContext"

# Run tests in a specific file
npm test -- src/test/components/LandingPage.test.tsx

# Run tests with specific coverage thresholds
npm test -- --coverage --coverage.thresholds.global.lines=90
```

## 📊 Coverage Goals

Our test coverage targets:

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Current Coverage Areas

✅ **Well Covered**:
- Authentication flows
- Component rendering
- User interactions
- API service calls
- Form submissions

🔄 **In Progress**:
- Error boundary testing
- Performance testing
- Accessibility testing

📋 **Planned**:
- E2E testing with Playwright
- Visual regression testing
- Load testing

## 🧩 Test Categories

### 1. Unit Tests
Test individual components and functions in isolation.

**Examples**:
- Component rendering
- Props handling
- State management
- Utility functions

### 2. Integration Tests
Test how different parts of the application work together.

**Examples**:
- User authentication flow
- Dashboard navigation
- Form submission workflows
- API integration

### 3. Component Tests
Test React components with realistic user interactions.

**Examples**:
- Button clicks
- Form inputs
- Modal interactions
- Navigation

## 🔧 Testing Utilities

### Custom Render Function
```tsx
import { render } from '@test/utils'

// Renders with all necessary providers
render(<MyComponent />, { user: mockUser })
```

### Mock Data Generators
```tsx
import { generateMockHoldings, generateMockTransactions } from '@test/utils'

const holdings = generateMockHoldings(10)
const transactions = generateMockTransactions(5)
```

### User Event Helpers
```tsx
import { userEventHelpers } from '@test/utils'

await userEventHelpers.fillForm(formElement, {
  email: 'test@example.com',
  password: 'password123'
})
```

## 🎭 Mocking Strategy

### API Mocking with MSW
All API calls are mocked using Mock Service Worker:

```tsx
// Handles all /api/* requests
const handlers = [
  http.post('/api/auth/login', () => {
    return HttpResponse.json(mockLoginResponse)
  }),
  // ... more handlers
]
```

### Component Mocking
Heavy components are mocked for faster testing:

```tsx
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))
```

## 📝 Writing Tests

### Test Structure
Follow the AAA pattern:

```tsx
describe('ComponentName', () => {
  it('should do something when condition is met', async () => {
    // Arrange
    const mockData = { /* test data */ }
    
    // Act
    render(<Component data={mockData} />)
    await user.click(screen.getByText('Button'))
    
    // Assert
    expect(screen.getByText('Expected Result')).toBeInTheDocument()
  })
})
```

### Best Practices

1. **Descriptive Test Names**: Use clear, descriptive test names
2. **Single Responsibility**: Each test should test one thing
3. **Realistic Data**: Use realistic mock data
4. **User-Centric**: Test from the user's perspective
5. **Cleanup**: Always cleanup after tests

### Common Patterns

```tsx
// Testing async operations
await waitFor(() => {
  expect(screen.getByText('Loaded content')).toBeInTheDocument()
})

// Testing form submissions
await user.type(screen.getByLabelText('Email'), 'test@example.com')
await user.click(screen.getByText('Submit'))

// Testing error states
expect(screen.getByText('Error message')).toBeInTheDocument()

// Testing loading states
expect(screen.getByText('Loading...')).toBeInTheDocument()
```

## 🔍 Debugging Tests

### Vitest UI
Use the Vitest UI for interactive debugging:

```bash
npm run test:ui
```

### Debug Mode
Run tests in debug mode:

```bash
npm test -- --reporter=verbose
```

### Coverage Reports
Generate detailed coverage reports:

```bash
npm run test:coverage
```

View the HTML report in `coverage/index.html`

## 🚨 Common Issues & Solutions

### Issue: Tests timing out
**Solution**: Increase timeout or check for async operations

```tsx
it('should handle async operation', async () => {
  // ... test code
}, 10000) // 10 second timeout
```

### Issue: Mock not working
**Solution**: Ensure mocks are properly hoisted

```tsx
// Move vi.mock() calls to the top of the file
vi.mock('module-name', () => ({ /* mock */ }))
```

### Issue: DOM not found
**Solution**: Use proper queries and wait for elements

```tsx
await waitFor(() => {
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

## 📈 Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Scheduled runs

### CI Configuration
```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage
```

## 🎯 Future Enhancements

1. **E2E Testing**: Add Playwright for end-to-end tests
2. **Visual Testing**: Add visual regression tests
3. **Performance Testing**: Add performance benchmarks
4. **Accessibility Testing**: Add a11y tests
5. **Load Testing**: Add stress tests for API endpoints

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain coverage thresholds
4. Update this documentation if needed

For questions about testing, please reach out to the development team.
