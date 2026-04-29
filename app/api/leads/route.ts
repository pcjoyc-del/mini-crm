import { NextRequest, NextResponse } from 'next/server';
import { IdentityStatus, LeadSource, LeadStatus } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../../../lib/auth';

function text(value: unknown) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v === '' ? null : v;
}

function bool(value: unknown) {
  if (value === true) return true;
  if (value === false) return false;
  return null;
}

function getUser(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

function badRequest(message: string) {
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message } },
    { status: 400 }
  );
}

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const where =
      user.role === 'ADMIN' || user.role === 'MANAGER'
        ? {}
        : {
            sales: {
              userId: user.id,
            },
          };

    const leads = await prisma.lead.findMany({
      where,
      include: {
        store: { select: { id: true, name: true } },
        sales: { select: { id: true, displayName: true, userId: true } },
        visits: {
          orderBy: { visitDatetime: 'desc' },
          include: {
            store: { select: { id: true, name: true } },
            sales: { select: { id: true, displayName: true, userId: true } },
          },
        },
      },
      orderBy: { visitDatetime: 'desc' },
      take: 100,
    });

    return NextResponse.json({ data: leads });
  } catch (error) {
    console.error('GET /api/leads failed:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch leads' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

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

    if (user.role === 'SALES' && sales.userId !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Sales can create only own leads' } },
        { status: 403 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        leadName: text(body.leadName),
        phone: text(body.phone),
        lineId: text(body.lineId),
        residentLocation: text(body.residentLocation),

        visitDatetime: visitDate,
        storeId: body.storeId,
        salesId: sales.id,
        source: body.source as LeadSource,

        interestedModelCode: text(body.interestedModelCode),
        categoryCode: text(body.categoryCode),
        materialCode: text(body.materialCode),
        sizeText: text(body.sizeText),
        priceRangeCode: text(body.priceRangeCode),
        usageTimingCode: text(body.usageTimingCode),
        onlySofa: bool(body.onlySofa),

        visitPurpose: text(body.visitPurpose),
        firstQuestion: text(body.firstQuestion),

        note: text(body.note),
        status: LeadStatus.NEW_LEAD,
        identityStatus: IdentityStatus.UNVERIFIED,

        createdById: user.id,
        updatedById: user.id,

        visits: {
          create: {
            visitDatetime: visitDate,
            storeId: body.storeId,
            salesId: sales.id,
            source: body.source as LeadSource,
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
          include: { store: true, sales: true },
        },
      },
    });

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (error) {
    console.error('POST /api/leads failed:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create lead' } },
      { status: 500 }
    );
  }
}