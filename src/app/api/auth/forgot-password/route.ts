import { NextResponse } from 'next/server';
import { db } from '@/core/db';
import { users } from '@/core/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '@/core/email/mailer';

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

  // Always return success to avoid leaking whether an email exists
  if (!user) return NextResponse.json({ success: true });

  // Token encodes userId + first 8 chars of current password hash
  // Once the password changes, the hash changes → old token becomes invalid
  const token = jwt.sign(
    { sub: user.id, email: user.email, ph: user.password.slice(0, 8) },
    SECRET,
    { expiresIn: '1h' }
  );

  try {
    await sendPasswordResetEmail(user.email, token);
  } catch (err) {
    console.error('Failed to send reset email:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
