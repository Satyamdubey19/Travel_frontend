'use client';

import Link from 'next/link';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import FormLabel from '@/components/ui/FormLabel';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Add your password reset logic here
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse"></div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-100 backdrop-blur-sm bg-opacity-95">
          {!submitted ? (
            <>
              <div className="mb-8 text-center">
                <Link href="/" className="inline-block mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-xl font-bold text-white shadow-xl hover:shadow-2xl transition transform hover:scale-105 mx-auto">
                    GH
                  </div>
                </Link>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
                <p className="text-slate-600">Enter your email to reset your password</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-base font-semibold disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-slate-600 text-sm">
                  Remember your password?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-sky-600 hover:text-sky-700 transition"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h3>
                <p className="text-slate-600 mb-2">
                  We've sent a password reset link to <span className="font-semibold">{email}</span>
                </p>
                <p className="text-sm text-slate-500">
                  Click the link in the email to create a new password. If you don't see the email, check your spam folder.
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/login'}
                className="w-full py-3 text-base font-semibold"
              >
                Back to Sign In
              </Button>
              <p className="text-slate-600 text-sm">
                Didn't receive an email?{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="font-semibold text-sky-600 hover:text-sky-700 transition"
                >
                  Try Again
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
