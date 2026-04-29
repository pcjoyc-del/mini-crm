/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.auditEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.mergeActionSecondaryLead.deleteMany();
  await prisma.mergeAction.deleteMany();
  await prisma.mergeRequest.deleteMany();
  await prisma.duplicateCaseLead.deleteMany();
  await prisma.duplicateCase.deleteMany();
  await prisma.leadCustomerMap.deleteMany();
  await prisma.leadStatusHistory.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.salesUser.deleteMany();
  await prisma.store.deleteMany();
  await prisma.masterDataItem.deleteMany();
  await prisma.user.deleteMany();

  const [admin, supervisor, salesAuth1, salesAuth2] = await Promise.all([
    prisma.user.create({ data: { email: 'admin@sofaplus.co.th', fullName: 'System Admin', role: 'ADMIN', passwordHash: 'seed-hash-admin' } }),
    prisma.user.create({ data: { email: 'supervisor.bkk@sofaplus.co.th', fullName: 'Nicha Supervisor', role: 'SUPERVISOR', passwordHash: 'seed-hash-supervisor' } }),
    prisma.user.create({ data: { email: 'sales1@sofaplus.co.th', fullName: 'Ploy Sales', role: 'SALES', passwordHash: 'seed-hash-sales1' } }),
    prisma.user.create({ data: { email: 'sales2@sofaplus.co.th', fullName: 'Ton Sales', role: 'SALES', passwordHash: 'seed-hash-sales2' } })
  ]);

  const [storeBkk, storeCnx] = await Promise.all([
    prisma.store.create({ data: { code: 'BKK-BANGNA', name: 'Sofa Plus Bangna', region: 'Bangkok' } }),
    prisma.store.create({ data: { code: 'CNX-CENTRAL', name: 'Sofa Plus Central Chiang Mai', region: 'Chiang Mai' } })
  ]);

  const [sales1, sales2, sales3] = await Promise.all([
    prisma.salesUser.create({ data: { employeeCode: 'SP-S-001', displayName: 'Ploy (Bangna)', storeId: storeBkk.id, userId: salesAuth1.id } }),
    prisma.salesUser.create({ data: { employeeCode: 'SP-S-002', displayName: 'Ton (Bangna)', storeId: storeBkk.id, userId: salesAuth2.id } }),
    prisma.salesUser.create({ data: { employeeCode: 'SP-S-003', displayName: 'Mint (Chiang Mai)', storeId: storeCnx.id } })
  ]);

  const masterDataItems = [
    ['interested_model', 'MOD_L_SHAPE', 'L-Shape Sofa'],
    ['interested_model', 'MOD_RECLINER', 'Recliner Sofa'],
    ['price_range', 'PR_20_40K', '20,000-40,000 THB'],
    ['price_range', 'PR_40_70K', '40,001-70,000 THB'],
    ['usage_timing', 'USE_IMMEDIATE', 'Immediate (0-1 month)'],
    ['usage_timing', 'USE_3_6M', 'Within 3-6 months'],
    ['residence_type', 'RES_CONDO', 'Condo'],
    ['residence_type', 'RES_HOUSE', 'House'],
    ['customer_group', 'CG_NEWLYWED', 'Newly-wed'],
    ['customer_group', 'CG_FAMILY', 'Family with kids'],
    ['age_range', 'AGE_25_34', '25-34'],
    ['age_range', 'AGE_35_44', '35-44'],
    ['customer_type_flag', 'CTF_FIRST_TIME', 'First-time buyer'],
    ['customer_type_flag', 'CTF_REPLACE', 'Replacement buyer'],
    ['interested_product_category', 'CAT_SOFA_SET', 'Sofa Set'],
    ['interested_product_category', 'CAT_RECLINER', 'Recliner']
  ].map(([domain, code, label], i) => ({ domain, code, label, sortOrder: i + 1, isActive: true }));

  await prisma.masterDataItem.createMany({ data: masterDataItems });

  const leads = [
    {
      visitDatetime: new Date('2026-04-10T10:15:00Z'), storeId: storeBkk.id, salesId: sales1.id,
      customerName: 'Kittipong S.', phone: '0812345678', lineId: 'kitti.home', source: 'WALK_IN',
      interestedModelCode: 'MOD_L_SHAPE', priceRangeCode: 'PR_40_70K', usageTimingCode: 'USE_3_6M',
      residenceTypeCode: 'RES_HOUSE', customerGroupCode: 'CG_FAMILY', ageRangeCode: 'AGE_35_44',
      customerLocation: 'Bangna, Bangkok', firstQuestion: 'Do you have fabric that is pet-friendly?',
      customerTypeFlagCode: 'CTF_REPLACE', interestedProductCategoryCode: 'CAT_SOFA_SET',
      note: 'Came with spouse, wants gray tone.', status: 'FOLLOW_UP', identityStatus: 'UNVERIFIED',
      createdById: supervisor.id, updatedById: supervisor.id
    },
    {
      visitDatetime: new Date('2026-04-11T06:40:00Z'), storeId: storeBkk.id, salesId: sales2.id,
      customerName: null, phone: '0898881122', lineId: null, source: 'PHONE_CALL',
      interestedModelCode: null, priceRangeCode: null, usageTimingCode: 'USE_IMMEDIATE',
      residenceTypeCode: null, customerGroupCode: null, ageRangeCode: null,
      customerLocation: 'Samut Prakan', firstQuestion: 'What is your delivery time?',
      customerTypeFlagCode: null, interestedProductCategoryCode: 'CAT_RECLINER',
      note: 'Save-first call lead; name pending.', status: 'NEW_LEAD', identityStatus: 'UNVERIFIED',
      createdById: salesAuth2.id, updatedById: salesAuth2.id
    },
    {
      visitDatetime: new Date('2026-04-12T09:10:00Z'), storeId: storeCnx.id, salesId: sales3.id,
      customerName: 'Patchara T.', phone: '0861112233', lineId: 'patchara_t', source: 'LINE',
      interestedModelCode: 'MOD_RECLINER', priceRangeCode: 'PR_20_40K', usageTimingCode: 'USE_IMMEDIATE',
      residenceTypeCode: 'RES_CONDO', customerGroupCode: 'CG_NEWLYWED', ageRangeCode: 'AGE_25_34',
      customerLocation: 'Mueang Chiang Mai', firstQuestion: 'Any 0% installment?',
      customerTypeFlagCode: 'CTF_FIRST_TIME', interestedProductCategoryCode: 'CAT_RECLINER',
      note: 'Requested installment details.', status: 'NEGOTIATING', identityStatus: 'PARTIAL_MATCH',
      createdById: salesAuth1.id, updatedById: salesAuth1.id
    }
  ];

  for (let i = 0; i < 9; i += 1) {
    leads.push({
      visitDatetime: new Date(Date.UTC(2026, 3, 13 + i, 3 + (i % 8), 20, 0)),
      storeId: i % 2 === 0 ? storeBkk.id : storeCnx.id,
      salesId: i % 3 === 0 ? sales1.id : i % 3 === 1 ? sales2.id : sales3.id,
      customerName: i % 4 === 0 ? null : `Walk-in Customer ${i + 1}`,
      phone: `08${70000000 + i}`,
      lineId: i % 3 === 0 ? `line_customer_${i + 1}` : null,
      source: i % 2 === 0 ? 'WALK_IN' : 'FACEBOOK',
      interestedModelCode: i % 2 === 0 ? 'MOD_L_SHAPE' : 'MOD_RECLINER',
      priceRangeCode: i % 3 === 0 ? 'PR_40_70K' : 'PR_20_40K',
      usageTimingCode: i % 2 === 0 ? 'USE_3_6M' : 'USE_IMMEDIATE',
      residenceTypeCode: i % 2 === 0 ? 'RES_HOUSE' : 'RES_CONDO',
      customerGroupCode: i % 2 === 0 ? 'CG_FAMILY' : 'CG_NEWLYWED',
      ageRangeCode: i % 2 === 0 ? 'AGE_35_44' : 'AGE_25_34',
      customerLocation: i % 2 === 0 ? 'Bangkok Metro' : 'Chiang Mai City',
      firstQuestion: i % 2 === 0 ? 'Can I choose custom fabric?' : 'Any promotions this month?',
      customerTypeFlagCode: i % 2 === 0 ? 'CTF_REPLACE' : 'CTF_FIRST_TIME',
      interestedProductCategoryCode: i % 2 === 0 ? 'CAT_SOFA_SET' : 'CAT_RECLINER',
      note: i % 4 === 0 ? 'Partial capture from quick visit.' : 'Complete showroom conversation logged.',
      status: i % 5 === 0 ? 'NEW_LEAD' : i % 5 === 1 ? 'FOLLOW_UP' : i % 5 === 2 ? 'NEGOTIATING' : i % 5 === 3 ? 'WON' : 'LOST',
      identityStatus: i % 3 === 0 ? 'UNVERIFIED' : i % 3 === 1 ? 'PARTIAL_MATCH' : 'VERIFIED',
      createdById: i % 2 === 0 ? supervisor.id : salesAuth1.id,
      updatedById: i % 2 === 0 ? supervisor.id : salesAuth1.id
    });
  }

  await prisma.lead.createMany({ data: leads });

  console.log(`Seeded ${leads.length} leads, 2 stores, 3 sales users, and controlled master data.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
