import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const token = cookie
    .split('; ')
    .find((c) => c.startsWith('token='))
    ?.split('=')[1];

  if (!token) {
    return NextResponse.json({ isLoggedIn: false });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; name: string };
    return NextResponse.json({ isLoggedIn: true, name: payload.name });
  } catch {
    return NextResponse.json({ isLoggedIn: false });
  }
}
