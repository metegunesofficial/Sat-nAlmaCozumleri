# CLAUDE.md - AI Assistant Development Guide

**Last Updated**: 2025-11-14
**Project**: Attelia Dental - Enterprise B2B Procurement Management Platform
**Tech Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS

---

## 🎯 Quick Reference

### Project Identity
- **Type**: Multi-tenant B2B e-commerce and procurement management system
- **Language**: Turkish (UI), English (code/comments)
- **Architecture**: Next.js 14 App Router with API routes
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: JWT tokens (7-day expiry)
- **Deployment**: Vercel-ready with standalone build

### Key Commands
```bash
npm run dev              # Development server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint checks
npx prisma studio        # Database GUI
npx prisma migrate dev   # Create migration
npm run db:seed          # Seed database with demo data
npx prisma generate      # Regenerate Prisma client
```

### Current Branch
- **Branch**: `claude/claude-md-mhyqzfubw2hrth7w-01VDWLaF8R1uESRvyaRrbHsT`
- **IMPORTANT**: All commits and pushes MUST go to this branch

---

## 📂 Codebase Structure

### Directory Layout
```
Sat-nAlmaCozumleri/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # Backend API routes (22 endpoints)
│   │   ├── auth/                # Authentication (login, register)
│   │   ├── products/            # Product CRUD + filtering
│   │   ├── categories/          # Category management
│   │   ├── departments/         # Department CRUD
│   │   ├── suppliers/           # Supplier management
│   │   ├── users/               # User management
│   │   ├── workflows/           # Approval workflow CRUD
│   │   ├── purchase-requests/   # Purchase requests + approval
│   │   ├── cart/                # Shopping cart
│   │   ├── orders/              # Order management
│   │   └── reports/             # Analytics & reporting
│   ├── admin/                   # Admin panel pages
│   ├── dashboard/               # User dashboard
│   ├── requests/                # Purchase request pages
│   ├── products/                # Product catalog
│   ├── cart/                    # Shopping cart page
│   ├── reports/                 # Reporting pages
│   ├── login/                   # Login page
│   ├── layout.tsx               # Root layout (fonts, metadata)
│   ├── page.tsx                 # Home (redirects to /login)
│   └── globals.css              # Global Tailwind styles
├── components/                   # Reusable React components
│   ├── DashboardLayout.tsx      # Auth-protected layout with sidebar
│   ├── Sidebar.tsx              # Role-based navigation
│   ├── DataTable.tsx            # Generic sortable/searchable table
│   ├── StatCard.tsx             # Dashboard stat cards
│   ├── ProductCard.tsx          # Product display card
│   ├── Modal.tsx                # Reusable modal dialog
│   ├── Loading.tsx              # Loading spinner
│   ├── EmptyState.tsx           # Empty state placeholder
│   └── Providers.tsx            # Context providers wrapper
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx          # Global auth state + methods
│   └── NotificationContext.tsx  # Toast notifications
├── lib/                          # Utilities and helpers
│   ├── prisma.ts                # Prisma client singleton
│   ├── auth.ts                  # JWT & password hashing
│   ├── api.ts                   # Frontend API client library
│   ├── utils.ts                 # Formatting utilities
│   └── mockData.ts              # Development mock data
├── types/                        # TypeScript type definitions
│   └── index.ts                 # Shared interfaces/types
├── prisma/                       # Database layer
│   ├── schema.prisma            # 23 database models
│   └── seed.ts                  # Seed script (2 companies, 7 users)
└── Config Files
    ├── package.json             # Dependencies & scripts
    ├── tsconfig.json            # TypeScript config
    ├── next.config.js           # Next.js config
    ├── tailwind.config.ts       # Tailwind customization
    ├── .env.example             # Environment variable template
    └── README.md, DEPLOYMENT.md # Documentation
```

---

## 🏗️ Architecture Overview

### Multi-Tenant Design
**CRITICAL**: Every database model (except `Company`) is scoped to `companyId`

```typescript
// All API routes MUST filter by company
const suppliers = await prisma.supplier.findMany({
  where: {
    companyId: user.companyId,  // ← REQUIRED for multi-tenancy
    // ... other filters
  }
})
```

