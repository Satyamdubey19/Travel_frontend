'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import FormLabel from '@/components/ui/FormLabel';
import SocialAuthButton from '@/components/ui/SocialAuthButton';
import Alert from '@/components/ui/Alert';
import { signIn } from 'next-auth/react';
import api, { getApiErrorMessage } from '@/lib/axios';

interface SignupFormProps {
  initialAccountType?: 'USER' | 'HOST';
}

export default function SignupForm({ initialAccountType = 'USER' }: SignupFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accountType, setAccountType] = useState<'USER' | 'HOST'>(initialAccountType);
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (accountType === 'HOST' && !businessName.trim()) {
      setError('Please enter your business or brand name');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to terms and conditions');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
          name,
          email,
          phone,
          password,
          role: accountType === 'HOST' ? 'host' : 'user',
          businessName: accountType === 'HOST' ? businessName : undefined,
      });
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        type: accountType,
      });
      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      const nextUrl = accountType === 'HOST' ? '/host' : '/';
      router.refresh();
      window.location.assign(nextUrl);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create account. Please try again.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const handleSocialSignup = () => {
  signIn("google", {
    callbackUrl: "/",
  });
};

  return (
    <div className="w-full max-w-md">
      {error && (
        <Alert variant="error" className="mb-5">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account type toggle */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1 mb-2">
          <button
            type="button"
            onClick={() => setAccountType('USER')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
              accountType === 'USER'
                ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            I'm a Traveler
          </button>
          <button
            type="button"
            onClick={() => setAccountType('HOST')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
              accountType === 'HOST'
                ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            I'm a Host
          </button>
        </div>
        {accountType === 'HOST' && (
          <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            List your hotel, tour, or rental and start accepting bookings.
          </p>
        )}

        {/* Name Field */}
        <div>
          <FormLabel htmlFor="name" required>
            Full Name
          </FormLabel>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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

        {/* Phone Field */}
        <div>
          <FormLabel htmlFor="phone" required>
            Phone Number
          </FormLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {accountType === 'HOST' && (
          <div>
            <FormLabel htmlFor="businessName" required>
              Business Name
            </FormLabel>
            <Input
              id="businessName"
              type="text"
              placeholder="Enter your property or brand name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
        )}

        {/* Password Field */}
        <div>
          <FormLabel htmlFor="password" required>
            Password
          </FormLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
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

        {/* Confirm Password Field */}
        <div>
          <FormLabel htmlFor="confirmPassword" required>
            Confirm Password
          </FormLabel>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
            >
              {showConfirmPassword ? (
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

        {/* Terms Checkbox */}
        <Checkbox
          id="agreeTerms"
          label={
            <>
              I agree to the{' '}
              <Link href="/terms" className="text-sky-600 hover:text-sky-700 transition">
                Terms & Conditions
              </Link>
            </>
          }
          checked={agreeTerms}
          onCheckedChange={(checked) => setAgreeTerms(checked === true)}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-base font-semibold disabled:opacity-60 mt-6"
        >
          {loading ? 'Creating Account...' : accountType === 'HOST' ? 'Create Host Account' : 'Sign Up'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-slate-500 font-medium">Or sign up with</span>
        </div>
      </div>

      {/* Social Signup Buttons */}
      <div className="mb-6">
        <SocialAuthButton
          icon={<GoogleIcon />}
          label="Google"
          onClick={handleSocialSignup}
          className="w-full"
        />
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-slate-600 text-sm">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-sky-600 hover:text-sky-700 transition"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
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

