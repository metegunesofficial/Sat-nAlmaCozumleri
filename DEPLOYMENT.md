# Vercel Deployment Guide - Attelia Dental E-Commerce

## Build Status

✅ **Production Build**: SUCCESSFUL
✅ **TypeScript Validation**: PASSED
✅ **ESLint Checks**: PASSED
⚠️ **Warnings**: 3 non-blocking performance warnings (Footer img tags)

---

## Pre-Deployment Checklist

### 1. Environment Variables

Configure the following environment variables in your Vercel project settings:

#### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-a-secure-random-string-here"

# JWT Secret
JWT_SECRET="generate-a-secure-jwt-secret-here"

# App Configuration
NEXT_PUBLIC_APP_NAME="Attelia Dental"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

#### How to Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

### 2. Database Setup

#### PostgreSQL Database Required

This application requires a PostgreSQL database. Recommended providers:

- **Vercel Postgres** (Easiest integration)
- **Supabase** (Free tier available)
- **Railway** (Generous free tier)
- **Neon** (Serverless Postgres)

#### Database Schema Setup

After deploying to Vercel, you need to set up the database schema:

1. Set the `DATABASE_URL` environment variable in Vercel
2. Run database migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run Prisma migrations
vercel env pull .env.local
npx prisma migrate deploy
```

Or manually through Vercel's terminal:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Functions**
3. Enable **Edge Config** if needed
4. Use Vercel's **Terminal** feature to run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed  # If you have seed data
   ```

### 3. Build Configuration

Vercel will automatically detect Next.js and use these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

#### Custom Build Settings (Optional)

If you need to customize, add to `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Then set Build Command in Vercel to: `npm run vercel-build`

---

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository: `metegunesofficial/Sat-nAlmaCozumleri`
4. Select branch: `claude/attelia-dental-ecommerce-011CUpPYERhdtsyCqZS1BmRd`
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (or `npm run vercel-build`)
   - **Output Directory**: `.next`
6. Add all environment variables from section 1
7. Click **Deploy**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts to:
# - Link to existing project or create new
# - Select the correct branch
# - Confirm deployment
```

### Option 3: Deploy via Git Integration (Continuous Deployment)

1. Connect your GitHub repository to Vercel
2. Set production branch to: `claude/attelia-dental-ecommerce-011CUpPYERhdtsyCqZS1BmRd`
3. Every push to this branch will automatically trigger a deployment
4. Vercel will build and deploy automatically

---

## Post-Deployment

### 1. Verify Deployment

Check these endpoints after deployment:

- ✅ Homepage: `https://your-domain.vercel.app/`
- ✅ Login: `https://your-domain.vercel.app/login`
- ✅ Dashboard: `https://your-domain.vercel.app/dashboard`
- ✅ API Health: `https://your-domain.vercel.app/api/categories`

### 2. Database Initialization

After first deployment, initialize the database with:

1. **Create first admin user** (via API or database):

```sql
-- Connect to your PostgreSQL database
INSERT INTO "User" (id, email, name, password, role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@attelia.com',
  'Admin User',
  '$2b$10$hashed_password_here',  -- Use bcrypt to hash
  'COMPANY_ADMIN',
  'ACTIVE',
  NOW(),
  NOW()
);
```

2. **Seed categories and departments** (if needed)

### 3. Monitor Deployment

- **Vercel Dashboard**: Monitor build logs and runtime logs
- **Analytics**: Check Vercel Analytics for traffic
- **Error Tracking**: Set up error tracking (Sentry recommended)

---

## Known Issues & Solutions

### Issue 1: Prisma Client Not Generated

**Error**: `@prisma/client did not initialize yet`

**Solution**:
```bash
# Add to package.json scripts
"postinstall": "prisma generate"
```

Or use custom build command:
```bash
prisma generate && next build
```

### Issue 2: Database Connection Timeout

**Error**: `Can't reach database server`

**Solution**:
- Ensure `DATABASE_URL` includes `?sslmode=require`
- Check database is publicly accessible
- Verify IP allowlist in database provider

### Issue 3: Environment Variables Not Loading

**Error**: `undefined` for `process.env.XXX`

**Solution**:
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)

---

## Performance Optimization

### Current Status
- **Build Time**: ~30-40 seconds
- **Static Pages**: 18 pages pre-rendered
- **Dynamic Routes**: 25 API routes
- **Bundle Size**: ~87.5 kB shared, ~200 kB largest page

### Recommended Optimizations

1. **Image Optimization** (3 warnings to fix):
   - Replace `<img>` with Next.js `<Image />` in `components/Footer.tsx`
   - This will improve LCP and reduce bandwidth

2. **Enable Caching**:
   - Add `Cache-Control` headers to API routes
   - Use `unstable_cache` for database queries

3. **Database Query Optimization**:
   - Add indexes to frequently queried fields
   - Use `select` to limit returned fields
   - Implement pagination for large lists

---

## Rollback Plan

If deployment fails or has issues:

### Option 1: Rollback in Vercel Dashboard
1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **...** → **Promote to Production**

### Option 2: Rollback via Git
```bash
# Revert to previous commit
git revert HEAD
git push origin claude/attelia-dental-ecommerce-011CUpPYERhdtsyCqZS1BmRd

# Or reset to specific commit
git reset --hard <previous-commit-hash>
git push --force origin claude/attelia-dental-ecommerce-011CUpPYERhdtsyCqZS1BmRd
```

---

## Support & Troubleshooting

### Vercel Support Resources
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Deployment Docs](https://vercel.com/docs/deployments/overview)

### Project-Specific Issues
- Check build logs in Vercel Dashboard
- Review error logs in **Functions** → **Logs**
- Test locally with production build: `npm run build && npm start`

---

## Success Criteria

Your deployment is successful when:

✅ Build completes without errors
✅ All pages load correctly
✅ Login functionality works
✅ API routes respond correctly
✅ Database queries execute successfully
✅ No critical errors in Vercel logs

---

## Next Steps After Deployment

1. **Security**:
   - Set up rate limiting
   - Configure CORS properly
   - Enable CSP headers
   - Set up WAF rules

2. **Monitoring**:
   - Set up Vercel Analytics
   - Configure error tracking (Sentry)
   - Set up uptime monitoring

3. **Performance**:
   - Fix Footer.tsx image warnings
   - Enable Redis caching for API responses
   - Set up CDN for static assets

4. **Features**:
   - Configure email service for notifications
   - Set up file upload service for product images
   - Enable search functionality with Algolia/Meilisearch

---

**Last Updated**: 2025-11-05
**Build Status**: ✅ Production Ready
**Deployment**: Vercel Compatible