**Why**: Single database serves multiple companies with complete data isolation.

### 3-Tier Budget System
```
Company-Level Budget (CompanyBudget)
    ↓ Category-based allocation
Department-Level Budget (Budget)
    ↓ User allocation
User-Level Budget (UserBudget)
    ↓ Individual spending limits
```

**Validation Flow**: Every purchase request checks all three budget tiers.

### Multi-Step Approval Workflow
```
Purchase Request Created
    ↓
Workflow Selected (based on amount)
    ↓
Step 1: Department Manager Approval
    ↓ (if approved)
Step 2: Procurement Manager Approval (10K-50K)
    ↓ (if approved)
Step 3: Finance Manager Approval (50K+)
    ↓ (if all approved)
Request Status = APPROVED
```

**Key Models**:
- `ApprovalWorkflow` - Workflow definition with amount ranges
- `ApprovalStep` - Individual steps (stepOrder, approverRole)
- `ApprovalAction` - Approval history (user, action, comment, timestamp)

### Role-Based Access Control (RBAC)

**Roles Hierarchy** (least to most privileged):
1. `EMPLOYEE` - Create purchase requests, view own data
2. `DEPARTMENT_MANAGER` - Approve department requests
3. `PROCUREMENT_MANAGER` - Manage suppliers, approve purchases
4. `FINANCE_MANAGER` - Approve high-value purchases, view all budgets
5. `GENERAL_MANAGER` - Full operational access
6. `COMPANY_ADMIN` - Full company access (except other companies)
7. `SUPER_ADMIN` - Platform-wide access (all companies)

**Authorization Pattern**:
```typescript
// Always verify role in API routes
if (!['COMPANY_ADMIN', 'SUPER_ADMIN', 'PROCUREMENT_MANAGER'].includes(user.role)) {
  return NextResponse.json(
    { success: false, error: 'Yetkiniz yok' },
    { status: 403 }
  )
}
```

---

## 🔑 Key Development Patterns

### 1. API Route Structure

**Standard CRUD Pattern**:
```typescript
// app/api/[resource]/route.ts
export const dynamic = 'force-dynamic' // ← REQUIRED for all API routes

export async function GET(request: NextRequest) {
  // 1. Extract & verify JWT token
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const decoded = verifyToken(token)

  // 2. Validate user exists
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })

  // 3. Check authorization (role-based)
  if (!['ALLOWED_ROLE'].includes(user.role)) {
    return NextResponse.json({ success: false, error: 'Yetkiniz yok' }, { status: 403 })
  }

  // 4. Build query with company filter
  const where = { companyId: user.companyId }

  // 5. Add additional filters from query params
  const searchParams = request.nextUrl.searchParams
  if (searchParams.get('status')) {
    where.status = searchParams.get('status')
  }

  // 6. Execute query
  const data = await prisma.resource.findMany({ where, orderBy: { createdAt: 'desc' } })

  // 7. Return success response
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  // Similar pattern: verify → validate → create with companyId
  const body = await request.json()
  const resource = await prisma.resource.create({
    data: {
      companyId: user.companyId, // ← ALWAYS include
      ...body
    }
  })
  return NextResponse.json({ success: true, data: resource }, { status: 201 })
}
```

**Dynamic Routes**:
```typescript
// app/api/[resource]/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await prisma.resource.findUnique({
    where: {
      id: params.id,
      companyId: user.companyId // ← Security: prevent cross-company access
    }
  })
  return NextResponse.json({ success: true, data })
}
```

### 2. Frontend Data Fetching Pattern

```typescript
'use client' // Required for client components

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { suppliersApi } from '@/lib/api'

export default function AdminPage() {
  const { user } = useAuth()
  const { success, error } = useNotification()
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await suppliersApi.getAll()
      if (response.success) {
        setData(response.data)
      }
    } catch (err) {
      error(err.message || 'Veri yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      const response = await suppliersApi.create(formData)
      if (response.success) {
        success('Başarıyla oluşturuldu')
        fetchData() // Refresh list
      }
    } catch (err) {
      error(err.message)
    }
  }

  if (isLoading) return <Loading />

  return (
    <DashboardLayout>
      <DataTable data={data} columns={columns} />
    </DashboardLayout>
  )
}
```

