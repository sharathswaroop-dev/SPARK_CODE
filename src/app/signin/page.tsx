'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Code2, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/playground';
  const urlError = searchParams.get('error');

  useEffect(() => {
    if (urlError) {
      if (urlError === 'OAuthAccountNotLinked') {
        setError('An account with this email already exists using a different sign-in method.');
      } else if (urlError === 'OAuthCallbackError' || urlError === 'CallbackRouteError') {
        setError('Authentication callback failed. Please verify your environment credentials or try again.');
      } else if (urlError === 'Configuration') {
        setError('Server configuration issue detected. Please check AUTH_SECRET and provider keys on Render.');
      } else if (urlError === 'AccessDenied') {
        setError('Access denied. You do not have permission to sign in.');
      } else {
        setError(`Authentication error: ${urlError}`);
      }
    }
  }, [urlError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError('');
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch (err) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Code2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500">Sign in to execute code and access your study groups.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* ── OAuth Social Logins ── */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={oauthLoading !== null || loading}
            onClick={() => handleOAuthSignIn('google')}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 font-bold text-xs text-slate-700 shadow-xs flex items-center justify-center gap-2.5 transition active:scale-[0.99] disabled:opacity-60"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            disabled={oauthLoading !== null || loading}
            onClick={() => handleOAuthSignIn('github')}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 font-bold text-xs text-white shadow-xs flex items-center justify-center gap-2.5 transition active:scale-[0.99] disabled:opacity-60"
          >
            {oauthLoading === 'github' ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            or continue with email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* ── Credentials Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="signin-email" className="text-xs font-bold text-slate-700">
              Email Address
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="input text-xs"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="signin-password" className="text-xs font-bold text-slate-700">
              Password
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading || oauthLoading !== null}
            className="btn-primary w-full py-3 text-xs flex justify-center items-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link href="/signup" className="text-indigo-600 font-bold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
