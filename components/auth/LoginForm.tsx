'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import FormLabel from '@/components/ui/FormLabel';
import SocialAuthButton from '@/components/ui/SocialAuthButton';
import { useAuth } from '@/contexts/AuthContext';
import type { AuthRole } from '@/contexts/AuthContext';
import { signIn } from 'next-auth/react';

type LoginFormProps = {
  expectedRole?: AuthRole;
}
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.7h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.74 2.97-4.3 2.97-7.26Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.24-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.41 13.9A5.98 5.98 0 0 1 6.1 12c0-.66.11-1.3.31-1.9V7.52H3.06A10 10 0 0 0 2 12c0 1.62.39 3.16 1.06 4.48l3.35-2.58Z" fill="#FBBC05" />
      <path d="M12 5.98c1.47 0 2.78.5 3.81 1.49l2.86-2.86C16.96 3 14.7 2 12 2 8.09 2 4.73 4.24 3.06 7.52l3.35 2.58C7.2 7.74 9.4 5.98 12 5.98Z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginForm({ expectedRole }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const isAdminLogin = expectedRole === 'ADMIN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password, expectedRole);
      router.push(user.role === 'ADMIN' ? '/admin' : user.role === 'HOST' ? '/host' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = () => {
  signIn("google", {
    callbackUrl: "/api/auth/google-login",
  });
};

  return (
    <div className="w-full max-w-md">
      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-5">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {isAdminLogin
            ? 'Sign in with an admin account. Non-admin accounts will be blocked from this workspace.'
            : 'Sign in with your email and password. Your account role will be detected automatically.'}
        </div>

        {/* Email Field */}
        <div>
          <FormLabel htmlFor="email" required>
            Email Address
          </FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <FormLabel htmlFor="password" required>
            Password
          </FormLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Checkbox
            id="rememberMe"
            label="Remember me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-sky-600 hover:text-sky-700 transition"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-base font-semibold disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {isAdminLogin && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Demo admin credentials: <span className="font-semibold">admin@gethotels.com</span> / <span className="font-semibold">Admin@123</span>
        </div>
      )}

      {!isAdminLogin && (
        <>
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mb-6">
            <SocialAuthButton
              icon={<GoogleIcon />}
              label="Google"
              onClick={handleSocialLogin}
              className="w-full"
            />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-slate-600 text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-sky-600 hover:text-sky-700 transition"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
