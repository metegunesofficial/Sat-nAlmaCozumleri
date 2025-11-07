# 🚀 Production Deployment Guide

Bu rehber, Attelia Dental Satın Alma Platformu'nu production ortamına deploy etmek için gereken tüm adımları içerir.

## 📋 Pre-Deployment Checklist

### 1. Code Quality
- [ ] Tüm TypeScript hataları giderildi
- [ ] Console.log'lar temizlendi (veya production'da devre dışı)
- [ ] Unused imports temizlendi
- [ ] ESLint uyarıları giderildi
- [ ] Build başarılı (`npm run build`)

### 2. Environment Variables
- [ ] Güçlü JWT_SECRET oluşturuldu (min 32 karakter)
- [ ] Güçlü NEXTAUTH_SECRET oluşturuldu
- [ ] Production database URL ayarlandı
- [ ] SendGrid API key alındı
- [ ] Vercel Blob token oluşturuldu
- [ ] Tüm URL'ler production domain'e güncellendi

### 3. Database
- [ ] Production database oluşturuldu
- [ ] Migration planı hazır
- [ ] Seed data stratejisi belirlendi
- [ ] Backup stratejisi oluşturuldu

### 4. Security
- [ ] CORS ayarları yapılandırıldı
- [ ] Rate limiting eklendi (önerilir)
- [ ] SQL injection koruması doğrulandı (Prisma default)
- [ ] XSS koruması doğrulandı
- [ ] File upload güvenliği test edildi

## 🗄️ Database Migration

### Option 1: Vercel Postgres (Recommended)

```bash
# 1. Vercel dashboard'dan Postgres database oluştur
# 2. Connection string'i kopyala
# 3. Local .env dosyasına ekle
DATABASE_URL="postgres://..."

# 4. Migration'ları uygula
npx prisma migrate deploy

# 5. Seed data (opsiyonel)
npm run db:seed
```

### Option 2: External PostgreSQL (Railway, Supabase, etc.)

```bash
# 1. Database service'den database oluştur
# 2. Connection string'i al
# 3. SSL mode ekle
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# 4. Migration uygula
npx prisma migrate deploy

# 5. Prisma client generate
npx prisma generate
```

### Migration Checklist
- [ ] Development'ta test edildi
- [ ] Staging'de test edildi
- [ ] Backup alındı
- [ ] Migration rollback planı hazır
- [ ] Migration production'da çalıştırıldı
- [ ] Seed data eklendi
- [ ] Database connection test edildi

## 🔑 Environment Variables Setup

### Vercel Dashboard'dan Ayarlama

1. Vercel project settings'e git
2. Environment Variables sekmesini aç
3. Aşağıdaki değişkenleri ekle:

```env
# Database (Required)
DATABASE_URL="postgresql://..."

# Auth (Required)
JWT_SECRET="production-secret-min-32-chars-use-openssl-rand-base64-32"
NEXTAUTH_SECRET="different-secret-min-32-chars"
NEXTAUTH_URL="https://yourdomain.vercel.app"

# Email (Required)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="SG.xxxxxxxxx"
SMTP_FROM="noreply@yourdomain.com"

# File Storage (Required)
BLOB_READ_WRITE_TOKEN="vercel_blob_xxxx"

# App (Required)
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.vercel.app"
```

### Secret Generation

```bash
# JWT Secret oluştur
openssl rand -base64 32

# NextAuth Secret oluştur
openssl rand -base64 32
```

## 📧 Email Service Setup

### SendGrid Setup (Recommended)

