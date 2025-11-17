#!/bin/bash
set -e

echo "🔄 Setting up database schema..."

# Push schema to database (for Prisma Accelerate)
npx prisma db push --skip-generate

echo "✅ Database schema setup complete!"
