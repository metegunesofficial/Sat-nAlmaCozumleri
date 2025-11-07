# NextAuth Setup Guide

This document explains the NextAuth implementation for the Multi-Tenant Procurement Platform.

## Overview

We've implemented NextAuth v4 with Credentials Provider for secure authentication using:
- **JWT-based sessions** stored in HttpOnly cookies
- **bcrypt** for password hashing (12 rounds)
- **Role-based access control** (RBAC)
- **Multi-tenant isolation** at the session level
- **Automatic redirects** based on user roles

---

## Architecture

### Key Files

```
lib/
  auth-config.ts          # NextAuth configuration
  session.ts              # Server-side session helpers
  auth.ts                 # Password hashing utilities

app/
  api/
    auth/
      [...nextauth]/
        route.ts            # NextAuth API route handler

contexts/
  AuthContext.tsx          # Client-side auth hook (NextAuth wrapper)

components/
  Providers.tsx            # SessionProvider wrapper

middleware.ts              # Route protection & redirects
```

---

## Authentication Flow

### 1. User Login

**Client Side (Login Page):**
```typescript
import { useAuth } from '@/contexts/AuthContext'

const { login } = useAuth()

await login(email, password)
// Automatically redirected based on role
```

**What Happens:**
1. Client calls `login()` from `useAuth` hook
2. Hook calls NextAuth's `signIn('credentials', { email, password })`
3. NextAuth sends request to `/api/auth/callback/credentials`
4. Credentials Provider's `authorize()` function:
   - Queries database for user
   - Verifies password with bcrypt
   - Returns user object if valid
