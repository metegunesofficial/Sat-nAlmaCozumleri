# Database Setup Guide - Vercel Postgres

This guide walks you through setting up the PostgreSQL database for the Multi-Tenant Procurement Platform using Vercel Postgres.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Vercel Postgres Setup](#vercel-postgres-setup)
- [Running Migrations](#running-migrations)
- [Seeding the Database](#seeding-the-database)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- Vercel account (for production deployment)
- PostgreSQL 14+ (for local development)
- Vercel CLI installed: `npm i -g vercel`

---

## Local Development Setup

### 1. Install PostgreSQL Locally

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Local Database

```bash
# Login to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE procurement_db;
CREATE USER procurement_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE procurement_db TO procurement_user;

# Exit
\q
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://procurement_user:your_secure_password@localhost:5432/procurement_db"
DIRECT_URL="postgresql://procurement_user:your_secure_password@localhost:5432/procurement_db"
```

### 4. Generate Prisma Client

```bash
npm install
npx prisma generate
```

### 5. Run Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Apply the schema
- Generate the Prisma Client

---

## Vercel Postgres Setup

### 1. Create Vercel Postgres Database

**Option A: Via Vercel Dashboard**

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a region (preferably close to your users)
6. Click **Create**

**Option B: Via Vercel CLI**

```bash
vercel postgres create procurement-db
```

### 2. Connect Database to Your Project

**Via Dashboard:**
1. In the Storage tab, click on your database
2. Click **Connect Project**
3. Select your project
4. Click **Connect**

**Via CLI:**
```bash
vercel link
vercel env pull .env.local
```

### 3. Environment Variables

Vercel automatically provides these variables:

- `POSTGRES_URL` - Connection pooling URL (use this for `DATABASE_URL`)
- `POSTGRES_URL_NON_POOLING` - Direct connection URL (use this for `DIRECT_URL`)
- `POSTGRES_PRISMA_URL` - Alias for `POSTGRES_URL_NON_POOLING`

**Update your Prisma datasource:**

The schema is already configured to use these:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled connection
  directUrl = env("DIRECT_URL")        // Direct connection for migrations
}
```

**Set Environment Variables in Vercel:**

```bash
# For production
vercel env add DATABASE_URL production
# Paste: POSTGRES_URL value

vercel env add DIRECT_URL production
# Paste: POSTGRES_URL_NON_POOLING value

# Repeat for preview environments
vercel env add DATABASE_URL preview
vercel env add DIRECT_URL preview
```

### 4. Update package.json Scripts

Add Vercel-specific scripts:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

## Running Migrations

### Local Development

```bash
# Create and apply a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Production (Vercel)

Migrations are automatically run during deployment via the `vercel-build` script.

**Manual Migration:**

```bash
# Using Vercel CLI with environment variables
vercel env pull .env.production
npx prisma migrate deploy
```

**Important Notes:**

- ⚠️ Always test migrations in preview environment first
- ⚠️ Use `DIRECT_URL` (non-pooling connection) for migrations
- ⚠️ Never run `prisma migrate dev` in production
- ✅ Use `prisma migrate deploy` for production

---

## Seeding the Database

### 1. Create Seed Script

The project includes a seed script at `prisma/seed.ts`. It will create:

- Initial SUPER_ADMIN user
- Base permissions
- Demo company with sample data
- Default approval workflows

### 2. Run Seed

**Local:**
```bash
npm run db:seed
```

**Production (via Vercel):**

```bash
# Pull production environment variables
vercel env pull .env.production

# Run seed with production database
npm run db:seed
```

### 3. Initial SUPER_ADMIN Credentials

After seeding, you'll have a SUPER_ADMIN account:

```
Email: admin@system.com
Password: Admin123!@#
```

**⚠️ IMPORTANT: Change this password immediately after first login!**

---

## Vercel Build Configuration

### Update vercel.json

Create or update `vercel.json`:

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Environment Variables Checklist

Ensure these are set in Vercel:

**Required:**
- ✅ `DATABASE_URL` (from `POSTGRES_URL`)
- ✅ `DIRECT_URL` (from `POSTGRES_URL_NON_POOLING`)
- ✅ `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
- ✅ `NEXTAUTH_URL` (your production URL)
- ✅ `JWT_SECRET` (generate: `openssl rand -base64 32`)

**Optional:**
- `ENABLE_DEMO_TENANTS` (default: "true")
- `DEMO_CLEANUP_DAYS` (default: "7")
- `CRON_SECRET` (for securing cron endpoints)

---

## Connection Pooling Best Practices

### Why Connection Pooling?

Serverless functions create new database connections for each request. Without pooling:
- ❌ Exhausts PostgreSQL connection limits (typically 100)
- ❌ Slow cold starts
- ❌ Database connection errors under load

### Vercel Postgres Solution

Vercel Postgres provides built-in connection pooling:

- `POSTGRES_URL` - Uses PgBouncer pooling (use for queries)
- `POSTGRES_URL_NON_POOLING` - Direct connection (use for migrations)

### Prisma Configuration

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled for queries
  directUrl = env("DIRECT_URL")        // Direct for migrations
}
```

### Prisma Client Best Practices

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Troubleshooting

### Common Issues

#### 1. "Too many connections" Error

**Cause:** Not using connection pooling
**Solution:** Ensure `DATABASE_URL` uses the pooled URL (`POSTGRES_URL`)

```env
# ✅ Correct
DATABASE_URL="postgres://default:***@***-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb"

# ❌ Wrong
DATABASE_URL="postgres://default:***@***-us-east-1.postgres.vercel-storage.com:5432/verceldb"
```

#### 2. Migration Fails on Vercel

**Cause:** Using pooled connection for migrations
**Solution:** Set `DIRECT_URL` to non-pooling connection

```env
DIRECT_URL="postgres://default:***@***-us-east-1.postgres.vercel-storage.com:5432/verceldb"
```

#### 3. Prisma Client Not Found

**Cause:** Prisma Client not generated during build
**Solution:** Ensure `vercel-build` script includes `prisma generate`

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

#### 4. SSL/TLS Connection Error

**Cause:** Missing SSL mode
**Solution:** Add `?sslmode=require` to connection string

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

#### 5. Local Development Connection Refused

**Cause:** PostgreSQL not running
**Solution:**

```bash
# macOS
brew services start postgresql@14

# Ubuntu
sudo systemctl start postgresql

# Check status
psql --version
psql -U postgres -c "SELECT version();"
```

---

## Database Monitoring

### Vercel Dashboard

1. Go to **Storage** → Your Database
2. View metrics:
   - Active connections
   - Query performance
   - Storage usage
   - Error rates

### Prisma Studio

View and edit data locally:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

### Database Backups

Vercel Postgres automatically creates:
- Daily backups (retained for 7 days)
- Point-in-time recovery

**Manual Backup:**

```bash
# Export schema and data
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## Performance Optimization

### Indexes

The schema includes strategic indexes. Review with:

```sql
-- List all indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public';
```

### Query Performance

```typescript
// Enable query logging in development
const prisma = new PrismaClient({
  log: ['query'],
})
```

### Connection Pool Tuning

Vercel Postgres automatically manages pool size, but you can monitor:

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check connection states
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state;
```

---

## Security Checklist

- ✅ Use strong passwords (min 16 characters)
- ✅ Enable SSL/TLS connections (`?sslmode=require`)
- ✅ Rotate database credentials regularly
- ✅ Use environment variables (never hardcode)
- ✅ Limit database user permissions
- ✅ Enable connection pooling
- ✅ Review Prisma Client logs in production
- ✅ Set up database monitoring/alerts
- ✅ Regular backups (automatic with Vercel)
- ✅ Use separate databases for prod/preview/dev

---

## Next Steps

After database setup:

1. ✅ Run migrations
2. ✅ Seed initial data
3. ✅ Test connection
4. ➡️ Continue to [NextAuth Setup](./NEXTAUTH_SETUP.md)
5. ➡️ Deploy to Vercel

---

## Additional Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Connection Pooling Guide](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
