import { UserRole } from './enums';

export interface User {
  id: number;
  username: string;
  displayNameEn: string;
  displayNameAr: string;
  role: UserRole;
  isActive: boolean;
  isAbsent: boolean;
  preferredLang: 'en' | 'ar';
  preferredTheme: 'light' | 'dark';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  displayNameEn: string;
  displayNameAr: string;
  role: UserRole;
}

export interface UpdateUserInput {
  displayNameEn?: string;
  displayNameAr?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserPreferences {
  preferredLang?: 'en' | 'ar';
  preferredTheme?: 'light' | 'dark';
}
