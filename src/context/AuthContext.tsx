import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types/auth';

interface AuthContextType {
  user: User;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const DEFAULT_USERS: Record<UserRole, User> = {
  police: {
    id: 'usr_pol_8821',
    badgeNumber: 'CP-4402',
    name: 'Inspector Vikram Rathore',
    email: 'v.rathore@police.gov.in',
    role: 'police',
    department: 'Central Crime Branch (Division 4)',
    lastLogin: '2026-10-09T02:15:00Z',
  },
  forensic: {
    id: 'usr_for_1049',
    badgeNumber: 'FSL-892',
    name: 'Dr. Evelyn Vance, PhD',
    email: 'e.vance@fsl.gov.in',
    role: 'forensic',
    department: 'Digital Forensics & Cryptanalysis Lab',
    lastLogin: '2026-10-09T01:40:00Z',
  },
  prosecutor: {
    id: 'usr_pro_3301',
    badgeNumber: 'PP-1108',
    name: 'Advocate Rajesh Sen',
    email: 'r.sen@prosecution.gov.in',
    role: 'prosecutor',
    department: 'Directorate of Public Prosecutions',
    lastLogin: '2026-10-08T19:30:00Z',
  },
  admin: {
    id: 'usr_adm_0001',
    badgeNumber: 'SYS-001',
    name: 'Security Admin Maya Thorne',
    email: 'm.thorne@sentinel.security',
    role: 'admin',
    department: 'Information Security & Access Governance',
    lastLogin: '2026-10-09T02:40:00Z',
  },
  auditor: {
    id: 'usr_aud_7712',
    badgeNumber: 'AUD-304',
    name: 'Senior Auditor Thomas Becker',
    email: 't.becker@oversight.gov.in',
    role: 'auditor',
    department: 'Independent Judicial Audit Board',
    lastLogin: '2026-10-08T16:00:00Z',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('police');

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
  };

  const user = DEFAULT_USERS[currentRole];

  return (
    <AuthContext.Provider value={{ user, switchRole, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
