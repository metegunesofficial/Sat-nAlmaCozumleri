# Testing Strategy

Comprehensive testing strategy for the Multi-Tenant B2B Procurement Platform.

## Test Coverage Goals

- **Unit Tests**: 70%+ coverage
- **Integration Tests**: Critical API routes
- **E2E Tests**: Core user flows

## Testing Stack

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **GitHub Actions**: Continuous Integration

## Running Tests

### All Tests
```bash
npm test              # Watch mode
npm run test:ci       # CI mode with coverage
```

### Unit Tests
```bash
npm run test:unit     # Run unit tests only
```

### Integration Tests
```bash
npm run test:integration  # Run API integration tests
```

### E2E Tests
```bash
npm run test:e2e      # Run Playwright E2E tests
npm run test:e2e:ui   # Run with Playwright UI
```

## Test Structure

```
__tests__/
├── unit/                    # Unit tests
│   ├── rate-limit.test.ts   # Rate limiter tests
│   ├── logger.test.ts       # Logger and PII redaction tests
│   └── authz.test.ts        # Authorization helper tests
├── integration/             # Integration tests
│   ├── api-users.test.ts    # User API tests
│   ├── api-requests.test.ts # Purchase request API tests
│   └── api-reports.test.ts  # Reports API tests
└── e2e/                     # End-to-end tests
    ├── login.spec.ts        # Login flow
    ├── purchase-request.spec.ts  # Create request flow
    └── admin.spec.ts        # Admin operations
```

## Unit Tests

Unit tests focus on individual functions and utilities:

- **Rate Limiter**: Tests for request limiting, client identification, preset configurations
- **Logger**: Tests for PII redaction, structured logging, request tracking
- **Authorization**: Tests for permission checks, role validation, company scoping
- **Utilities**: Tests for helper functions, data transformations, validators

### Example Unit Test

```typescript
import { rateLimit } from '@/lib/rate-limit'

describe('Rate Limiter', () => {
  it('should allow requests within limit', async () => {
    const result = await rateLimit('user-1', 5, { interval: 60000 })
    expect(result.success).toBe(true)
  })

  it('should block requests exceeding limit', async () => {
    // Use up limit
    for (let i = 0; i < 5; i++) {
      await rateLimit('user-2', 5, { interval: 60000 })
    }

    // Next request should fail
    const result = await rateLimit('user-2', 5, { interval: 60000 })
    expect(result.success).toBe(false)
  })
})
```

## Integration Tests

Integration tests verify API routes with database mocking:

- **User API**: CRUD operations, authentication, authorization
- **Purchase Request API**: Creation, approval workflow, status updates
- **Reports API**: Data aggregation, filtering, permissions
- **Admin API**: Company management, user provisioning

### Example Integration Test

```typescript
import { GET } from '@/app/api/users/route'

describe('API /api/users', () => {
  it('should return users from same company only', async () => {
    const request = new NextRequest('http://localhost/api/users')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

## E2E Tests

E2E tests verify complete user workflows:

- **Authentication**: Login, logout, session persistence
- **Purchase Requests**: Create, submit, approve, reject
- **Admin Operations**: User management, company settings
- **Reports**: Generate reports, export data

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test'

test('should create purchase request', async ({ page }) => {
  await page.goto('/requests/new')

  await page.getByLabel('Category').selectOption('Office Supplies')
  await page.getByLabel('Product').selectOption('Laptop')
  await page.getByLabel('Quantity').fill('2')

  await page.getByRole('button', { name: 'Submit' }).click()

  await expect(page).toHaveURL(/\/requests\/\d+/)
  await expect(page.getByText('Request Created')).toBeVisible()
})
```

## CI/CD Pipeline

GitHub Actions workflow runs on every push and pull request:

1. **Lint**: ESLint code quality checks
2. **Type Check**: TypeScript compilation
3. **Unit Tests**: Fast isolated tests
4. **Integration Tests**: API tests with PostgreSQL
5. **E2E Tests**: Full user flows with Playwright
6. **Build**: Production build verification
7. **Security Scan**: npm audit and Snyk
8. **Coverage Check**: Enforce 70% threshold

### CI Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, 'claude/**']
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --ci --coverage
```

## Coverage Requirements

Minimum coverage thresholds enforced in CI:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Coverage reports are uploaded to Codecov for tracking over time.

## Best Practices

### Writing Tests

1. **Descriptive Names**: Use clear test descriptions
2. **Arrange-Act-Assert**: Structure tests in three parts
3. **Mock External Dependencies**: Isolate code under test
4. **Test Edge Cases**: Cover error paths and boundaries
5. **Keep Tests Fast**: Unit tests should run in milliseconds

### Mocking

```typescript
// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn().mockResolvedValue([...]),
    }
  }
}))

// Mock NextAuth
jest.mock('@/lib/session', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: { id: '123', role: 'ADMIN' }
  })
}))
```

### Test Data

- Use realistic but sanitized test data
- Create reusable test fixtures
- Seed database with consistent test data for E2E tests

## Security Testing

- **PII Redaction**: Verify sensitive data is redacted in logs
- **Rate Limiting**: Test abuse prevention mechanisms
- **Authentication**: Verify unauthorized access is blocked
- **Authorization**: Test permission and role checks
- **Input Validation**: Test SQL injection, XSS prevention

## Performance Testing

- Monitor test execution time
- Optimize slow tests
- Use test database for integration tests
- Parallelize test execution where possible

## Debugging Tests

### Jest
```bash
# Run specific test
npm test -- rate-limit.test.ts

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright
```bash
# Run with UI mode
npm run test:e2e:ui

# Debug specific test
npx playwright test --debug login.spec.ts
```

## Continuous Improvement

- Review and update tests with code changes
- Monitor test flakiness in CI
- Increase coverage for critical paths
- Add regression tests for bugs
- Update test documentation

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)
