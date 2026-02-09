import { env } from './config/env';
import { runMigrations } from './db/migrate';
import app from './app';

// Run migrations on startup
runMigrations();

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
  console.log(`API: http://localhost:${env.port}/api/v1`);
});
