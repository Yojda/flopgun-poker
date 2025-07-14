import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Déconnecté' });

  console.log(`[API] POST /auth/logout - at`, new Date().toISOString());

  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0), // Expire immédiatement
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return response;
}