5. NextAuth creates JWT token with user data
6. Token stored in HttpOnly cookie (secure, can't be accessed by JavaScript)
7. Middleware redirects based on role:
   - `SUPER_ADMIN` → `/dev-admin`
   - Others → `/dashboard`

### 2. Session Access

**Client Components:**
```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>

  return <div>Welcome {user.name}</div>
}
```

**Server Components & API Routes:**
```typescript
import { getServerSession, requireAuth, requireRole } from '@/lib/session'

// Optional auth
export async function GET() {
  const session = await getServerSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of handler
}

// Required auth
export async function POST() {
  const session = await requireAuth() // Throws if not authenticated
  const userId = session.user.id
  // ... rest of handler
}

// Required role
export async function DELETE() {
  const session = await requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN'])
  // ... rest of handler
}
```

### 3. Logout

```typescript
const { logout } = useAuth()

await logout()
// Automatically redirected to /login
```

---

## Multi-Tenant Isolation

Every session includes `companyId`:

```typescript
const session = await getServerSession()
const companyId = session.user.companyId

// All queries must filter by companyId
const products = await prisma.product.findMany({
  where: { companyId }, // Multi-tenant isolation
})
```

**⚠️ CRITICAL:** Every database query MUST include `companyId` filter except for:
- SUPER_ADMIN in dev-admin console
- Global system operations

---

## Role-Based Access Control

### Available Roles

```typescript
enum UserRole {
  SUPER_ADMIN         // Platform admin (access to /dev-admin)
  COMPANY_ADMIN       // Company administrator
  EMPLOYEE            // Regular employee
  DEPARTMENT_MANAGER  // Department head
  FINANCE_MANAGER     // Finance department
  GENERAL_MANAGER     // General manager
  PROCUREMENT_MANAGER // Procurement department
}
```

### Middleware Protection

Defined in `middleware.ts`:

| Route              | Allowed Roles                                      |
|--------------------|----------------------------------------------------|
| `/dev-admin/**`    | `SUPER_ADMIN` only                                 |
| `/admin/**`        | `SUPER_ADMIN`, `COMPANY_ADMIN`, `PROCUREMENT_MANAGER` |
| `/dashboard`       | All authenticated users                            |
| `/requests/**`     | All authenticated users                            |
| `/reports/**`      | All authenticated users (filtered by permissions)  |

### API Route Protection

```typescript
// Require specific roles
export async function POST(request: Request) {
  const session = await requireRole(['COMPANY_ADMIN', 'PROCUREMENT_MANAGER'])

  // Only admins can access this endpoint
  // ...
}
```

---

## Session Structure

### JWT Token Content

```typescript
{
  id: string              // User ID
  email: string           // User email
  name: string            // Full name
  role: UserRole          // User role
  companyId: string       // Multi-tenant isolation
  companyName?: string    // Company name
  departmentId?: string   // Department ID
  departmentName?: string // Department name
  position?: string       // Job position
  iat: number             // Issued at
  exp: number             // Expires at (7 days)
}
```

### Session Object

```typescript
{
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    companyId: string
    companyName?: string
    departmentId?: string
    departmentName?: string
    position?: string
  }
  expires: string // ISO 8601 date
}
```

---

## Security Features

### 1. HttpOnly Cookies

Session tokens are stored in HttpOnly cookies, which:
- ✅ Cannot be accessed by JavaScript (XSS protection)
- ✅ Automatically sent with requests
- ✅ Secure in production (HTTPS only)
- ✅ SameSite protection (CSRF mitigation)

### 2. Password Security

```typescript
// Hashing (registration)
const hashedPassword = await hashPassword(password)
// Uses bcrypt with 12 rounds

// Verification (login)
const isValid = await verifyPassword(password, user.password)
```

### 3. Token Expiry

- JWT tokens expire after **7 days**
- Refresh token flow not implemented (session-based)
- Users must re-login after expiry

### 4. HTTPS-Only in Production

```env
# .env.production
NEXTAUTH_URL=https://your-domain.com
```

NextAuth automatically sets secure cookies in production.

---

## Environment Variables

### Required

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# JWT Configuration
JWT_SECRET="your-jwt-secret-here"

# Database
DATABASE_URL="postgresql://..."
```

### Generate Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# JWT_SECRET (should be different)
openssl rand -base64 32
```

### Vercel Deployment

Set environment variables in Vercel Dashboard:

```bash
# Production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add JWT_SECRET production

# Preview
vercel env add NEXTAUTH_SECRET preview
vercel env add NEXTAUTH_URL preview
vercel env add JWT_SECRET preview
```

⚠️ **Important:** Set `NEXTAUTH_URL` to your actual domain in production:
```env
NEXTAUTH_URL=https://your-app.vercel.app
```

---

## Common Patterns

### Protected Page Component

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <p>Role: {user.role}</p>
    </div>
  )
}
```

### Protected API Route

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Multi-tenant isolation
    const companyId = session.user.companyId

    const data = await prisma.purchaseRequest.findMany({
      where: { companyId },
      include: {
        requester: true,
        department: true,
      },
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Conditional Rendering by Role

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  const isAdmin = ['SUPER_ADMIN', 'COMPANY_ADMIN'].includes(user?.role || '')

  return (
    <div>
      <h1>Dashboard</h1>

      {isAdmin && (
        <div>
          <h2>Admin Section</h2>
          {/* Admin-only content */}
        </div>
      )}

      <div>
        <h2>User Section</h2>
        {/* Content for all users */}
      </div>
    </div>
  )
}
```

---

## Migration from Mock Auth

### Before (Mock Auth)

```typescript
// localStorage-based mock authentication
const login = async (email, password) => {
  const mockUser = mockUsers.find(u => u.email === email)
  localStorage.setItem('user', JSON.stringify(mockUser))
  localStorage.setItem('token', 'mock-token')
  setUser(mockUser)
}
```

### After (NextAuth)

```typescript
// Real authentication with database
const login = async (email, password) => {
  await nextAuthSignIn('credentials', { email, password, redirect: false })
  // Session automatically managed by NextAuth
  // No localStorage, uses HttpOnly cookies
}
```

**Benefits:**
- ✅ Real database authentication
- ✅ Secure session storage (HttpOnly cookies)
- ✅ Automatic CSRF protection
- ✅ Production-ready security
- ✅ No client-side token management

---

## Testing

### Test Credentials

After seeding the database, you can use:

```typescript
// Super Admin (Dev Console)
Email: admin@system.com
Password: Admin123!@#

// Company Admin (created during demo provision)
Email: [generated]
Password: [user-provided]
```

