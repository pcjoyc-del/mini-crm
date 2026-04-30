import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashPassword, verifySessionToken, SESSION_COOKIE_NAME } from '../../../../lib/auth';

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  return session?.role === 'ADMIN' ? session : null;
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }
  try {
    const users = await prisma.user.findMany({
      orderBy: { fullName: 'asc' },
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
    return NextResponse.json({ data: users });
  } catch {
    return NextResponse.json({ error: { message: 'Failed to fetch users' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { fullName, email, password, role, employeeCode } = body;

    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { error: { message: 'fullName, email, password, and role are required' } },
        { status: 400 }
      );
    }

    if (role === 'SALES' && !employeeCode) {
      return NextResponse.json(
        { error: { message: 'Employee code is required for SALES role' } },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role,
        isActive: true,
        ...(role === 'SALES' && employeeCode
          ? {
              salesProfile: {
                create: {
                  employeeCode: employeeCode.trim().toUpperCase(),
                  displayName: fullName.trim(),
                },
              },
            }
          : {}),
      },
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

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const field = error?.meta?.target?.includes('email') ? 'Email' : 'Employee code';
      return NextResponse.json(
        { error: { message: `${field} already exists` } },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: { message: 'Failed to create user' } }, { status: 500 });
  }
}
