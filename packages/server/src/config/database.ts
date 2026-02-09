import Database from 'better-sqlite3';
import type BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from './env';
import * as schema from '../db/schema';

const dbDir = path.dirname(path.resolve(env.dbPath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite: BetterSqlite3.Database = new Database(path.resolve(env.dbPath));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export { sqlite };