1. [SendGrid](https://sendgrid.com)'e kaydol
2. Email verification yap
3. Settings → API Keys
4. Create API Key
5. "Mail Send" permission ver
6. API key'i kopyala
7. Environment variables'a ekle:

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="SG.your-api-key-here"
SMTP_FROM="noreply@yourdomain.com"
```

### Domain Verification (Production)

1. SendGrid → Settings → Sender Authentication
2. Domain Authentication seç
3. DNS records'u domain provider'a ekle
4. Verification bekle (24 saate kadar sürebilir)

## 💾 Vercel Blob Storage Setup

1. [Vercel Dashboard](https://vercel.com/dashboard)
2. Storage → Create Store
3. Blob seç
4. Store name gir (örn: "attelia-files")
5. Token'ı kopyala
6. Environment variables'a ekle:

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxx"
```

## 🚀 Vercel Deployment

### First Time Deployment

```bash
# 1. Vercel CLI kur
npm i -g vercel

# 2. Login
vercel login

# 3. Project'i link et
vercel link

# 4. Environment variables ayarla (Vercel dashboard'dan)

# 5. Deploy
vercel --prod
```

### Subsequent Deployments

```bash
# Git push ile otomatik deploy
git push origin main

# Veya manuel
vercel --prod
```

### Deployment Settings (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🔧 Post-Deployment Tasks

### 1. Database Migration

```bash
# Production database'e migration uygula
DATABASE_URL="production-url" npx prisma migrate deploy

# Prisma generate
npx prisma generate
```

### 2. Seed Initial Data

```bash
# Super admin ve demo company oluştur
DATABASE_URL="production-url" npm run db:seed
```

### 3. Test Core Features

- [ ] Login/Register çalışıyor
- [ ] Dashboard yükleniyor
- [ ] Purchase request oluşturma
- [ ] Email gönderimi çalışıyor
- [ ] Logo upload çalışıyor
- [ ] Workflow designer çalışıyor
- [ ] Workflow execution çalışıyor
- [ ] Multi-tenant isolation doğru

### 4. Performance Check

- [ ] Page load time <3s
- [ ] API response time <500ms
- [ ] Images optimize edildi
- [ ] Database queries optimize edildi

## 🔒 Security Hardening

### 1. CORS Configuration

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')

  // Production'da sadece kendi domain'e izin ver
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = [
      'https://yourdomain.vercel.app',
      'https://yourdomain.com'
    ]

    if (origin && !allowedOrigins.includes(origin)) {
      return new Response('CORS not allowed', { status: 403 })
    }
  }

  return NextResponse.next()
}
```

### 2. Rate Limiting (Optional but Recommended)

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

### 3. Security Headers

Vercel otomatik ekler, ancak extra için `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

## 📊 Monitoring & Logging

### 1. Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

```bash
npx @sentry/wizard@latest -i nextjs
```

### 3. Logging Strategy

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to external service (Sentry, LogRocket, etc.)
      console.log('[INFO]', message, data)
    } else {
      console.log(message, data)
    }
  },
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      console.error('[ERROR]', message, error)
    } else {
      console.error(message, error)
    }
  }
}
```

## 🔄 Backup Strategy

### Database Backups

```bash
# Automated daily backups (Vercel Postgres)
# Automatic - 7 days retention

# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20241107.sql
```

### File Backups

Vercel Blob otomatik replication yapar, ancak önemli dosyalar için:

```typescript
// Periodic backup script
// lib/backup-blob.ts
export async function backupBlobs() {
  // List all blobs
  // Download to S3 or other storage
  // Log backup completion
}
```

## 🚨 Rollback Plan

### Code Rollback

```bash
# Vercel dashboard'dan previous deployment'a rollback
# veya
vercel rollback [deployment-url]
```

### Database Rollback

```bash
# Migration geri al
npx prisma migrate resolve --rolled-back [migration-name]

# Backup'tan restore
psql $DATABASE_URL < backup-before-migration.sql
```

## 📈 Performance Optimization

### 1. Database Indexes

```prisma
// Tüm kritik alanlar zaten indexed
// Ek index gerekirse:
@@index([field1, field2])
```

### 2. Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-blob-domain.vercel-storage.app'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### 3. Caching Strategy

```typescript
// API routes'da cache headers
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  })
}
```

## ✅ Final Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database migrated successfully
- [ ] Seed data added
- [ ] Email sending tested
- [ ] File upload tested
- [ ] SSL certificate active (Vercel automatic)
- [ ] Domain configured
- [ ] DNS propagated
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Backup strategy in place
- [ ] Monitoring dashboard setup
- [ ] Team notified
- [ ] Documentation updated
- [ ] User guide prepared
- [ ] Support email configured

## 🎯 Go Live!

```bash
# Final deployment
git tag v1.0.0
git push origin v1.0.0
vercel --prod

# Verify
curl https://yourdomain.vercel.app/api/health

# Monitor
# Watch Vercel dashboard for errors
# Check email delivery
# Monitor database connections
```

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Migration failed**
```bash
# Check connection
DATABASE_URL="..." npx prisma db push --accept-data-loss

# Force reset (CAUTION: Deletes all data)
DATABASE_URL="..." npx prisma migrate reset
```

**Issue: Email not sending**
```bash
# Test SMTP connection
node -e "require('./lib/email').verifyEmailConnection()"

# Check SendGrid logs
# SendGrid Dashboard → Activity
```

**Issue: File upload fails**
```bash
# Verify Blob token
echo $BLOB_READ_WRITE_TOKEN

# Check Vercel Blob dashboard
# Verify store exists and is accessible
```

**Issue: Slow performance**
```bash
# Check database queries
# Enable Prisma query logging
# prisma.$queryRaw logging

# Check API response times
# Vercel Analytics → Performance
```

## 🎉 Success!

Your Attelia Dental platform is now live on production! 🚀

**Next Steps:**
1. Monitor for first 24 hours
2. Gather user feedback
3. Plan Phase 2 features
4. Regular backups
5. Performance monitoring

---

**Need help?** Check docs/ folder or create an issue on GitHub.
