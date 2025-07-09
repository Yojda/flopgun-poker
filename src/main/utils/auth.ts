import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

export function verifyAuth(token?: string) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}
