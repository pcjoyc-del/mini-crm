/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // No sample data — use /admin pages to add Stores, Sales Users, and Master Data
  console.log('Seed complete. Add data via /admin.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
