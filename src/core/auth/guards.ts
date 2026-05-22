import { auth } from '@/core/auth/auth';

/**
 * Asserts the current session belongs to an authenticated admin user.
 * Throws if the session is missing or the user is not an admin.
 * Returns the session user on success.
 */
export async function assertAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  if (session.user.role !== 'admin') throw new Error('Forbidden: admin role required');
  return session.user;
}
