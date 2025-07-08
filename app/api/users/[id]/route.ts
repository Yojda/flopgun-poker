import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
