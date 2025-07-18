import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/main/utils/db';

export async function POST(request: Request) {
  const { username, email, password } = await request.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existingUser = await prisma.users.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  console.log(`[API] POST /auth/register - body `, username, email, password,  `at `, new Date().toISOString());

  return NextResponse.json({ message: 'User created', userId: user.id }, { status: 201 });
}
