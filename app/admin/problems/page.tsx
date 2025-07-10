import { listProblems } from '../../actions/problemActions';
import ProblemAdminClient from './ProblemAdminClient';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/main/utils/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const encoder = new TextEncoder();
const secret = encoder.encode(JWT_SECRET);

export default async function ProblemAdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    // Vérifier et décoder le JWT
    const { payload } = await jwtVerify(token, secret);

    // Récupérer l'utilisateur avec l'ID du token
    const user = await prisma.users.findUnique({
      where: {
        id: payload.userId as number
      }
    });

    console.log('User found:', user); // Pour le débogage

    if (!user || user.role !== 'admin') {
      redirect('/');
    }

    const problems = await listProblems();
    return <ProblemAdminClient initialProblems={problems} />;

  } catch (error) {
    console.error('Token verification failed:', error);
    redirect('/login');
  }
}
