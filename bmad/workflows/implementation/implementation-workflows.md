# Implementation Workflows
## BMAD-METHOD Implementation Phase

**Version:** 1.0
**Date:** 2025-11-05
**Approach:** Story-Centric Iterative Development

---

## Overview

The implementation phase uses story-centric workflows where features are built incrementally with continuous feedback loops. Each story follows a complete development cycle.

---

## Story Development Workflow

**Pattern:** Plan → Build → Test → Review → Deploy

```
Story Backlog
     ↓
Story Selection → Story Planning → Implementation
     ↓                                    ↓
Story Review ← Testing ← Development ← Design
     ↓
Story Completion → Next Story
```

---

## Workflow 1: Story Planning

**Objective:** Break down features into implementable stories

**Participants:**
- Product Manager (Lead)
- Technical Lead
- Development Team

**Duration:** 0.5-1 day per sprint

**Steps:**

### 1.1 Story Creation
```
Agent: Product Manager
Duration: 2-4 hours
Output: User story with acceptance criteria
```

**Story Template:**
```markdown
## User Story
AS A [role]
I WANT TO [action]
SO THAT [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes
- Dependencies: ...
- API endpoints: ...
- Database changes: ...

## Definition of Done
- [ ] Code implemented
- [ ] Tests written (>80% coverage)
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Deployed to staging
```

### 1.2 Story Estimation
```
Agent: Technical Lead + Team
Duration: 1-2 hours
Output: Story points, effort estimate
```

**Activities:**
- Review story complexity
- Identify dependencies
- Estimate effort (story points)
- Assign to sprint
- Allocate to team members

### 1.3 Technical Breakdown
```
Agent: Technical Lead
Duration: 1-2 hours
Output: Technical tasks
```

**Task Categories:**
- Database changes (migrations)
- API endpoint implementation
- Frontend components
- Business logic
- Tests
- Documentation

**Outputs:**
- ✅ Detailed user story
- ✅ Acceptance criteria
- ✅ Technical task breakdown
- ✅ Story estimation
- ✅ Dependencies identified

---

## Workflow 2: Database Implementation

**Objective:** Implement database changes for story

**Participants:**
- Database Engineer (Lead)
- Backend Developer

**Duration:** 2-4 hours

**Steps:**

### 2.1 Schema Design
```
Agent: Database Engineer
Duration: 1 hour
Output: Prisma schema changes
```

**Activities:**
- Update Prisma schema
- Add new models/fields
- Define relationships
- Add indexes
- Document changes

### 2.2 Migration Creation
```
Agent: Database Engineer
Duration: 1 hour
Output: Database migration
```

**Activities:**
```bash
# Create migration
npx prisma migrate dev --name story_feature_name

# Review migration SQL
# Validate migration
# Test migration (up/down)
```

### 2.3 Seed Data Update
```
Agent: Database Engineer
Duration: 1 hour
Output: Updated seed script
```

**Activities:**
- Update seed.ts
- Add test data for feature
- Ensure data consistency
- Test seed script

**Outputs:**
- ✅ Prisma schema updated
- ✅ Migration created and tested
- ✅ Seed data updated
- ✅ Schema documented

---

## Workflow 3: API Implementation

**Objective:** Implement backend API endpoints

**Participants:**
- Backend Developer (Lead)
- Database Engineer

**Duration:** 4-8 hours

**Steps:**

### 3.1 Route Handler Creation
```
Agent: Backend Developer
Duration: 2-3 hours
Output: API route handlers
```

**Implementation Pattern:**
```typescript
// app/api/[resource]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAuth } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const schema = z.object({
  field1: z.string(),
  field2: z.number(),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await validateAuth(request);

    // 2. Authorization
    if (!hasPermission(user, 'read:resource')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // 3. Query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');

    // 4. Database query (company-scoped)
    const data = await prisma.resource.findMany({
      where: { companyId: user.companyId },
      take: 50,
      skip: (page - 1) * 50,
    });

    // 5. Response
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await validateAuth(request);

    // 2. Validation
    const body = await request.json();
    const validated = schema.parse(body);

    // 3. Business logic
    const result = await prisma.resource.create({
      data: {
        ...validated,
        companyId: user.companyId,
      },
    });

    // 4. Response
    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3.2 Business Logic Implementation
```
Agent: Backend Developer
Duration: 2-3 hours
Output: Service layer functions
```

**Service Pattern:**
```typescript
// lib/services/purchaseRequestService.ts

