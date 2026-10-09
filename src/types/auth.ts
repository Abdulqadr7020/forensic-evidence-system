export type UserRole = 'police' | 'forensic' | 'prosecutor' | 'admin' | 'auditor';

export interface User {
  id: string;
  badgeNumber?: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';
