import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

export function getUploadPath(storedName: string): string {
  return path.resolve(env.uploadDir, storedName);
}

export function deleteFile(storedName: string): boolean {
  try {
    const filePath = getUploadPath(storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
