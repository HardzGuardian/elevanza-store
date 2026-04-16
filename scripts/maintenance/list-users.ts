import 'dotenv/config';
import { db } from './index';
import { users } from './schema';

async function listUsers() {
  console.log('👥 Listing users...');
  try {
    const allUsers = await db.select().from(users);
    console.table(allUsers.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
  } catch (error) {
    console.error('❌ Failed to list users:', error);
  }
}

listUsers();