### 3. Component Patterns

**DashboardLayout** - Auth-protected wrapper:
```typescript
// Automatically redirects to /login if not authenticated
// Provides sidebar navigation with role-based menu
<DashboardLayout>
  {/* Your page content */}
</DashboardLayout>
```

**DataTable** - Generic sortable table:
```typescript
const columns = [
  { key: 'name', label: 'İsim' },
  { key: 'email', label: 'E-posta' },
  {
    key: 'actions',
    label: 'İşlemler',
    render: (row) => (
      <button onClick={() => handleEdit(row)}>Düzenle</button>
    )
  }
]

<DataTable<Supplier>
  data={suppliers}
  columns={columns}
  onRowClick={(row) => router.push(`/admin/suppliers/${row.id}`)}
/>
```

**Modal** - Reusable dialog:
```typescript
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Yeni Tedarikçi"
>
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
  </form>
</Modal>
```

---

## 🛡️ Security Best Practices

### 1. Authentication
- **JWT tokens** stored in `localStorage` (client) with 7-day expiry
- **Password hashing** with bcrypt (12 rounds)
- **Token verification** on every API request

### 2. Authorization
- **Role checks** in every protected API route
- **Company scoping** prevents cross-company data access
- **Department scoping** for department managers

### 3. Data Validation
```typescript
// Server-side validation example
if (!name || !email) {
  return NextResponse.json(
    { success: false, error: 'İsim ve e-posta gereklidir' },
    { status: 400 }
  )
}

// Check for duplicates
const existing = await prisma.supplier.findFirst({
  where: { companyId: user.companyId, email }
})
if (existing) {
  return NextResponse.json(
    { success: false, error: 'Bu e-posta ile kayıtlı tedarikçi zaten var' },
    { status: 409 }
  )
}
```

### 4. SQL Injection Prevention
- **Prisma ORM** handles parameterization automatically
- **NEVER** use raw SQL unless absolutely necessary
- If raw SQL needed, use parameterized queries: `prisma.$queryRaw`

---

## 📝 Coding Conventions

### TypeScript
- **Strict mode enabled** - Fix all type errors before committing
- **Explicit types** for function parameters and returns
- **Interfaces** for data shapes (see `types/index.ts`)
- **Type inference** acceptable for local variables

