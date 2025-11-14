# Test Suite Documentation

This directory contains comprehensive test coverage for the Attelia Dental B2B E-Commerce platform.

## Test Structure

```
__tests__/
├── unit/                    # Unit tests for utility functions
│   └── lib/
│       ├── auth.test.ts     # Authentication utilities (45+ tests)
│       └── utils.test.ts    # Helper functions (35+ tests)
├── integration/             # Integration tests for API routes
│   ├── purchase-requests.test.ts    # Purchase request creation (20+ tests)
│   ├── approval-workflow.test.ts    # Approval logic (18+ tests)
│   ├── order-processing.test.ts     # Order and stock management (20+ tests)
│   └── budget-reporting.test.ts     # Budget calculations (20+ tests)
└── api/                     # API endpoint tests
    ├── authentication.test.ts       # Login/auth endpoints (25+ tests)
    └── rbac.test.ts                 # Role-based access control (20+ tests)
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Test Categories

### 1. Unit Tests (80+ tests)

#### Authentication Functions (`lib/auth.test.ts`)
- **Password Hashing**: bcrypt hashing with salt
- **Password Verification**: Correct/incorrect password validation
- **Token Generation**: JWT creation with 7-day expiry
- **Token Verification**: Valid/invalid/expired token handling
- **Integration Flows**: Complete auth workflows

**Key Coverage:**
- ✅ Password security (bcrypt, salt)
- ✅ JWT token lifecycle
- ✅ Edge cases (empty, null, special characters)
- ✅ All user roles (7 roles)

#### Utility Functions (`lib/utils.test.ts`)
- **Price Formatting**: Turkish Lira (₺) formatting
- **Date Formatting**: Turkish locale date display
- **Slug Generation**: Turkish character normalization (ğ→g, ş→s, etc.)
- **Order Number Generation**: ATLYYYYMMDDnnnn format

**Key Coverage:**
- ✅ Turkish language support
- ✅ Format consistency
- ✅ Edge cases (zero, negative, empty)
- ✅ Number padding and formatting

### 2. Integration Tests (78+ tests)

#### Purchase Request Creation (`purchase-requests.test.ts`)
- **Authentication**: Token validation
- **Role-Based Filtering**: EMPLOYEE, DEPARTMENT_MANAGER, ADMIN
- **Request Creation**: Workflow assignment, amount calculation
- **Business Logic**: Request number generation, item creation

**Key Coverage:**
- ✅ JWT authentication on all endpoints
- ✅ Role-based data filtering
- ✅ Automatic workflow assignment
- ✅ Estimated total calculation
- ✅ Unique request number generation

#### Approval Workflow (`approval-workflow.test.ts`)
- **Multi-Step Approval**: Sequential approval chain
- **State Transitions**: SUBMITTED → IN_REVIEW → APPROVED/REJECTED
- **Role Authorization**: Step-based approver validation
- **Actions**: APPROVED, REJECTED, RETURNED

**Key Coverage:**
- ✅ Step progression logic
- ✅ Role-based approval authorization
- ✅ State machine transitions
- ✅ Approval history tracking
- ✅ ADMIN/GENERAL_MANAGER override

#### Order Processing (`order-processing.test.ts`)
- **Cart to Order**: Conversion flow
- **Tax Calculation**: 18% KDV (Turkish VAT)
- **Stock Management**: Decrement on order
- **Price Logic**: Discount price vs regular price

**Key Coverage:**
- ✅ Cart validation (empty cart)
- ✅ 18% tax calculation accuracy
- ✅ Stock decrement/salesCount increment
- ✅ Cart clearing after order
- ✅ Order number uniqueness
- ✅ Shipping/billing address handling

#### Budget Reporting (`budget-reporting.test.ts`)
- **Budget Calculation**: Spent, reserved, available
- **Utilization**: Percentage calculation
- **Status**: Critical (>90%), Warning (>75%), Normal
- **Time Ranges**: Monthly and yearly aggregation

**Key Coverage:**
- ✅ Accurate financial calculations
- ✅ Utilization percentage
- ✅ Status classification (critical/warning/normal)
- ✅ Date range filtering
- ✅ Summary aggregation
- ✅ Null/zero handling

### 3. API Tests (45+ tests)

#### Authentication (`authentication.test.ts`)
- **Input Validation**: Email/password required
- **User Lookup**: Case-sensitive email matching
- **Password Verification**: bcrypt comparison
- **Security**: Password not in response, error messages

**Key Coverage:**
- ✅ Input validation (missing fields)
- ✅ User not found (401)
- ✅ Invalid password (401)
- ✅ Successful login (token + user)
- ✅ Password excluded from response
- ✅ All 7 user roles
- ✅ Security best practices

#### RBAC - Role-Based Access Control (`rbac.test.ts`)
- **Workflow Read Access**: 4 roles can view
- **Workflow Write Access**: 2 roles can create
- **Access Denial**: 3 roles denied
- **Cross-Company Isolation**: Company-specific data

**Key Coverage:**
- ✅ Granular role permissions
- ✅ Read vs Write differentiation
- ✅ Access denial (403)
- ✅ Company data isolation
- ✅ Token validation
- ✅ Role hierarchy

## Test Coverage Goals

| Module | Target | Current Status |
|--------|--------|----------------|
| `lib/auth.ts` | 100% | ✅ Comprehensive |
| `lib/utils.ts` | 100% | ✅ Comprehensive |
| Purchase Requests API | 85%+ | ✅ Comprehensive |
| Approval Workflow API | 90%+ | ✅ Comprehensive |
| Orders API | 90%+ | ✅ Comprehensive |
| Budget Reports API | 85%+ | ✅ Comprehensive |
| Authentication API | 90%+ | ✅ Comprehensive |
| RBAC | 80%+ | ✅ Comprehensive |

## Key Testing Patterns

### Mocking Prisma
All integration tests mock Prisma to avoid database dependencies:

```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    order: { create: jest.fn() },
    // ... other models
  },
}))
```

### Testing Authentication
Standard pattern for authenticated requests:

```typescript
const token = generateToken(userId, email, role)
const request = new NextRequest(url, {
  headers: {
    authorization: `Bearer ${token}`,
  },
})
```

### Testing Role-Based Access
Each role tested for access:

```typescript
const roles = ['EMPLOYEE', 'DEPARTMENT_MANAGER', 'COMPANY_ADMIN']
roles.forEach(role => {
  // Test access for each role
})
```

## Critical Business Logic Tested

1. **Purchase Request Workflow Assignment**
   - Automatic workflow matching based on amount + department
   - Handles no matching workflow gracefully

2. **Multi-Step Approval Logic**
   - State transitions through approval chain
   - Role-based step authorization
   - ADMIN/GENERAL_MANAGER can approve any step

3. **Stock Management**
   - Atomic stock decrement
   - Sales count increment
   - Multiple products in single order

4. **Budget Calculations**
   - Spent = approved/completed requests
   - Reserved = pending requests
   - Available = budget - spent - reserved
   - Utilization percentage

5. **Tax Calculation**
   - 18% KDV (Turkish VAT)
   - Applied to subtotal
   - Total = subtotal + shipping + tax

## Security Tests

- ✅ Password hashing (bcrypt with salt)
- ✅ JWT token validation (valid/invalid/expired)
- ✅ Password not in API responses
- ✅ Role-based access control enforcement
- ✅ Company data isolation
- ✅ Token verification on every request

## Edge Cases Covered

- Empty/null/undefined inputs
- Zero amounts and budgets
- Expired tokens
- Missing workflows
- Empty carts
- Concurrent approvals (step order validation)
- Turkish characters in slugs
- Negative numbers
- Large numbers
- Date boundaries (month/year transitions)

## Future Test Additions

### High Priority
- [ ] Integration test for complete purchase flow (request → approval → order)
- [ ] E2E tests with real database (test environment)
- [ ] Performance tests for budget aggregation
- [ ] Concurrent order processing tests

### Medium Priority
- [ ] Component tests for React components
- [ ] Form validation tests
- [ ] Error boundary tests
- [ ] Loading state tests

### Low Priority
- [ ] Visual regression tests
- [ ] Accessibility tests
- [ ] Internationalization tests

## Continuous Integration

Tests should run on:
- Every commit
- Every pull request
- Before deployment

## Debugging Tests

```bash
# Run specific test file
npm test -- auth.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should calculate budget"

# Run with verbose output
npm test -- --verbose

# Update snapshots (if using)
npm test -- --updateSnapshot
```

## Contributing

When adding new features:
1. Write tests FIRST (TDD)
2. Ensure 80%+ coverage for new code
3. Test edge cases
4. Test error handling
5. Update this README if adding new test categories

---

**Total Test Count: 200+ tests**
**Estimated Coverage: 80%+ of critical paths**
**Last Updated: 2024-03-15**