### Testing Login Flow

```bash
# 1. Start development server
npm run dev

# 2. Navigate to login page
open http://localhost:3000/login

# 3. Enter credentials
# 4. Check redirect based on role:
#    - SUPER_ADMIN → http://localhost:3000/dev-admin
#    - Others → http://localhost:3000/dashboard
```

### Testing Session

```typescript
// In browser console (won't work - cookies are HttpOnly ✅)
document.cookie // Can't access session token

// Check session in API route
fetch('/api/debug/session')
  .then(r => r.json())
  .then(console.log)
```

---

## Troubleshooting

### "Invalid credentials" Error

**Cause:** User not found or password mismatch

**Solution:**
1. Check database has users: `npx prisma studio`
2. Verify email is correct
3. Ensure password is hashed in database
4. Check bcrypt rounds match (12)

### Session Not Persisting

**Cause:** Cookie not being saved

**Solution:**
1. Check `NEXTAUTH_SECRET` is set
2. Verify `NEXTAUTH_URL` matches your domain
3. In development, ensure localhost URL is correct
4. Check browser accepts cookies

### Redirect Loop

**Cause:** Middleware redirecting incorrectly

**Solution:**
1. Check middleware.ts logic
2. Verify public routes are excluded
3. Check role-based redirects
4. Ensure `/api/auth/*` is always public

### TypeScript Errors

**Cause:** Session types not matching

**Solution:**
```bash
# Regenerate Prisma types
npx prisma generate

# Restart TypeScript server in VSCode
Cmd/Ctrl + Shift + P → TypeScript: Restart TS Server
```

### "NEXTAUTH_SECRET" Missing

**Cause:** Environment variable not set

**Solution:**
```bash
# Generate secret
openssl rand -base64 32

# Add to .env
echo 'NEXTAUTH_SECRET="<generated-secret>"' >> .env

# Restart dev server
npm run dev
```

---

## Best Practices

### 1. Always Use Multi-Tenant Filters

```typescript
// ✅ Good
const products = await prisma.product.findMany({
  where: { companyId: session.user.companyId },
})

// ❌ Bad (data leak!)
const products = await prisma.product.findMany()
```

### 2. Use Server-Side Session for Sensitive Operations

```typescript
// ✅ Good - Server-side auth
export async function POST() {
  const session = await requireAuth()
  // ... secure operation
}

// ❌ Bad - Client-side only
'use client'
export default function Component() {
  const { user } = useAuth()
  // Don't rely on this for security!
}
```

### 3. Implement Proper Error Handling

```typescript
export async function GET() {
  try {
    const session = await requireAuth()
    // ... operation
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Unexpected error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### 4. Don't Store Sensitive Data in JWT

```typescript
// ✅ Good - Only IDs and basic info
const token = { userId, email, role, companyId }

// ❌ Bad - Don't store sensitive data
const token = { userId, password, creditCard, ssn }
```

---

## Security Checklist

- ✅ Passwords hashed with bcrypt (12+ rounds)
- ✅ Sessions use HttpOnly cookies
- ✅ CSRF protection enabled (NextAuth default)
- ✅ Secure cookies in production (HTTPS)
- ✅ Token expiration set (7 days)
- ✅ Multi-tenant isolation on all queries
- ✅ Role-based access control via middleware
- ✅ Environment secrets not committed to git
- ✅ Input validation on credentials
- ✅ Rate limiting (to be implemented in Task 11)

---

## Next Steps

1. ✅ NextAuth configured with Credentials Provider
2. ✅ Session management with HttpOnly cookies
3. ✅ Role-based redirects via middleware
4. ➡️ Continue to [Task 3: Permissions & Audit Log](./PERMISSIONS_SETUP.md)
5. ➡️ Implement fine-grained permissions
6. ➡️ Add audit logging for compliance

---

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js Credentials Provider](https://next-auth.js.org/providers/credentials)
- [JWT Sessions](https://next-auth.js.org/configuration/options#session)
- [NextAuth TypeScript](https://next-auth.js.org/getting-started/typescript)
