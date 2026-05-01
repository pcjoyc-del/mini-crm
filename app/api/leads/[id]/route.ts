import { NextRequest, NextResponse } from 'next/server';
import { IdentityStatus, LeadStatus } from '@prisma/client';
import { prisma } from '../../../../lib/prisma';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../../../../lib/auth';

function text(value: unknown) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v === '' ? null : v;
}

function codes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string' && v.trim() !== '');
}

function getUser(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

function canEditLead(user: any, lead: any) {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
  return lead.sales?.userId === user.id;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        store: true,
        sales: true,
        interestedModels: true,
        categories: true,
        materials: true,
        visits: {
          orderBy: { visitDatetime: 'desc' },
          include: { store: true, sales: true },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Lead not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: lead });
  } catch (error) {
    console.error('GET /api/leads/[id] failed:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch lead' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUser(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin only' } },
        { status: 403 }
      );
    }
    const { id } = await context.params;
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Lead not found' } },
        { status: 404 }
      );
    }
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('DELETE /api/leads/[id] failed:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete lead' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const existingLead = await prisma.lead.findUnique({
      where: { id },
      include: {
        sales: true,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Lead not found' } },
        { status: 404 }
      );
    }

    if (!canEditLead(user, existingLead)) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You can edit only your own leads' } },
        { status: 403 }
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        leadName: text(body.leadName),
        phone: text(body.phone),
        lineId: text(body.lineId),
        residentLocation: text(body.residentLocation),

        sizeText: text(body.sizeText),
        priceRangeCode: text(body.priceRangeCode),
        usageTimingCode: text(body.usageTimingCode),
        interestedModels: { deleteMany: {}, create: codes(body.interestedModelCodes).map((code) => ({ code })) },
        categories:       { deleteMany: {}, create: codes(body.categoryCodes).map((code) => ({ code })) },
        materials:        { deleteMany: {}, create: codes(body.materialCodes).map((code) => ({ code })) },

        note: text(body.note),

        status: body.status as LeadStatus,
        identityStatus: body.identityStatus as IdentityStatus,
        followUpTemperature: (['HOT', 'WARM', 'COLD', 'UNKNOWN'].includes(body.followUpTemperature) ? body.followUpTemperature : 'UNKNOWN') as any,

        customerName: body.status === 'WON' ? text(body.customerName) : null,
        salesOrderNo: body.status === 'WON' ? text(body.salesOrderNo) : null,

        updatedById: user.id,
      },
      include: {
        store: true,
        sales: true,
        interestedModels: true,
        categories: true,
        materials: true,
        visits: {
          orderBy: { visitDatetime: 'desc' },
          include: { store: true, sales: true },
        },
      },
    });

    return NextResponse.json({ data: lead });
  } catch (error) {
    console.error('PATCH /api/leads/[id] failed:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update lead' } },
      { status: 500 }
    );
  }
}