-- AlterTable
ALTER TABLE "Company" ADD COLUMN "taxId" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "industry" TEXT,
ADD COLUMN "employeeCount" INTEGER,
ADD COLUMN "subscription" JSONB;
