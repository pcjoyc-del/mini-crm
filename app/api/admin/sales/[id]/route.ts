import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../../../../../lib/auth';

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  return session?.role === 'ADMIN' ? session : null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const sales = await prisma.salesUser.update({
      where: { id },
      data: {
        ...(body.displayName !== undefined && { displayName: body.displayName }),
        ...(body.storeId !== undefined && { storeId: body.storeId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: { store: true },
    });
    return NextResponse.json({ data: sales });
  } catch {
    return NextResponse.json({ error: { message: 'Failed to update sales user' } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }
  try {
    const { id } = await params;
    await prisma.salesUser.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      return NextResponse.json({ error: { message: 'Cannot delete sales user with existing leads' } }, { status: 409 });
    }
    return NextResponse.json({ error: { message: 'Failed to delete sales user' } }, { status: 500 });
  }
}
