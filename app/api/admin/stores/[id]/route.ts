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
    const store = await prisma.store.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.region !== undefined && { region: body.region }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return NextResponse.json({ data: store });
  } catch {
    return NextResponse.json({ error: { message: 'Failed to update store' } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }
  try {
    const { id } = await params;
    await prisma.store.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      return NextResponse.json({ error: { message: 'Cannot delete store with existing leads or sales users' } }, { status: 409 });
    }
    return NextResponse.json({ error: { message: 'Failed to delete store' } }, { status: 500 });
  }
}