export class PurchaseRequestService {
  // Validate budget (3-tier)
  static async validateBudget(
    userId: string,
    departmentId: string,
    companyId: string,
    amount: number
  ): Promise<ValidationResult> {
    // Check user budget
    const userBudget = await getUserBudget(userId);
    if (userBudget.remaining < amount) {
      return { valid: false, reason: 'User budget exceeded' };
    }

    // Check department budget
    const deptBudget = await getDepartmentBudget(departmentId);
    if (deptBudget.remaining < amount) {
      return { valid: false, reason: 'Department budget exceeded' };
    }

    // Check company budget
    const companyBudget = await getCompanyBudget(companyId);
    if (companyBudget.remaining < amount) {
      return { valid: false, reason: 'Company budget exceeded' };
    }

    return { valid: true };
  }

  // Assign workflow based on amount
  static async assignWorkflow(
    companyId: string,
    amount: number,
    departmentId: string
  ): Promise<ApprovalWorkflow> {
    const workflow = await prisma.approvalWorkflow.findFirst({
      where: {
        companyId,
        isActive: true,
        minAmount: { lte: amount },
        maxAmount: { gte: amount },
        departmentIds: { has: departmentId },
      },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });

    if (!workflow) {
      throw new Error('No matching workflow found');
    }

    return workflow;
  }
}
```

### 3.3 API Testing
```
Agent: Backend Developer
Duration: 2 hours
Output: API tests
```

**Test Pattern:**
```typescript
// __tests__/api/purchase-requests.test.ts

describe('POST /api/purchase-requests', () => {
  it('should create purchase request with valid data', async () => {
    const response = await fetch('/api/purchase-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Test Request',
        items: [{ productId: '123', quantity: 1 }],
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should reject request with insufficient budget', async () => {
    // Test budget validation
  });

  it('should assign correct workflow based on amount', async () => {
    // Test workflow assignment
  });
});
```

**Outputs:**
- ✅ API endpoints implemented
- ✅ Validation schemas defined
- ✅ Business logic implemented
- ✅ Error handling added
- ✅ API tests written

---

## Workflow 4: Frontend Implementation

**Objective:** Build user interface components

**Participants:**
- Frontend Developer (Lead)
- UX Designer

**Duration:** 6-12 hours

**Steps:**

### 4.1 Component Design
```
Agent: Frontend Developer
Duration: 2-3 hours
Output: React components
```

**Component Structure:**
```typescript
// components/PurchaseRequestForm.tsx

'use client';

import { useState } from 'react';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })).min(1),
});

type FormData = z.infer<typeof formSchema>;

