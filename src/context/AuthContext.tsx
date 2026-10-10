import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, UserRole } from '../types/auth';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
} from '../services/auth';

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
    email: 'm.thorne@forencrypt.security',
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

export interface AuthContextType {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  user: User;
  isAuthenticated: boolean;
  isGuest: boolean;
  isConfigured: boolean;
  loading: boolean;
  authError: string | null;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  clearAuthError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('police');
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => {
    setAuthError(null);
  };

  const sanitizeUrl = () => {
    if (
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('error') ||
      window.location.search.includes('code=') ||
      window.location.search.includes('error=')
    ) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    // Check URL parameters for OAuth errors or tokens on mount
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash
    );
    const searchParams = new URLSearchParams(window.location.search);

    const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
    const errorCode = hashParams.get('error') || searchParams.get('error');

    if (errorDesc || errorCode) {
      setAuthError(decodeURIComponent(errorDesc || errorCode || 'Authentication failed'));
      sanitizeUrl();
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Fetch initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        if (session) {
          sanitizeUrl();
        }
      } catch (err: any) {
        console.warn('Error initializing auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        setLoading(false);
        if (session) {
          setIsGuest(false);
          sanitizeUrl();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthError(null);
      await authSignIn({ email, password });
      setIsGuest(false);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in with email');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      setAuthError(null);
      await authSignUp({
        email,
        password,
        options: name ? { data: { full_name: name } } : undefined,
      });
      setIsGuest(false);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign up');
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      await authSignInWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to initiate Google sign in');
      throw err;
    }
  };

  const continueAsGuest = () => {
    setAuthError(null);
    setIsGuest(true);
  };

  const signOut = async () => {
    try {
      setAuthError(null);
      setIsGuest(false);
      await authSignOut();
      setSession(null);
      setSupabaseUser(null);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  // Derive app user profile from active Supabase session or default role preset
  const defaultUser = DEFAULT_USERS[currentRole];
  const appUser: User = session && supabaseUser
    ? {
        id: supabaseUser.id,
        badgeNumber: supabaseUser.user_metadata?.badge_number || defaultUser.badgeNumber,
        name:
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          supabaseUser.email?.split('@')[0] ||
          defaultUser.name,
        email: supabaseUser.email || defaultUser.email,
        role: (supabaseUser.user_metadata?.role as UserRole) || currentRole,
        department: supabaseUser.user_metadata?.department || defaultUser.department,
        avatarUrl:
          supabaseUser.user_metadata?.avatar_url ||
          supabaseUser.user_metadata?.picture ||
          defaultUser.avatarUrl,
        lastLogin: supabaseUser.last_sign_in_at || new Date().toISOString(),
      }
    : defaultUser;

  const value: AuthContextType = {
    session,
    supabaseUser,
    user: appUser,
    isAuthenticated: !!session || isGuest,
    isGuest,
    isConfigured: isSupabaseConfigured,
    loading,
    authError,
    currentRole,
    switchRole,
    clearAuthError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    continueAsGuest,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