### Naming Conventions
- **Components**: PascalCase (`DashboardLayout.tsx`)
- **Files**: Match component names
- **API routes**: lowercase with hyphens (`purchase-requests`)
- **Database models**: PascalCase (`PurchaseRequest`)
- **Database fields**: camelCase (`createdAt`, `companyId`)
- **Variables/functions**: camelCase (`fetchData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`JWT_SECRET`)

### File Organization
- **One component per file** (except small helper components)
- **API routes**: One file per resource with GET/POST/PUT/DELETE
- **Utilities**: Group related functions in `lib/`
- **Types**: Shared types in `types/index.ts`

### Error Handling
```typescript
// API routes: Always catch and return error responses
try {
  // operation
} catch (error) {
  console.error('Operation error:', error)
  return NextResponse.json(
    { success: false, error: 'User-friendly Turkish error message' },
    { status: 500 }
  )
}

// Frontend: Use notification context
try {
  await api.operation()
  success('İşlem başarılı')
} catch (err) {
  error(err.message || 'Bir hata oluştu')
}
```

### Turkish vs English
- **User-facing text**: Turkish (labels, messages, notifications)
- **Code**: English (variable names, function names, comments)
- **Error messages**: Turkish (displayed to users)
- **Console logs**: English (for developers)

---

## 🔄 Common Development Workflows

### Adding a New API Endpoint

1. **Create route file**: `app/api/resource/route.ts`
2. **Add authentication check** (copy from existing route)
3. **Add authorization check** (role-based)
4. **Add company filter** to all queries
5. **Add validation** for required fields
6. **Return consistent response format**: `{ success, data?, error? }`
7. **Export `dynamic = 'force-dynamic'`**

### Adding a New Database Model

1. **Update schema**: `prisma/schema.prisma`
   ```prisma
   model NewModel {
     id        String   @id @default(cuid())
     companyId String   // ← REQUIRED
     company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
     // ... other fields
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@index([companyId])
   }
   ```
2. **Update Company model** to include relation
3. **Generate migration**: `npx prisma migrate dev --name add_new_model`
4. **Update seed script** if needed: `prisma/seed.ts`
5. **Generate Prisma client**: `npx prisma generate`

### Adding a New Admin Page

1. **Create page**: `app/admin/resource/page.tsx`
2. **Use DashboardLayout** wrapper
3. **Fetch data** with useEffect + API client
4. **Use DataTable** for list view
5. **Use Modal** for create/edit forms
6. **Add to sidebar**: Update `components/Sidebar.tsx`
   ```typescript
   {
     icon: Icon,
     label: 'Label',
     href: '/admin/resource',
     roles: ['COMPANY_ADMIN', 'SUPER_ADMIN']
   }
   ```

### Adding a New TypeScript Type

1. **Add to `types/index.ts`**:
   ```typescript
   export interface NewType {
     id: string
     name: string
     companyId: string
     // ... match Prisma model fields
   }
   ```
2. **Use in components/API routes**: `import { NewType } from '@/types'`

---

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Test with different user roles (EMPLOYEE, MANAGER, ADMIN)
- [ ] Test with multiple companies (ensure data isolation)
- [ ] Test error cases (invalid input, missing fields)
- [ ] Test authentication (invalid token, expired token)
- [ ] Test authorization (unauthorized role access)
- [ ] Test pagination/filtering (if applicable)

### Testing Different Roles
**Demo Users** (from seed data):
- **Super Admin**: `superadmin@attelia.com` / `password123`
- **Company Admin**: `admin@attelia.com` / `password123`
- **IT Manager**: `it.manager@attelia.com` / `password123`
- **Procurement**: `procurement@attelia.com` / `password123`
- **Finance**: `finance@attelia.com` / `password123`
- **Employee**: `john.doe@attelia.com` / `password123`

### API Testing with curl
```bash
# Login to get token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@attelia.com","password":"password123"}' | jq -r '.token')

# Test endpoint
curl http://localhost:3000/api/suppliers \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚀 Deployment Workflow

### Pre-Deployment Checklist
1. **Build locally**: `npm run build` (must succeed without errors)
2. **Fix TypeScript errors**: `npm run lint`
3. **Test critical paths**: Login, dashboard, create request
4. **Update environment variables** in Vercel (see `.env.example`)
5. **Ensure DATABASE_URL** has `?sslmode=require` for production

### Database Migration on Vercel
```bash
# After first deploy
vercel env pull .env.local
npx prisma migrate deploy
npm run db:seed  # Optional: seed demo data
```

### Git Workflow
```bash
# Commit changes
git add .
git commit -m "feat: Add supplier management API"

# Push to branch (with retry on failure)
git push -u origin claude/claude-md-mhyqzfubw2hrth7w-01VDWLaF8R1uESRvyaRrbHsT
```

**IMPORTANT**: Always push to the branch specified above. Use `-u origin <branch>` for first push.

---

## ⚠️ Common Pitfalls & How to Avoid

### 1. Forgetting `companyId` Filter
**Problem**: Cross-company data leakage
**Solution**: ALWAYS include `companyId: user.companyId` in WHERE clauses

### 2. Missing `dynamic = 'force-dynamic'`
**Problem**: API routes cached, stale data returned
**Solution**: Export `export const dynamic = 'force-dynamic'` in all API routes

### 3. Not Checking User Role
**Problem**: Unauthorized users access protected data
**Solution**: Always verify `user.role` in API routes before operations

### 4. Client Components Without 'use client'
**Problem**: Hooks (useState, useEffect) fail in Server Components
**Solution**: Add `'use client'` at top of file when using React hooks

### 5. Wrong Import Paths
**Problem**: TypeScript can't find modules
**Solution**: Use `@/` alias for imports: `import { prisma } from '@/lib/prisma'`

### 6. Prisma Client Not Updated
**Problem**: Type errors after schema changes
**Solution**: Run `npx prisma generate` after every schema change

### 7. Turkish Character Issues in Slugs
**Problem**: URL-unsafe slugs (ş, ı, ğ, ü, ö, ç)
**Solution**: Use `generateSlug()` from `lib/utils.ts` (handles Turkish characters)

### 8. Missing Error Handling
**Problem**: Unhandled promise rejections, no user feedback
**Solution**: Always wrap async operations in try-catch with user-friendly errors

---

## 🗄️ Database Schema Quick Reference

### Core Models (23 total)

**Multi-Tenancy**:
- `Company` - Organization root (id, name, slug, settings)

**Users & Departments**:
- `User` - Users with roles (companyId, email, role, departmentId)
- `Department` - Hierarchical departments (companyId, parentId)

**Budgets (3-tier)**:
- `CompanyBudget` - Company-level budgets (companyId, category, amount)
- `Budget` - Department budgets (departmentId, allocated, spent)
- `UserBudget` - User budgets (userId, monthlyLimit, spent)

**Purchase Management**:
- `PurchaseRequest` - Main requests (requesterId, departmentId, status)
- `PurchaseRequestItem` - Line items (requestId, productId, quantity)
- `PurchaseCategory` - Categories with limits (companyId, parentId)

**Approval Workflow**:
- `ApprovalWorkflow` - Workflow definitions (companyId, minAmount, maxAmount)
- `ApprovalStep` - Steps (workflowId, stepOrder, approverRole)
- `ApprovalAction` - Actions (requestId, stepId, userId, action)

**E-Commerce**:
- `Product` - Products (companyId, categoryId, price, stock)
- `Category` - Product categories (companyId, parentId)
- `CartItem` - Cart (userId, productId, quantity)
- `Order` - Orders (userId, companyId, status, total)
- `OrderItem` - Order items (orderId, productId, quantity)
- `Supplier` - Suppliers (companyId, name, email)
- `Review` - Product reviews (productId, userId, rating)

**Settings**:
- `Setting` - Key-value config (companyId, key, value)

### Key Relationships
```
Company 1:N → Users, Departments, Products, Orders, PurchaseRequests
User 1:N → PurchaseRequests, Orders, CartItems, Reviews
Department 1:N → Users, Budgets
PurchaseRequest 1:N → Items, ApprovalActions
ApprovalWorkflow 1:N → ApprovalSteps
Category/Department → Self-referencing (parentId for hierarchy)
```

---

## 🎨 UI/UX Patterns

### Tailwind CSS Classes

**Card**:
```tsx
className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
```

**Button (Primary)**:
```tsx
className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
```

**Button (Secondary)**:
```tsx
className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors"
```

**Input**:
```tsx
className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
```

**Badge**:
```tsx
// Status badges
const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  REJECTED: 'bg-red-100 text-red-800',
  APPROVED: 'bg-blue-100 text-blue-800'
}
className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
```

### Icons
**Lucide React** is used throughout:
```tsx
import { Plus, Edit, Trash, Check, X, AlertCircle } from 'lucide-react'

<Plus className="w-5 h-5" />
```

---

## 🔧 Environment Variables

**Required** (see `.env.example`):
```env
DATABASE_URL="postgresql://user:password@host:5432/db"
JWT_SECRET="strong-random-secret"
NEXTAUTH_SECRET="another-strong-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Attelia Dental"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Optional** (planned features):
```env
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD  # Email notifications
AWS_* # File upload (S3)
```

---

## 📊 Performance Considerations

### Database Optimization
- **Indexes**: All foreign keys and frequently queried fields are indexed
- **Relations**: Use `include` sparingly, prefer `select` for specific fields
- **Pagination**: Implement for large lists (see products API)

### Frontend Optimization
- **Loading states**: Show `<Loading />` during data fetching
- **Error boundaries**: Use try-catch with user-friendly messages
- **Optimistic updates**: Update UI before API response for better UX

### Build Optimization
- **Tree-shaking**: Prisma client auto-generated, only used models included
- **Code splitting**: Next.js automatically splits by route
- **Image optimization**: Use Next.js `<Image />` (TODO: fix Footer.tsx)

---

## 🆘 Troubleshooting

### "Prisma Client not initialized"
```bash
npx prisma generate
```

### "Can't reach database server"
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running: `psql -U postgres -d attelia_dental`

### TypeScript errors after schema change
```bash
npx prisma generate
npm run build  # Verify no errors
```

### "Token gerekli" or 401 errors
- Check `localStorage` has valid token
- Verify token not expired (7-day limit)
- Re-login to get fresh token

### Build fails with "Module not found"
- Clear `.next`: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`
- Rebuild: `npm run build`

---

## 📚 Additional Resources

### Project Documentation
- **README.md** - Project overview, features, setup guide
- **DEPLOYMENT.md** - Vercel deployment guide
- **FEATURES_COMPLETED.md** - Completed features list
- **FEATURE_STATUS.md** - Feature development status

### External Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Useful Prisma Commands
```bash
npx prisma studio          # Visual database editor
npx prisma format          # Format schema.prisma
npx prisma validate        # Validate schema
npx prisma db push         # Push schema without migration (dev only)
npx prisma migrate reset   # Reset DB and re-run migrations
```

---

## 🎓 Learning the Codebase

### Start Here (Recommended Order)
1. **README.md** - Understand project purpose and features
2. **prisma/schema.prisma** - Learn database models
3. **types/index.ts** - See TypeScript interfaces
4. **lib/auth.ts** - Understand authentication
5. **app/api/suppliers/route.ts** - Study API pattern
6. **components/DashboardLayout.tsx** - See layout structure
7. **app/admin/suppliers/page.tsx** - Complete CRUD example

### Key Files to Reference
- **API Template**: `app/api/suppliers/route.ts`
- **Page Template**: `app/admin/suppliers/page.tsx`
- **Auth Pattern**: `contexts/AuthContext.tsx`
- **Utility Functions**: `lib/utils.ts`
- **Seed Data**: `prisma/seed.ts` (shows relationships)

---

## ✅ Pre-Commit Checklist

Before committing changes:
- [ ] Code builds without errors: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Tested manually with different roles
- [ ] All API routes have `companyId` filter
- [ ] All new models have `companyId` field
- [ ] Turkish text for user-facing strings
- [ ] Error handling with try-catch
- [ ] Loading states for async operations
- [ ] Commit message follows convention: `feat:`, `fix:`, `docs:`, etc.

---

## 🤝 Contributing Guidelines

### Code Style
- Follow existing patterns (see "Key Development Patterns")
- Use TypeScript strict mode (no `any` without reason)
- Prefer functional components with hooks
- Use descriptive variable names
- Add comments for complex logic (in English)

### Git Commit Messages
```
feat: Add supplier management API
fix: Resolve token expiry issue
docs: Update CLAUDE.md with API patterns
refactor: Simplify budget calculation logic
style: Format code with Prettier
test: Add test cases for approval workflow
```

### Pull Request Process
1. Create feature branch from current branch
2. Develop and test locally
3. Commit with descriptive messages
4. Push to origin: `git push -u origin <branch-name>`
5. Create PR with description of changes
6. Wait for review and approval

---

## 📞 Getting Help

### When Stuck
1. **Search codebase**: Use grep/search for similar implementations
2. **Check documentation**: README.md, DEPLOYMENT.md, this file
3. **Review Prisma schema**: Understand data relationships
4. **Test with Prisma Studio**: Visualize data and relationships
5. **Check browser console**: Look for error messages
6. **Review API logs**: Check terminal output for errors

### Common Questions

**Q: How do I add a new user role?**
A: Update `UserRole` enum in `prisma/schema.prisma`, add to sidebar role checks, update API authorization logic.

**Q: How do I add a new approval workflow?**
A: Use admin panel or directly create in database via Prisma Studio (see README examples).

**Q: How do I change the budget calculation logic?**
A: Review `CompanyBudget`, `Budget`, `UserBudget` models and update purchase request validation.

**Q: How do I add email notifications?**
A: Implement email service in `lib/email.ts`, add SMTP env vars, call on approval actions.

---

**Remember**: This is a production-ready enterprise system. Always prioritize:
1. **Security** - Verify auth/authorization on every route
2. **Data Isolation** - Filter by `companyId` always
3. **User Experience** - Clear Turkish messages, loading states, error handling
4. **Type Safety** - Use TypeScript strictly, no silent failures
5. **Code Quality** - Follow patterns, DRY principle, clear naming

Happy coding! 🚀
