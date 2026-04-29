-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPERVISOR', 'SALES');
CREATE TYPE "LeadStatus" AS ENUM ('NEW_LEAD', 'FOLLOW_UP', 'NEGOTIATING', 'WON', 'LOST', 'CLOSED');
CREATE TYPE "IdentityStatus" AS ENUM ('UNVERIFIED', 'PARTIAL_MATCH', 'VERIFIED', 'CONFLICT');
CREATE TYPE "LeadSource" AS ENUM ('WALK_IN', 'LINE', 'PHONE_CALL', 'FACEBOOK', 'REFERRAL', 'EVENT', 'OTHER');
CREATE TYPE "DuplicateCaseStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'MERGED', 'DISMISSED');
CREATE TYPE "DuplicateSignal" AS ENUM ('PHONE_EXACT', 'LINE_EXACT', 'NAME_PHONE_SIMILAR', 'MANUAL_FLAG');
CREATE TYPE "MergeRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'APPLIED', 'REVERSED');
CREATE TYPE "MergeActionType" AS ENUM ('MERGE', 'UNMERGE');
CREATE TYPE "MergeReason" AS ENUM ('DUPLICATE', 'DATA_CORRECTION', 'USER_REQUEST');
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'FULFILLED', 'CANCELLED');
CREATE TYPE "AuditEntityType" AS ENUM ('LEAD', 'LEAD_STATUS_HISTORY', 'CUSTOMER', 'LEAD_CUSTOMER_MAP', 'DUPLICATE_CASE', 'MERGE_REQUEST', 'MERGE_ACTION', 'ORDER', 'MASTER_DATA', 'AUTH');
CREATE TYPE "AuditActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'SUBMIT', 'APPROVE', 'REJECT', 'MERGE', 'UNMERGE', 'LOGIN', 'LOGOUT');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Store" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(40) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "region" VARCHAR(120),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesUser" (
  "id" TEXT NOT NULL,
  "employeeCode" VARCHAR(40) NOT NULL,
  "displayName" VARCHAR(120) NOT NULL,
  "userId" TEXT,
  "storeId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MasterDataItem" (
  "id" TEXT NOT NULL,
  "domain" VARCHAR(80) NOT NULL,
  "code" VARCHAR(80) NOT NULL,
  "label" VARCHAR(255) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MasterDataItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "visitDatetime" TIMESTAMP(3) NOT NULL,
  "storeId" TEXT NOT NULL,
  "salesId" TEXT NOT NULL,
  "customerName" VARCHAR(255),
  "phone" VARCHAR(50),
  "lineId" VARCHAR(80),
  "source" "LeadSource" NOT NULL,
  "interestedModelCode" VARCHAR(80),
  "priceRangeCode" VARCHAR(80),
  "usageTimingCode" VARCHAR(80),
  "residenceTypeCode" VARCHAR(80),
  "customerGroupCode" VARCHAR(80),
  "ageRangeCode" VARCHAR(80),
  "customerLocation" VARCHAR(255),
  "firstQuestion" TEXT,
  "customerTypeFlagCode" VARCHAR(80),
  "interestedProductCategoryCode" VARCHAR(80),
  "note" TEXT,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW_LEAD',
  "identityStatus" "IdentityStatus" NOT NULL DEFAULT 'UNVERIFIED',
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadStatusHistory" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "fromStatus" "LeadStatus",
  "toStatus" "LeadStatus" NOT NULL,
  "changedById" TEXT NOT NULL,
  "changeReason" TEXT,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Customer" (
  "id" TEXT NOT NULL,
  "displayName" VARCHAR(255) NOT NULL,
  "primaryPhone" VARCHAR(50),
  "primaryLineId" VARCHAR(80),
  "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
  "identityConfidence" DECIMAL(5,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadCustomerMap" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "identityStatus" "IdentityStatus" NOT NULL,
  "confidenceScore" DECIMAL(5,2),
  "isPrimaryIdentity" BOOLEAN NOT NULL DEFAULT false,
  "mappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "mappedByUserId" TEXT,
  CONSTRAINT "LeadCustomerMap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DuplicateCase" (
  "id" TEXT NOT NULL,
  "status" "DuplicateCaseStatus" NOT NULL DEFAULT 'OPEN',
  "signal" "DuplicateSignal" NOT NULL,
  "confidenceScore" DECIMAL(5,2),
  "createdByUserId" TEXT NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DuplicateCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DuplicateCaseLead" (
  "duplicateCaseId" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "isPrimaryHint" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DuplicateCaseLead_pkey" PRIMARY KEY ("duplicateCaseId", "leadId")
);

CREATE TABLE "MergeRequest" (
  "id" TEXT NOT NULL,
  "duplicateCaseId" TEXT NOT NULL,
  "status" "MergeRequestStatus" NOT NULL DEFAULT 'DRAFT',
  "reason" "MergeReason" NOT NULL,
  "primaryLeadId" TEXT NOT NULL,
  "comment" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "reviewedByUserId" TEXT,
  "submittedAt" TIMESTAMP(3),
  "decidedAt" TIMESTAMP(3),
  "appliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MergeRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MergeAction" (
  "id" TEXT NOT NULL,
  "mergeRequestId" TEXT NOT NULL,
  "actionType" "MergeActionType" NOT NULL,
  "primaryLeadId" TEXT NOT NULL,
  "performedByUserId" TEXT NOT NULL,
  "reason" "MergeReason" NOT NULL,
  "payloadBefore" JSONB NOT NULL,
  "payloadAfter" JSONB NOT NULL,
  "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MergeAction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MergeActionSecondaryLead" (
  "mergeActionId" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  CONSTRAINT "MergeActionSecondaryLead_pkey" PRIMARY KEY ("mergeActionId", "leadId")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "customerId" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
  "currencyCode" CHAR(3) NOT NULL,
  "subtotalAmount" DECIMAL(14,2) NOT NULL,
  "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "totalAmount" DECIMAL(14,2) NOT NULL,
  "orderedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "entityType" "AuditEntityType" NOT NULL,
  "entityId" TEXT NOT NULL,
  "actionType" "AuditActionType" NOT NULL,
  "actorUserId" TEXT,
  "requestId" TEXT,
  "beforeState" JSONB,
  "afterState" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- UniqueIndexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Store_code_key" ON "Store"("code");
CREATE UNIQUE INDEX "SalesUser_employeeCode_key" ON "SalesUser"("employeeCode");
CREATE UNIQUE INDEX "SalesUser_userId_key" ON "SalesUser"("userId");
CREATE UNIQUE INDEX "MasterDataItem_domain_code_key" ON "MasterDataItem"("domain", "code");
CREATE UNIQUE INDEX "LeadCustomerMap_leadId_customerId_key" ON "LeadCustomerMap"("leadId", "customerId");
CREATE UNIQUE INDEX "MergeRequest_duplicateCaseId_key" ON "MergeRequest"("duplicateCaseId");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- Indexes
CREATE INDEX "Store_isActive_name_idx" ON "Store"("isActive", "name");
CREATE INDEX "SalesUser_storeId_isActive_idx" ON "SalesUser"("storeId", "isActive");
CREATE INDEX "MasterDataItem_domain_isActive_sortOrder_idx" ON "MasterDataItem"("domain", "isActive", "sortOrder");
CREATE INDEX "Lead_visitDatetime_idx" ON "Lead"("visitDatetime");
CREATE INDEX "Lead_storeId_visitDatetime_idx" ON "Lead"("storeId", "visitDatetime");
CREATE INDEX "Lead_salesId_visitDatetime_idx" ON "Lead"("salesId", "visitDatetime");
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
CREATE INDEX "Lead_identityStatus_createdAt_idx" ON "Lead"("identityStatus", "createdAt");
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");
CREATE INDEX "Lead_lineId_idx" ON "Lead"("lineId");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "LeadStatusHistory_leadId_changedAt_idx" ON "LeadStatusHistory"("leadId", "changedAt");
CREATE INDEX "LeadStatusHistory_toStatus_changedAt_idx" ON "LeadStatusHistory"("toStatus", "changedAt");
CREATE INDEX "Customer_displayName_idx" ON "Customer"("displayName");
CREATE INDEX "Customer_primaryPhone_idx" ON "Customer"("primaryPhone");
CREATE INDEX "Customer_primaryLineId_idx" ON "Customer"("primaryLineId");
CREATE INDEX "LeadCustomerMap_customerId_mappedAt_idx" ON "LeadCustomerMap"("customerId", "mappedAt");
CREATE INDEX "LeadCustomerMap_identityStatus_mappedAt_idx" ON "LeadCustomerMap"("identityStatus", "mappedAt");
CREATE INDEX "DuplicateCase_status_createdAt_idx" ON "DuplicateCase"("status", "createdAt");
CREATE INDEX "DuplicateCase_signal_idx" ON "DuplicateCase"("signal");
CREATE INDEX "DuplicateCaseLead_leadId_idx" ON "DuplicateCaseLead"("leadId");
CREATE INDEX "MergeRequest_status_createdAt_idx" ON "MergeRequest"("status", "createdAt");
CREATE INDEX "MergeRequest_primaryLeadId_idx" ON "MergeRequest"("primaryLeadId");
CREATE INDEX "MergeAction_mergeRequestId_performedAt_idx" ON "MergeAction"("mergeRequestId", "performedAt");
CREATE INDEX "MergeAction_actionType_performedAt_idx" ON "MergeAction"("actionType", "performedAt");
CREATE INDEX "MergeActionSecondaryLead_leadId_idx" ON "MergeActionSecondaryLead"("leadId");
CREATE INDEX "Order_leadId_createdAt_idx" ON "Order"("leadId", "createdAt");
CREATE INDEX "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "AuditEvent_entityType_entityId_createdAt_idx" ON "AuditEvent"("entityType", "entityId", "createdAt");
CREATE INDEX "AuditEvent_actorUserId_createdAt_idx" ON "AuditEvent"("actorUserId", "createdAt");
CREATE INDEX "AuditEvent_actionType_createdAt_idx" ON "AuditEvent"("actionType", "createdAt");

-- Foreign Keys
ALTER TABLE "SalesUser" ADD CONSTRAINT "SalesUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesUser" ADD CONSTRAINT "SalesUser_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_salesId_fkey" FOREIGN KEY ("salesId") REFERENCES "SalesUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeadStatusHistory" ADD CONSTRAINT "LeadStatusHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadStatusHistory" ADD CONSTRAINT "LeadStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeadCustomerMap" ADD CONSTRAINT "LeadCustomerMap_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadCustomerMap" ADD CONSTRAINT "LeadCustomerMap_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadCustomerMap" ADD CONSTRAINT "LeadCustomerMap_mappedByUserId_fkey" FOREIGN KEY ("mappedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DuplicateCase" ADD CONSTRAINT "DuplicateCase_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DuplicateCaseLead" ADD CONSTRAINT "DuplicateCaseLead_duplicateCaseId_fkey" FOREIGN KEY ("duplicateCaseId") REFERENCES "DuplicateCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DuplicateCaseLead" ADD CONSTRAINT "DuplicateCaseLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MergeRequest" ADD CONSTRAINT "MergeRequest_duplicateCaseId_fkey" FOREIGN KEY ("duplicateCaseId") REFERENCES "DuplicateCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MergeRequest" ADD CONSTRAINT "MergeRequest_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MergeRequest" ADD CONSTRAINT "MergeRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MergeAction" ADD CONSTRAINT "MergeAction_mergeRequestId_fkey" FOREIGN KEY ("mergeRequestId") REFERENCES "MergeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MergeAction" ADD CONSTRAINT "MergeAction_primaryLeadId_fkey" FOREIGN KEY ("primaryLeadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MergeAction" ADD CONSTRAINT "MergeAction_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MergeActionSecondaryLead" ADD CONSTRAINT "MergeActionSecondaryLead_mergeActionId_fkey" FOREIGN KEY ("mergeActionId") REFERENCES "MergeAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MergeActionSecondaryLead" ADD CONSTRAINT "MergeActionSecondaryLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
