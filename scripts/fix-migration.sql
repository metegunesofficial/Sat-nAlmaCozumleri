-- Fix failed migration in Vercel database
-- This marks the failed migration as rolled back so db push can work

DELETE FROM "_prisma_migrations" WHERE migration_name = '20251107085610_add_company_fields';
