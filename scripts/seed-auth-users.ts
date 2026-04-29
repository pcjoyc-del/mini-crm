import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';

async function main() {
  const defaultPassword = '123456';

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sofaplus.co.th' },
    update: {
      fullName: 'Admin User',
      role: 'ADMIN' as any,
      isActive: true,
      passwordHash: hashPassword(defaultPassword),
    },
    create: {
      email: 'admin@sofaplus.co.th',
      fullName: 'Admin User',
      role: 'ADMIN' as any,
      isActive: true,
      passwordHash: hashPassword(defaultPassword),
    },
  });

  const salesUsers = [
    {
      email: 'ploy@sofaplus.co.th',
      fullName: 'Ploy (Bangna)',
      employeeCode: 'SP-S-001',
    },
    {
      email: 'ton@sofaplus.co.th',
      fullName: 'Ton (Bangna)',
      employeeCode: 'SP-S-002',
    },
    {
      email: 'mint@sofaplus.co.th',
      fullName: 'Mint (Chiang Mai)',
      employeeCode: 'SP-S-003',
    },
  ];

  for (const sales of salesUsers) {
    const user = await prisma.user.upsert({
      where: { email: sales.email },
      update: {
        fullName: sales.fullName,
        role: 'SALES' as any,
        isActive: true,
        passwordHash: hashPassword(defaultPassword),
      },
      create: {
        email: sales.email,
        fullName: sales.fullName,
        role: 'SALES' as any,
        isActive: true,
        passwordHash: hashPassword(defaultPassword),
      },
    });

    await prisma.salesUser.updateMany({
      where: { employeeCode: sales.employeeCode },
      data: { userId: user.id },
    });
  }

  console.log('Seed auth users complete.');
  console.log('Default password:', defaultPassword);
  console.log('Admin:', admin.email);
}

main()
  .catch((error) => {
    console.error('Seed auth users failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });