import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../../../../lib/auth';

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  return session?.role === 'ADMIN' ? session : null;
}

export async function GET(req: NextRequest) {
  try {
    const domain = req.nextUrl.searchParams.get('domain');
    const activeOnly = req.nextUrl.searchParams.get('active') === 'true';

    const where = {
      ...(domain ? { domain } : {}),
      ...(activeOnly ? { isActive: true } : {}),
    };

    const items = await prisma.masterDataItem.findMany({
      where,
      orderBy: [{ domain: 'asc' }, { sortOrder: 'asc' }],
    });

    return NextResponse.json({ data: items });
  } catch {
    return NextResponse.json({ error: { message: 'Failed to fetch master data' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { domain, code, label, sortOrder } = body;

    if (!domain || !code || !label) {
      return NextResponse.json({ error: { message: 'domain, code, and label are required' } }, { status: 400 });
    }

    const item = await prisma.masterDataItem.create({
      data: { domain, code: code.trim().toUpperCase(), label: label.trim(), sortOrder: sortOrder ?? 0 },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: { message: 'Code already exists in this domain' } }, { status: 409 });
    }
    return NextResponse.json({ error: { message: 'Failed to create item' } }, { status: 500 });
  }
}
