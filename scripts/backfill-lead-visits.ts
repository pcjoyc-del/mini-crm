import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start backfilling LeadVisit...');

  const leads = await prisma.lead.findMany({
    include: {
      visits: true,
    },
  });

  let createdCount = 0;
  let skippedCount = 0;

  for (const lead of leads) {
    if (lead.visits.length > 0) {
      skippedCount++;
      continue;
    }

    if (!lead.visitDatetime || !lead.storeId || !lead.salesId || !lead.source) {
      console.log(`Skip lead ${lead.id}: missing visit fields`);
      skippedCount++;
      continue;
    }

    await prisma.leadVisit.create({
      data: {
        leadId: lead.id,
        visitDatetime: lead.visitDatetime,
        storeId: lead.storeId,
        salesId: lead.salesId,
        source: lead.source,
       
        note: lead.note ?? null,
        
      },
    });

    createdCount++;
    console.log(`Created LeadVisit for lead ${lead.id}`);
  }

  console.log('Backfill complete.');
  console.log(`Created: ${createdCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

main()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });