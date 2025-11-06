#!/bin/bash

# 🗄️ Attelia Dental - Production Database Setup
# Automated database initialization script

set -e  # Exit on error

echo "🚀 Attelia Dental Production Database Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# .env.local kontrolü
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ Hata: .env.local dosyası bulunamadı!${NC}"
    echo "Lütfen önce .env.local dosyasını oluşturun ve DATABASE_URL ekleyin."
    exit 1
fi

echo -e "${BLUE}📦 1/4 - Dependencies kuruluyor...${NC}"
npm install

echo ""
echo -e "${BLUE}🔧 2/4 - Prisma Client oluşturuluyor...${NC}"
if npx prisma generate 2>/dev/null; then
    echo -e "${GREEN}✅ Prisma Client başarıyla oluşturuldu${NC}"
else
    echo -e "${YELLOW}⚠️  Normal generate başarısız, alternatif yöntem deneniyor...${NC}"
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate || {
        echo -e "${RED}❌ Prisma Client oluşturulamadı!${NC}"
        exit 1
    }
fi

echo ""
echo -e "${BLUE}🗄️  3/4 - Veritabanı tabloları oluşturuluyor...${NC}"
if npx prisma db push --skip-generate 2>/dev/null; then
    echo -e "${GREEN}✅ Tablolar başarıyla oluşturuldu${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma db push başarısız, manuel SQL deneniyor...${NC}"

    # DATABASE_URL'i .env.local'den oku
    source .env.local

    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL bulunamadı!${NC}"
        exit 1
    fi

    if command -v psql &> /dev/null; then
        echo "Manuel SQL migration uygulanıyor..."
        psql "$DATABASE_URL" -f prisma/init-database.sql || {
            echo -e "${RED}❌ SQL migration başarısız!${NC}"
            echo "Lütfen DATABASE_URL bağlantısını kontrol edin."
            exit 1
        }
        echo -e "${GREEN}✅ Manuel SQL migration tamamlandı${NC}"
    else
        echo -e "${RED}❌ psql komutu bulunamadı!${NC}"
        echo "Lütfen PostgreSQL client kurun veya manuel olarak migration yapın:"
        echo "  psql \"\$DATABASE_URL\" -f prisma/init-database.sql"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🌱 4/4 - Demo veriler ekleniyor...${NC}"
npm run db:seed || {
    echo -e "${RED}❌ Seed işlemi başarısız!${NC}"
    echo "Manuel olarak çalıştırmak için:"
    echo "  npm run db:seed"
    exit 1
}

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Production database setup completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Initial Admin Credentials:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Email:    admin@attelia.com"
echo "  Password: admin123"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Change this password immediately after first login!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}🚀 Sunucuyu başlatmak için:${NC}"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}📊 Prisma Studio'yu açmak için:${NC}"
echo "  npx prisma studio"
echo ""
echo -e "${GREEN}Başarılar! 🎉${NC}"
