import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../../../../lib/auth';

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  return session?.role === 'ADMIN' ? session : null;
}

export async function GET() {
  try {
    const stores = await prisma.store.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ data: stores });
  } catch {
    return NextResponse.json({ error: { message: 'Failed to fetch stores' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { code, name, region } = body;

    if (!code || !name) {
      return NextResponse.json({ error: { message: 'code and name are required' } }, { status: 400 });
    }

    const store = await prisma.store.create({
      data: { code: code.trim(), name: name.trim(), region: region?.trim() || null },
    });

    return NextResponse.json({ data: store }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: { message: 'Store code already exists' } }, { status: 409 });
    }
    return NextResponse.json({ error: { message: 'Failed to create store' } }, { status: 500 });
  }
}
