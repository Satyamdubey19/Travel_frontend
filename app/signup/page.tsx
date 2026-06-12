'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SignupForm from '@/components/auth/SignupForm';

const benefits = [
  {
    title: 'Secure Account',
    description: 'Your data is protected',
    icon: <ShieldIcon className="h-5 w-5 text-blue-700" />,
  },
  {
    title: 'Exclusive Rewards',
    description: 'Earn points on every booking',
    icon: <GemIcon className="h-5 w-5 text-blue-700" />,
  },
  {
    title: 'Personalized Recommendations',
    description: 'Tailored to your preferences',
    icon: <TargetIcon className="h-5 w-5 text-blue-700" />,
  },
  {
    title: 'Global Support',
    description: '24/7 customer service',
    icon: <GlobeIcon className="h-5 w-5 text-blue-700" />,
  },
];

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupShell initialAccountType="USER" />}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const searchParams = useSearchParams();
  const initialAccountType = searchParams.get('type') === 'host' ? 'HOST' : 'USER';
  return <SignupShell initialAccountType={initialAccountType} />;
}

function SignupShell({ initialAccountType }: { initialAccountType: 'USER' | 'HOST' }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center px-4 py-12">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="w-full order-2 md:order-1">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-100 backdrop-blur-sm bg-opacity-95">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                <p className="text-slate-600">Join GetHotels and start your journey</p>
              </div>

              <SignupForm initialAccountType={initialAccountType} />
            </div>
          </div>

          {/* Right Side - Welcome Section */}
          <div className="hidden md:flex flex-col justify-center space-y-8 order-1 md:order-2">
            <div>
              <Link href="/" className="inline-block mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-2xl font-bold text-white shadow-xl hover:shadow-2xl transition transform hover:scale-105">
                  GH
                </div>
              </Link>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">Adventure</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                Join millions of travelers discovering incredible destinations and experiences on GetHotels
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 transition transform group-hover:scale-110 group-hover:bg-blue-200">
                    {benefit.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{benefit.title}</p>
                    <p className="text-sm text-slate-500">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-600">50K+</p>
                <p className="text-xs text-slate-500">Properties</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-600">500K+</p>
                <p className="text-xs text-slate-500">Happy Travelers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-600">150+</p>
                <p className="text-xs text-slate-500">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBase({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3s5 2 7 3v5c0 4.5-2.9 7.3-7 10-4.1-2.7-7-5.5-7-10V6c2-1 7-3 7-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.5 12.5 1.8 1.8 3.7-4" />
    </IconBase>
  );
}

function GemIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9 9 4h6l3 5-6 11L6 9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4l3 5 3-5M6 9h12" />
    </IconBase>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
    </IconBase>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z" />
    </IconBase>
  );
}
