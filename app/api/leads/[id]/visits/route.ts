import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

function text(value: unknown) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v === '' ? null : v;
}

function badRequest(message: string) {
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message } },
    { status: 400 }
  );
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (!body.visitDatetime) return badRequest('visitDatetime is required');
    if (!body.storeId) return badRequest('storeId is required');
    if (!body.salesId) return badRequest('salesId is required');
    if (!body.source) return badRequest('source is required');

    const visitDate = new Date(body.visitDatetime);
    if (Number.isNaN(visitDate.getTime())) {
      return badRequest('visitDatetime is invalid');
    }

    const sales = await prisma.salesUser.findFirst({
      where: {
        OR: [{ id: body.salesId }, { employeeCode: body.salesId }],
      },
    });

    if (!sales) return badRequest('salesId is invalid');

    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@sofaplus.co.th' },
    });

    if (!adminUser) return badRequest('Admin user not found — run seed-auth-users script first');

    const visit = await prisma.leadVisit.create({
      data: {
        leadId: id,
        visitDatetime: visitDate,
        storeId: body.storeId,
        salesId: sales.id,
        source: body.source as any,
        visitPurpose: text(body.visitPurpose),
        firstQuestion: text(body.firstQuestion),
        note: text(body.note),
      },
    });

    await prisma.lead.update({
      where: { id },
      data: {
        visitDatetime: visitDate,
        storeId: body.storeId,
        salesId: sales.id,
        source: body.source as any,
        updatedById: adminUser.id,
      },
    });

    return NextResponse.json({ data: visit }, { status: 201 });
  } catch (error) {
    console.error('POST /api/leads/[id]/visits failed:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create visit' } },
      { status: 500 }
    );
  }
}