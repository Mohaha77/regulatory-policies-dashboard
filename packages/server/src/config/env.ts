import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
  jwtAccessExpiry: (process.env.JWT_ACCESS_EXPIRY || '15m') as any,
  jwtRefreshExpiry: (process.env.JWT_REFRESH_EXPIRY || '7d') as any,
  dbPath: process.env.DB_PATH || './data/database.sqlite',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  corsOrigin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173'),
};
