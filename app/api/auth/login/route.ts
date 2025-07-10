import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/main/utils/db';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const encoder = new TextEncoder();
const secret = encoder.encode(JWT_SECRET);

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  const user = await prisma.users.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Génération du token JWT avec jose
  const token = await new SignJWT({ userId: user.id, name: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  const response = NextResponse.json({ 
    message: 'Login successful',
    token: token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours en secondes
    sameSite: 'lax',
  });

  return response;
}
