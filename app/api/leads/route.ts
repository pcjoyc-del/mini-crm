import { NextRequest, NextResponse } from 'next/server';
import { LeadSource, LeadStatus } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

function text(value: unknown) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v === '' ? null : v;
}

function bool(value: unknown) {
  if (value === true) return true;
  if (value === false) return false;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function normalizeSource(value: unknown): LeadSource {
  const v = text(value);

  if (v === 'Walk-in' || v === 'WALK_IN') return 'WALK_IN' as LeadSource;
  if (v === 'Line' || v === 'LINE') return 'LINE' as LeadSource;
  if (v === 'Facebook' || v === 'FACEBOOK') return 'FACEBOOK' as LeadSource;
  if (v === 'Referral' || v === 'REFERRAL') return 'REFERRAL' as LeadSource;
  if (v === 'Phone' || v === 'PHONE') return 'PHONE' as LeadSource;

  return 'WALK_IN' as LeadSource;
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        status: {
          not: 'WON' as LeadStatus,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        store: true,
        sales: true,
        visits: {
          orderBy: { visitDatetime: 'desc' },
          include: {
            store: true,
            sales: true,
          },
        },
      },
    });

    return NextResponse.json({ data: leads });
  } catch (error) {
    console.error('GET /api/leads failed:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch leads',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const store = body.storeId
      ? await prisma.store.findFirst({
          where: {
            OR: [{ id: body.storeId }, { name: body.storeId }],
          },
        })
      : await prisma.store.findFirst({
          where: {
            name: text(body.store) || text(body.storeName) || '',
          },
        });

    const sales = body.salesId
      ? await prisma.salesUser.findFirst({
          where: {
            OR: [{ id: body.salesId }, { displayName: body.salesId }],
          },
        })
      : await prisma.salesUser.findFirst({
          where: {
            displayName: text(body.sales) || text(body.salesName) || '',
          },
        });

    if (!store) {
      return NextResponse.json(
        { error: { code: 'STORE_NOT_FOUND', message: 'storeId is invalid' } },
        { status: 400 }
      );
    }

    if (!sales) {
      return NextResponse.json(
        { error: { code: 'SALES_NOT_FOUND', message: 'salesId is invalid' } },
        { status: 400 }
      );
    }

    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@sofaplus.co.th' },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: { code: 'ADMIN_NOT_FOUND', message: 'Admin user not found' } },
        { status: 400 }
      );
    }

    const sourceValue = normalizeSource(body.source);

    const visitDate = body.visitDatetime
      ? new Date(body.visitDatetime)
      : new Date();

    const lead = await prisma.lead.create({
      data: {
        leadName: text(body.leadName),
        phone: text(body.phone),
        lineId: text(body.lineId),
        residentLocation: text(body.residentLocation),

        interestedModelCode: text(body.interestedModelCode),
        categoryCode: text(body.categoryCode),
        materialCode: text(body.materialCode),
        sizeText: text(body.sizeText),
        priceRangeCode: text(body.priceRangeCode),
        usageTimingCode: text(body.usageTimingCode),
        onlySofa: bool(body.onlySofa),

        visitDatetime: visitDate,
        store:     { connect: { id: store.id } },
        sales:     { connect: { id: sales.id } },
        source: sourceValue,

        note: text(body.note),
        status: 'NEW_LEAD' as LeadStatus,

        createdBy: { connect: { id: adminUser.id } },
        updatedBy: { connect: { id: adminUser.id } },

        visits: {
          create: {
            visitDatetime: visitDate,
            storeId: store.id,
            salesId: sales.id,
            source: sourceValue,
            visitPurpose: text(body.visitPurpose),
            firstQuestion: text(body.firstQuestion),
            note: text(body.note),
          },
        },
      },
      include: {
        store: true,
        sales: true,
        visits: {
          orderBy: { visitDatetime: 'desc' },
          include: {
            store: true,
            sales: true,
          },
        },
      },
    });

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (error) {
    console.error('POST /api/leads failed:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create lead',
        },
      },
      { status: 500 }
    );
  }
}