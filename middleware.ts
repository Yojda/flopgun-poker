import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Redirige vers login si pas de token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    const pathname = request.nextUrl.pathname;

    // Si l'utilisateur accède à /admin/* mais n'est pas admin, redirige
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Autorise l'accès sinon
    return NextResponse.next();

  } catch (err) {
    console.error(`Token verification failed: ${err}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/problems/:path*'], // protégé par auth
};
