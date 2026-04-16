import 'dotenv/config';
import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

async function promoteToAdmin(email: string) {
  console.log(`🚀 Promoting ${email} to admin...`);
  try {
    const result = await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email));
    
    console.log('✅ User promoted successfully. Please log out and log back in to refresh your session.');
  } catch (error) {
    console.error('❌ Promotion failed:', error);
  }
}

promoteToAdmin('sagarsalunkhe98@gmail.com');
