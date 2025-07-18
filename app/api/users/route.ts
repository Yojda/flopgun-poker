import { NextResponse } from 'next/server';
import { prisma } from '@/main/utils/db';

export async function GET() {
  try {
    console.log(`[API] GET /auth/users - at `, new Date().toISOString());
    const users = await prisma.users.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
