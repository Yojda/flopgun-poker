import { NextResponse } from 'next/server';
import { verifyAuth } from '@/main/utils/auth';
import { prisma } from '@/main/utils/db';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const user = verifyAuth(authHeader);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Exemple : récupérer des infos de l’utilisateur connecté
  const currentUser = await prisma.user.findUnique({ where: { id: (user as any).userId } });

  return NextResponse.json(currentUser);
}
