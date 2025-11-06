#!/bin/bash

# 🚀 Attelia Dental - Production Deployment Script
# Automated production deployment to Vercel

set -e  # Exit on error

echo "🚀 Attelia Dental Production Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch: $CURRENT_BRANCH${NC}"

# Confirm deployment
echo ""
echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION!${NC}"
echo -e "${YELLOW}   This will:"
echo -e "${YELLOW}   - Deploy current code to production"
echo -e "${YELLOW}   - Run database migrations"
echo -e "${YELLOW}   - Make changes live to users${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Step 1/5: Installing dependencies...${NC}"
npm install

echo ""
echo -e "${BLUE}🔧 Step 2/5: Generating Prisma Client...${NC}"
npx prisma generate 2>/dev/null || PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate

echo ""
echo -e "${BLUE}🏗️  Step 3/5: Building production bundle...${NC}"
npm run build

echo ""
echo -e "${BLUE}🗄️  Step 4/5: Deploying to Vercel...${NC}"
echo -e "${YELLOW}Note: You need Vercel token for this step${NC}"
echo -e "${YELLOW}Get it from: https://vercel.com/account/tokens${NC}"
echo ""

# Deploy to Vercel production
vercel --prod || {
    echo -e "${RED}❌ Vercel deployment failed!${NC}"
    echo ""
    echo "Manual deployment options:"
    echo "1. Go to GitHub and merge this branch"
    echo "2. Or run: vercel --prod --token=YOUR_TOKEN"
    exit 1
}

echo ""
echo -e "${BLUE}🗄️  Step 5/5: Running database migrations...${NC}"
echo -e "${YELLOW}Note: Make sure DATABASE_URL is set in Vercel${NC}"

npx prisma db push || {
    echo -e "${YELLOW}⚠️  Database migration failed${NC}"
    echo "Please run migrations manually:"
    echo "  1. Set DATABASE_URL in your environment"
    echo "  2. Run: npx prisma db push"
    echo "  3. Run: npm run db:seed"
}

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Production deployment completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Visit your production URL"
echo "2. Login with: admin@attelia.com / admin123"
echo "3. Change your password immediately!"
echo "4. Complete initial setup (departments, users, etc.)"
echo ""
echo -e "${GREEN}🎉 Your application is now LIVE!${NC}"
echo ""