export function PurchaseRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    items: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    try {
      formSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          newErrors[err.path.join('.')] = err.message;
        });
        setErrors(newErrors);
        return;
      }
    }

    // Submit
    try {
      const response = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Success
      }
    } catch (error) {
      // Error handling
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 4.2 State Management
```
Agent: Frontend Developer
Duration: 2-3 hours
Output: Context providers, hooks
```

**Context Pattern:**
```typescript
// contexts/PurchaseRequestContext.tsx

'use client';

import { createContext, useContext, useState } from 'react';

type PurchaseRequestContextType = {
  requests: PurchaseRequest[];
  loading: boolean;
  fetchRequests: () => Promise<void>;
  createRequest: (data: CreateRequestData) => Promise<void>;
};

const PurchaseRequestContext = createContext<PurchaseRequestContextType | null>(null);

export function PurchaseRequestProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/purchase-requests');
      const data = await response.json();
      setRequests(data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PurchaseRequestContext.Provider value={{ requests, loading, fetchRequests, createRequest }}>
      {children}
    </PurchaseRequestContext.Provider>
  );
}

export function usePurchaseRequests() {
  const context = useContext(PurchaseRequestContext);
  if (!context) throw new Error('Must be used within PurchaseRequestProvider');
  return context;
}
```

### 4.3 Frontend Testing
```
Agent: Frontend Developer
Duration: 2-3 hours
Output: Component tests
```

**Test Pattern:**
```typescript
// __tests__/components/PurchaseRequestForm.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { PurchaseRequestForm } from '@/components/PurchaseRequestForm';

describe('PurchaseRequestForm', () => {
  it('should render form fields', () => {
    render(<PurchaseRequestForm />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<PurchaseRequestForm />);
    fireEvent.click(screen.getByText('Submit'));
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });

  it('should submit valid form', async () => {
    // Test form submission
  });
});
```

**Outputs:**
- ✅ React components created
- ✅ State management implemented
- ✅ Form validation added
- ✅ Error handling implemented
- ✅ Component tests written

---

## Workflow 5: Integration & Testing

**Objective:** Test complete feature integration

**Participants:**
- QA Engineer (Lead)
- Frontend Developer
- Backend Developer

**Duration:** 4-6 hours

**Steps:**

### 5.1 Integration Testing
```
Agent: QA Engineer
Duration: 2-3 hours
Output: Integration test results
```

**Activities:**
- Test API-frontend integration
- Test database transactions
- Test error scenarios
- Test edge cases
- Document issues

### 5.2 Manual Testing
```
Agent: QA Engineer
Duration: 2-3 hours
Output: Test report
```

**Test Scenarios:**
- Happy path testing
- Negative testing
- Permission testing
- Cross-browser testing
- Mobile responsiveness

**Outputs:**
- ✅ Integration tests passed
- ✅ Manual tests completed
- ✅ Bugs identified and logged
- ✅ Test report generated

---

## Workflow 6: Code Review

**Objective:** Review code quality and standards

**Participants:**
- Technical Lead (Lead)
- Peer Developers
- Security Auditor

**Duration:** 2-4 hours

**Steps:**

### 6.1 Technical Review
```
Agent: Technical Lead
Duration: 1-2 hours
Output: Review comments
```

**Review Checklist:**
- [ ] Code follows style guide
- [ ] TypeScript types correct
- [ ] Error handling adequate
- [ ] Performance optimized
- [ ] No code duplication
- [ ] Documentation updated

### 6.2 Security Review
```
Agent: Security Auditor
Duration: 1 hour
Output: Security assessment
```

**Security Checklist:**
- [ ] Authentication validated
- [ ] Authorization checked
- [ ] Input sanitized
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CSRF tokens used

### 6.3 Performance Review
```
Agent: Performance Engineer
Duration: 1 hour
Output: Performance assessment
```

**Performance Checklist:**
- [ ] Database queries optimized
- [ ] Indexes used correctly
- [ ] No N+1 queries
- [ ] Caching considered
- [ ] Pagination implemented

**Outputs:**
- ✅ Code review completed
- ✅ Security approved
- ✅ Performance validated
- ✅ Issues addressed

---

## Workflow 7: Deployment

**Objective:** Deploy feature to staging/production

**Participants:**
- DevOps Engineer (Lead)
- Technical Lead

**Duration:** 1-2 hours

**Steps:**

### 7.1 Pre-Deployment
```
Agent: DevOps Engineer
Duration: 30 min
Output: Deployment checklist
```

**Activities:**
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations ready
- [ ] Environment variables set
- [ ] Rollback plan prepared

### 7.2 Staging Deployment
```
Agent: DevOps Engineer
Duration: 30 min
Output: Staging deployment
```

**Activities:**
```bash
# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Deploy to staging
git push staging main

# Run smoke tests
npm run test:smoke
```

### 7.3 Production Deployment
```
Agent: DevOps Engineer
Duration: 30 min
Output: Production deployment
```

**Activities:**
```bash
# Final checks
npm run test

# Deploy to production
git push production main

# Monitor logs
# Verify deployment
# Update documentation
```

**Outputs:**
- ✅ Feature deployed to staging
- ✅ Smoke tests passed
- ✅ Production deployment (if approved)
- ✅ Monitoring active

---

## Story Completion Checklist

### Definition of Done

**Code Quality:**
- [ ] Code implemented and working
- [ ] Code follows style guide
- [ ] TypeScript types complete
- [ ] No console warnings/errors

**Testing:**
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passed
- [ ] Manual testing completed
- [ ] No critical bugs

**Documentation:**
- [ ] Code documented (JSDoc)
- [ ] API endpoints documented
- [ ] README updated
- [ ] CHANGELOG updated

**Review:**
- [ ] Code reviewed and approved
- [ ] Security reviewed
- [ ] Performance validated

**Deployment:**
- [ ] Deployed to staging
- [ ] Smoke tests passed
- [ ] Production deployment (if sprint complete)

---

## Implementation Best Practices

### 1. Small Iterative Changes
```
✅ Small PRs (<500 lines)
✅ Focused changes (one feature)
✅ Frequent commits
✅ Regular merges to main
```

### 2. Test-Driven Development (TDD)
```
1. Write test (failing)
2. Implement feature
3. Test passes
4. Refactor
```

### 3. Continuous Integration
```
Every commit triggers:
- Linting
- Type checking
- Unit tests
- Build verification
```

### 4. Progressive Enhancement
```
1. Build basic functionality
2. Add validation
3. Add error handling
4. Optimize performance
5. Enhance UX
```

---

## Sprint Workflow

**Sprint Duration:** 2 weeks

**Sprint Activities:**
1. Sprint Planning (Day 1)
2. Daily Development (Days 2-9)
3. Testing & Review (Days 10-11)
4. Deployment & Demo (Day 12)
5. Sprint Retrospective (Day 12)

**Daily Routine:**
- Daily standup (15 min)
- Development work (6-7 hours)
- Code reviews (1 hour)
- Testing (1 hour)

---

**Next Phase:** Quality Assurance & Production Release

**Document Status:** ✅ Active
**Last Updated:** 2025-11-05
