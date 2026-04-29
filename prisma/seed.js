/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all sample data...');

  await prisma.auditEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.mergeActionSecondaryLead.deleteMany();
  await prisma.mergeAction.deleteMany();
  await prisma.mergeRequest.deleteMany();
  await prisma.duplicateCaseLead.deleteMany();
  await prisma.duplicateCase.deleteMany();
  await prisma.leadCustomerMap.deleteMany();
  await prisma.leadStatusHistory.deleteMany();
  await prisma.leadVisit.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.salesUser.deleteMany();
  await prisma.store.deleteMany();
  await prisma.masterDataItem.deleteMany();
  await prisma.user.deleteMany();

  console.log('Done. Run "npx tsx scripts/seed-auth-users.ts" next to recreate the admin user.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
