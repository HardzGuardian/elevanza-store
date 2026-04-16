'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { auth } from '@/core/auth/auth';
import { db } from '@/core/db';
import { users } from '@/core/db/schema';

type CustomerRole = 'admin' | 'customer';

async function assertAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return session.user;
}

export async function updateCustomerRole(userId: number, role: CustomerRole) {
  try {
    const currentUser = await assertAdmin();

    if (Number.parseInt(currentUser.id, 10) === userId && role !== 'admin') {
      return { success: false, error: 'You cannot remove your own admin access.' };
    }

    await db.update(users).set({ role }).where(eq(users.id, userId));

    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error) {
    console.error('Failed to update customer role:', error);
    return { success: false, error: 'Failed to update customer role.' };
  }
}

