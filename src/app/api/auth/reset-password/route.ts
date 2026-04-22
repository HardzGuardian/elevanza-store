import { NextResponse } from 'next/server';
import { db } from '@/core/db';
import { users } from '@/core/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

  let payload: any;
  try {
    payload = jwt.verify(token, SECRET);
  } catch {
    return NextResponse.json({ error: 'Reset link is invalid or has expired' }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Check the password hash prefix matches — if not, link was already used
  if (user.password.slice(0, 8) !== payload.ph) {
    return NextResponse.json({ error: 'Reset link has already been used' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  await db.update(users).set({ password: hashed }).where(eq(users.id, user.id));

  return NextResponse.json({ success: true });
}
