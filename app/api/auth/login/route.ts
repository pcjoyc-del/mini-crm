import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { message: 'Email and password required' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        salesProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: { message: 'User not found' } },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: { message: 'Invalid password' } },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    const res = NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { error: { message: 'Login failed' } },
      { status: 500 }
    );
  }
}