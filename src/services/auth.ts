import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { SignUpWithPasswordCredentials, SignInWithPasswordCredentials } from '@supabase/supabase-js';

const NOT_CONFIGURED_MSG = 'Supabase credentials are not configured in .env.local. Please configure your project URL & Anon Key, or click "Explore as Guest / Reviewer".';

export const signUp = async (credentials: SignUpWithPasswordCredentials) => {
  if (!isSupabaseConfigured) {
    throw new Error(NOT_CONFIGURED_MSG);
  }
  const { data, error } = await supabase.auth.signUp(credentials);
  if (error) throw error;
  return data;
};

export const signIn = async (credentials: SignInWithPasswordCredentials) => {
  if (!isSupabaseConfigured) {
    throw new Error(NOT_CONFIGURED_MSG);
  }
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!isSupabaseConfigured) {
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const signInWithGoogle = async () => {
  if (!isSupabaseConfigured) {
    throw new Error(NOT_CONFIGURED_MSG);
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        prompt: 'select_account',
      },
      scopes: 'email profile openid',
    },
  });
  if (error) throw error;
  return data;
};
