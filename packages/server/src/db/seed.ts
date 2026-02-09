import { runMigrations } from './migrate';
import { db } from '../config/database';
import { users } from './schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seed() {
  runMigrations();

  const existing = db.select().from(users).where(eq(users.username, 'admin')).get();
  if (existing) {
    console.log('Admin user already exists, skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash('admin123', 10);

  db.insert(users).values({
    username: 'admin',
    passwordHash,
    displayNameEn: 'Administrator',
    displayNameAr: 'مدير النظام',
    role: 'admin',
    isActive: true,
    isAbsent: false,
    preferredLang: 'en',
    preferredTheme: 'light',
  }).run();

  console.log('Seed completed. Admin user created (admin / admin123)');
}

seed().catch(console.error).finally(() => process.exit(0));
