import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { hashPassword, verifySessionToken, SESSION_COOKIE_NAME } from '../../../../../lib/auth';

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  return session?.role === 'ADMIN' ? session : null;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }
  try {
    const { id } = await context.params;
    const body = await req.json();

    const data: any = {};
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.newPassword) data.passwordHash = hashPassword(body.newPassword);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        salesProfile: {
          select: { id: true, employeeCode: true, displayName: true },
        },
      },
    });

    return NextResponse.json({ data: user });
  } catch {
    return NextResponse.json({ error: { message: 'Failed to update user' } }, { status: 500 });
  }
}
