-- CreateEnum
CREATE TYPE "LeadLifecycleStatus" AS ENUM ('LEAD', 'CUSTOMER', 'LOST');

-- CreateEnum
CREATE TYPE "FollowUpTemperature" AS ENUM ('HOT', 'WARM', 'COLD', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "followUpTemperature" "FollowUpTemperature" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "lifecycleStatus" "LeadLifecycleStatus" NOT NULL DEFAULT 'LEAD';

-- CreateTable
CREATE TABLE "LeadVisit" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "visitDatetime" TIMESTAMP(3) NOT NULL,
    "storeId" TEXT NOT NULL,
    "salesId" TEXT NOT NULL,
    "source" "LeadSource" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadVisit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeadVisit" ADD CONSTRAINT "LeadVisit_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadVisit" ADD CONSTRAINT "LeadVisit_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadVisit" ADD CONSTRAINT "LeadVisit_salesId_fkey" FOREIGN KEY ("salesId") REFERENCES "SalesUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
