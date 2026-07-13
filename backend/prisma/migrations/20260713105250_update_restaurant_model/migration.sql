-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "closingTime" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "openingTime" TEXT,
ADD COLUMN     "website" TEXT;
