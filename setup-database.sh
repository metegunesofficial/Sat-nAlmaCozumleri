#!/bin/bash

# 🗄️ Attelia Dental - Veritabanı Kurulum Scripti
# Bu script veritabanını otomatik olarak kurar

set -e  # Hata durumunda dur

echo "🚀 Attelia Dental Veritabanı Kurulumu Başlıyor..."
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
echo -e "${GREEN}✨ Veritabanı kurulumu tamamlandı!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Demo Kullanıcı Bilgileri:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 Attelia Dental Merkez:"
echo "  Super Admin:       superadmin@attelia.com / password123"
echo "  Şirket Admin:      admin@attelia.com / password123"
echo "  IT Müdürü:         it.manager@attelia.com / password123"
echo "  Satın Alma Müdür:  procurement@attelia.com / password123"
echo "  Finans Müdürü:     finance@attelia.com / password123"
echo "  Yazılımcı:         john.doe@attelia.com / password123"
echo "  İK Uzmanı:         jane.smith@attelia.com / password123"
echo ""
echo "🔐 Attelia Dental İstanbul:"
echo "  Şirket Admin:      admin@attelia-istanbul.com / password123"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}🚀 Sunucuyu başlatmak için:${NC}"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}📊 Prisma Studio'yu açmak için:${NC}"
echo "  npx prisma studio"
echo ""
echo -e "${GREEN}Başarılar! 🎉${NC}"
