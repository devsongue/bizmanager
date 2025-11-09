-- AlterTable for Supplier
ALTER TABLE "Supplier" ADD COLUMN "contacts" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "productTypes" TEXT;

-- AlterTable for Client
ALTER TABLE "Client" ADD COLUMN "email" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "company" TEXT;