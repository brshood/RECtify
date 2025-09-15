# RECtify Testing Guide - How to Run Tests and Achieve 90%+ Coverage

## 🎯 Current Status

### ✅ What's Working
- **Frontend**: 41 passing tests, basic UI components covered
- **Backend**: Auth middleware at 90% coverage, basic test framework set up
- **Configuration**: Jest and Vitest properly configured
- **Documentation**: Comprehensive testing strategy created

### 📊 Current Coverage
- **Frontend**: ~0.87% (needs expansion)
- **Backend**: ~1.2% (needs expansion)
- **Auth Middleware**: 90% coverage ✅

## 🚀 How to Run Tests

### Frontend Tests (REC_Website)

```bash
# Navigate to frontend directory
cd REC_Website

# Run all tests
npm test

# Run tests once (no watch mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Run specific test file
npm test src/test/components/Button.test.tsx

# Run tests with UI
npm run test:ui
```

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Run all tests (with database)
npm test

# Run simple tests (no database required)
npx jest --config jest.config.simple.js

# Run specific test file
npx jest tests/middleware/auth-simple.test.js

# Run with coverage
npx jest --coverage
```

### Combined Test Runner

```bash
# From project root
node run-tests.js
```

## 📈 Achieving 90%+ Coverage

### Phase 1: Frontend Expansion (Target: 60% coverage)

#### 1. Core Component Tests
```bash
# Create these test files:
REC_Website/src/test/components/AuthContext.test.tsx
REC_Website/src/test/components/LandingPage.test.tsx
REC_Website/src/test/components/Dashboard.test.tsx
REC_Website/src/test/components/LoginForm.test.tsx
REC_Website/src/test/components/UserProfile.test.tsx
```

#### 2. Business Logic Tests
```bash
# Create these test files:
REC_Website/src/test/components/TradingInterface.test.tsx
REC_Website/src/test/components/PortfolioOverview.test.tsx
REC_Website/src/test/components/PriceChart.test.tsx
REC_Website/src/test/components/MarketData.test.tsx
```

#### 3. Utility and Service Tests
```bash
# Create these test files:
REC_Website/src/test/services/api.test.ts
REC_Website/src/test/utils/theme.test.ts
REC_Website/src/test/utils/storage.test.ts
```

### Phase 2: Backend Expansion (Target: 70% coverage)

#### 1. Model Tests (Database-free)
```bash
# Create these test files:
backend/tests/models/User.test.js
backend/tests/models/Order.test.js
backend/tests/models/Transaction.test.js
backend/tests/models/RECHolding.test.js
```

#### 2. Route Tests (Mocked)
```bash
# Create these test files:
backend/tests/routes/auth.test.js
backend/tests/routes/users.test.js
backend/tests/routes/holdings.test.js
backend/tests/routes/orders.test.js
backend/tests/routes/transactions.test.js
```

#### 3. Service Tests
```bash
# Create these test files:
backend/tests/services/RECSecurityService.test.js
backend/tests/services/RECTradingService.test.js
```

### Phase 3: Integration Tests (Target: 20% coverage)

#### 1. API Integration
```bash
# Create these test files:
backend/tests/integration/auth-flow.test.js
backend/tests/integration/trading-flow.test.js
frontend/src/test/integration/user-flows.test.tsx
```

## 🛠️ Test Creation Templates

### Frontend Component Test Template
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentName } from '../../../components/ComponentName'

// Mock dependencies
vi.mock('../../../services/api')
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  }
}))

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render component', () => {
    render(<ComponentName />)
    expect(screen.getByTestId('component')).toBeInTheDocument()
  })

  it('should handle user interactions', () => {
    render(<ComponentName />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    // Add assertions
  })
})
```

### Backend Route Test Template
```javascript
const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  it('should handle successful login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@rectify.ae',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  it('should handle validation errors', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });
});
```

## 📊 Coverage Monitoring

### Coverage Thresholds
```javascript
// jest.config.js / vitest.config.ts
coverageThreshold: {
  global: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

### Coverage Reports
- **HTML Reports**: Generated in `coverage/` directories
- **Console Output**: Shows coverage percentages
- **CI/CD Integration**: GitHub Actions with coverage badges

## 🔧 Troubleshooting

### Common Issues

#### 1. Import Path Errors
```bash
# Fix: Update import paths in test files
# Wrong: import { Component } from '../../components/Component'
# Right: import { Component } from '../../../components/Component'
```

#### 2. Mock Issues
```bash
# Fix: Ensure mocks are properly set up
vi.mock('module-name', () => ({
  default: vi.fn(),
  functionName: vi.fn()
}))
```

#### 3. Database Connection Issues
```bash
# Fix: Use simple test config for backend
npx jest --config jest.config.simple.js
```

#### 4. Coverage Not Updating
```bash
# Fix: Clear coverage cache
rm -rf coverage/
npm run test:coverage
```

## 🎯 Success Metrics

### Target Coverage Goals
- **Frontend**: 90%+ statements, branches, functions, lines
- **Backend**: 90%+ statements, branches, functions, lines
- **Combined**: 90%+ overall coverage

### Quality Gates
- All tests passing ✅
- Coverage thresholds met ✅
- No linting errors ✅
- CI/CD pipeline green ✅

## 📚 Resources

### Documentation
- [Testing Strategy](./TESTING_STRATEGY.md) - Comprehensive testing plan
- [Vitest Documentation](https://vitest.dev/) - Frontend testing
- [Jest Documentation](https://jestjs.io/) - Backend testing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Component testing

### Test Files Created
- `run-tests.js` - Combined test runner
- `TESTING_STRATEGY.md` - Detailed testing plan
- `backend/tests/setup-simple.js` - Simple test setup
- `backend/jest.config.simple.js` - Simple Jest config
- `backend/tests/middleware/auth-simple.test.js` - Auth middleware tests

## 🚀 Next Steps

1. **Immediate**: Run existing tests to verify setup
2. **Week 1**: Create core component tests
3. **Week 2**: Create business logic tests
4. **Week 3**: Create integration tests
5. **Week 4**: Optimize and achieve 90%+ coverage

## 💡 Pro Tips

1. **Start Small**: Begin with simple component tests
2. **Mock Everything**: Mock external dependencies
3. **Test Behavior**: Focus on what users do, not implementation details
4. **Coverage First**: Aim for high coverage, then optimize
5. **CI/CD**: Integrate tests into your deployment pipeline

---

**Goal**: Achieve 90%+ test coverage for both frontend and backend
**Timeline**: 4 weeks
**Status**: Foundation complete, ready for expansion
