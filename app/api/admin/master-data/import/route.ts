import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../../../../../lib/auth';

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  return session?.role === 'ADMIN' ? session : null;
}

type ImportItem = { code: string; label: string; sortOrder?: number };

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { domain, items } = body as { domain: string; items: ImportItem[] };

    if (!domain || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: { message: 'domain and items are required' } },
        { status: 400 }
      );
    }

    const incomingCodes = items.map((i) => i.code.trim().toUpperCase()).filter(Boolean);

    const existing = await prisma.masterDataItem.findMany({
      where: { domain, code: { in: incomingCodes } },
      select: { code: true },
    });
    const existingCodes = new Set(existing.map((e) => e.code));

    const toInsert = items
      .map((i) => ({ ...i, code: i.code.trim().toUpperCase(), label: i.label.trim() }))
      .filter((i) => i.code && i.label && !existingCodes.has(i.code));

    const currentMax = await prisma.masterDataItem.aggregate({
      where: { domain },
      _max: { sortOrder: true },
    });
    const baseSort = (currentMax._max.sortOrder ?? 0) + 1;

    if (toInsert.length > 0) {
      await prisma.masterDataItem.createMany({
        data: toInsert.map((item, idx) => ({
          domain,
          code: item.code,
          label: item.label,
          sortOrder: item.sortOrder ?? baseSort + idx,
          isActive: true,
        })),
      });
    }

    return NextResponse.json({
      data: {
        imported: toInsert.length,
        skipped: [...existingCodes].filter((c) => incomingCodes.includes(c)),
        total: items.length,
      },
    });
  } catch {
    return NextResponse.json({ error: { message: 'Import failed' } }, { status: 500 });
  }
}
