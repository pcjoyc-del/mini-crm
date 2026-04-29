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
    const sales = await prisma.salesUser.findMany({
      orderBy: { displayName: 'asc' },
      include: { store: true },
    });
    return NextResponse.json({ data: sales });
  } catch {
    return NextResponse.json({ error: { message: 'Failed to fetch sales users' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { employeeCode, displayName, storeId } = body;

    if (!employeeCode || !displayName) {
      return NextResponse.json({ error: { message: 'employeeCode and displayName are required' } }, { status: 400 });
    }

    const sales = await prisma.salesUser.create({
      data: {
        employeeCode: employeeCode.trim(),
        displayName: displayName.trim(),
        ...(storeId ? { storeId } : {}),
      },
      include: { store: true },
    });

    return NextResponse.json({ data: sales }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: { message: 'Employee code already exists' } }, { status: 409 });
    }
    return NextResponse.json({ error: { message: 'Failed to create sales user' } }, { status: 500 });
  }
}
