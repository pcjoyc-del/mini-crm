/*
  Warnings:

  - You are about to drop the column `categoryCode` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `interestedModelCode` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `materialCode` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `onlySofa` on the `Lead` table. All the data in the column will be lost.
  - Changed the type of `source` on the `Lead` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `source` on the `LeadVisit` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "categoryCode",
DROP COLUMN "interestedModelCode",
DROP COLUMN "materialCode",
DROP COLUMN "onlySofa",
DROP COLUMN "source",
ADD COLUMN     "source" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LeadVisit" DROP COLUMN "source",
ADD COLUMN     "source" TEXT NOT NULL;

-- DropEnum
DROP TYPE "LeadSource";

-- CreateTable
CREATE TABLE "lead_interested_models" (
    "leadId" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "lead_interested_models_pkey" PRIMARY KEY ("leadId","code")
);

-- CreateTable
CREATE TABLE "lead_categories" (
    "leadId" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "lead_categories_pkey" PRIMARY KEY ("leadId","code")
);

-- CreateTable
CREATE TABLE "lead_materials" (
    "leadId" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "lead_materials_pkey" PRIMARY KEY ("leadId","code")
);

-- AddForeignKey
ALTER TABLE "lead_interested_models" ADD CONSTRAINT "lead_interested_models_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_categories" ADD CONSTRAINT "lead_categories_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_materials" ADD CONSTRAINT "lead_materials_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
