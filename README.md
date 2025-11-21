# Attelia Dental - B2B Satın Alma Yönetim Sistemi

Dental sektörü için kurumsal satın alma talebi yönetim platformu.

## Teknolojiler

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** JWT, bcrypt

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Prisma client oluştur
npx prisma generate

# Veritabanı migrate
npx prisma migrate dev

# Geliştirme sunucusu
npm run dev
```

## Test Kullanıcıları

| Rol | Email | Şifre |
|-----|-------|-------|
| Admin | admin@attelia.com | password123 |
| Employee | john.doe@attelia.com | password123 |

## Dokümantasyon

Detaylı proje dokümantasyonu için: **[PROJECT.md](./PROJECT.md)**

## Lisans

MIT
