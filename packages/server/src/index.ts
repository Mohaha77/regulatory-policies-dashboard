import { env } from './config/env';
import { runMigrations } from './db/migrate';
import { db } from './config/database';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import app from './app';

// Run migrations on startup
runMigrations();

// Auto-seed admin user if none exists
async function autoSeed() {
  const existing = db.select().from(users).where(eq(users.username, 'admin')).get();
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    db.insert(users).values({
      username: 'admin',
      passwordHash,
      displayNameEn: 'Administrator',
      displayNameAr: 'مدير النظام',
      role: 'admin',
      isActive: true,
      isAbsent: false,
      preferredLang: 'ar',
      preferredTheme: 'light',
    }).run();
    console.log('Auto-seeded admin user (admin / admin123)');
  }
}

autoSeed().then(() => {
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    console.log(`API: http://localhost:${env.port}/api/v1`);
  });
});
