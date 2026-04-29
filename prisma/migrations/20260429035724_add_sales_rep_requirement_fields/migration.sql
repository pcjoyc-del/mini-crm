-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "categoryCode" TEXT,
ADD COLUMN     "materialCode" TEXT,
ADD COLUMN     "onlySofa" BOOLEAN,
ADD COLUMN     "residentLocation" TEXT,
ADD COLUMN     "sizeText" TEXT;

-- AlterTable
ALTER TABLE "LeadVisit" ADD COLUMN     "firstQuestion" TEXT,
ADD COLUMN     "visitPurpose" TEXT;
