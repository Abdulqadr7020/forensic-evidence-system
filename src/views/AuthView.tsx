import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const AuthView: React.FC = () => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    continueAsGuest,
    authError,
    clearAuthError,
    isConfigured,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    clearAuthError();
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, fullName || undefined);
        setSuccessMessage('Registration initiated. If confirmation is required, check your email.');
      }
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearAuthError();
    setSuccessMessage(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const toggleMode = () => {
    clearAuthError();
    setSuccessMessage(null);
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-black select-none">
      {/* Dynamic Ambient Glow Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Cyber Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Top/Center Cyan Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Emerald Corner Accent Glow */}
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Indigo Ambient Accent */}
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Floating Centered Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-cyan-500/15 bg-[#02050e]/92 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.06)] p-6 sm:p-8"
      >
        {/* Card Header: Sentinel DMS Shield & Welcome */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-3">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center justify-center gap-2">
            Sentinel DMS
          </h1>

          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {mode === 'signin' ? 'Welcome back, Officer' : 'Register Judicial Clearance'}
          </p>
        </div>

        {/* Advisory banner if Supabase credentials are placeholders */}
        {!isConfigured && (
          <div className="flex items-start gap-2.5 p-3 mb-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="flex-1 text-[11px] leading-relaxed">
              <span className="font-semibold text-amber-200">Demo Environment:</span> Supabase URL & Key not yet configured in <code className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">.env.local</code>. Click <button type="button" onClick={continueAsGuest} className="text-cyan-300 underline font-medium hover:text-cyan-200 ml-0.5">Explore as Guest</button> below to test all dashboard features.
            </div>
          </div>
        )}

        {/* Google OAuth Button on Top */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] text-white text-xs sm:text-sm font-medium transition-all shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] cursor-pointer disabled:opacity-50"
          >
            {isGoogleSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
            <span>Continue with Google</span>
          </button>

          {/* Illuminated Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-white/[0.08]" />
            <span className="absolute px-3 bg-[#02050e] text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
              or credentials
            </span>
          </div>
        </div>

        {/* Error / Success Feedback */}
        <AnimatePresence mode="wait">
          {authError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">{authError}</div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs mb-4"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="flex-1">{successMessage}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1.5">
                Full Name & Rank
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Inspector V. Rathore"
                  className="w-full h-10 px-3 rounded-lg border border-white/[0.08] bg-black/30 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1.5">
              Official Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-neutral-500 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@sentinel.security"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-white/[0.08] bg-black/30 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1.5">
              Secure Key / Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-neutral-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 pl-9 pr-10 rounded-lg border border-white/[0.08] bg-black/30 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.99] text-black text-xs font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_28px_rgba(6,182,212,0.4)] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Authenticate Session' : 'Create Clearance'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Mode Switcher Link */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>{mode === 'signin' ? "Don't have an account?" : 'Already registered?'}</span>
            <span className="text-cyan-400 font-medium underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-400">
              {mode === 'signin' ? 'Create an account' : 'Sign in here'}
            </span>
          </button>
        </div>

        {/* Quick Demo Bypass Option */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={continueAsGuest}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400/70" />
            <span>Explore as Guest / Reviewer</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
