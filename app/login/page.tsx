'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

const travelerFeatures = [
  ['GH', 'Find Your Perfect Stay', 'Thousands of hotels worldwide'],
  ['TR', 'Plan Exciting Tours', 'Curated travel experiences'],
  ['Rs', 'Best Prices Guaranteed', 'Exclusive deals and transparent pricing'],
];

const hostFeatures = [
  ['$', 'Earn More Revenue', 'Get bookings from thousands of travelers'],
  ['📋', 'Manage with Ease', 'Full dashboard for bookings & guests'],
  ['⭐', 'Build Your Reputation', 'Collect verified reviews and grow'],
];

const adminFeatures = [
  ['AD', 'Admin Control Center', 'Review users, hosts, bookings, and payouts'],
  ['KY', 'KYC & Listings', 'Approve host verification and property inventory'],
  ['SEC', 'Secure Operations', 'Use admin-only access for platform management'],
];

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell role="traveler" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role')?.toUpperCase();
  const role = roleParam === 'ADMIN' ? 'admin' : roleParam === 'HOST' ? 'host' : 'traveler';
  return <LoginShell role={role} />;
}

function LoginShell({ role }: { role: 'traveler' | 'host' | 'admin' }) {
  const isHost = role === 'host';
  const isAdmin = role === 'admin';
  const features = isAdmin ? adminFeatures : isHost ? hostFeatures : travelerFeatures;
  const expectedRole = isAdmin ? 'ADMIN' : isHost ? 'HOST' : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-5xl">
        <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">
          <div className="hidden flex-col justify-center space-y-8 md:flex">
            <div>
              <Link href="/" className="inline-block mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-2xl font-bold text-white shadow-xl hover:shadow-2xl transition transform hover:scale-105">
                  GH
                </div>
              </Link>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                {isAdmin ? (
                  <>Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">Login</span></>
                ) : isHost ? (
                  <>Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">Host</span></>
                ) : (
                  <>Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">Back</span></>
                )}
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                {isAdmin
                  ? 'Sign in with an admin account to manage the GetHotels platform.'
                  : isHost
                    ? 'Sign in to your host account and manage your bookings, guests, and listings.'
                    : 'Sign in to your GetHotels account and continue exploring amazing destinations.'}
              </p>
            </div>

            <div className="space-y-4">
              {features.map(([icon, title, text]) => (
                <div key={title} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sm font-black text-sky-700 group-hover:bg-sky-200 transition transform group-hover:scale-110">
                    {icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition">
              <div className="mb-3 flex gap-1 text-amber-400">
                {[...Array(5)].map((_, index) => (
                  <span key={index} className="text-lg">★</span>
                ))}
              </div>
              <p className="text-slate-700 font-medium mb-3">
                {isAdmin
                  ? '"A focused admin workspace keeps moderation, verification, and platform operations in one place."'
                  : isHost
                    ? '"GetHotels helped me grow my rental business 3x. The dashboard is intuitive and bookings keep coming!"'
                    : '"GetHotels made my vacation planning so easy and affordable. Highly recommended!"'}
              </p>
              <p className="text-sm text-slate-500">
                {isHost ? 'Rajesh Kumar · Host since 2022' : 'Sarah Johnson · Travel Enthusiast'}
              </p>
            </div>
          </div>

          <div className="w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-100 backdrop-blur-sm bg-opacity-95">
              {/* Role Tab Switcher */}
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1 mb-6">
                <Link
                  href="/login"
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                    !isHost && !isAdmin
                      ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Traveler
                </Link>
                <Link
                  href="/login?role=HOST"
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isHost
                      ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Host
                </Link>
                <Link
                  href="/login?role=ADMIN"
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isAdmin
                      ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 4.5-2.8 7.8-7 9-4.2-1.2-7-4.5-7-9V7l7-4z" />
                  </svg>
                  Admin
                </Link>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {isAdmin ? 'Admin Sign In' : isHost ? 'Host Sign In' : 'Sign In'}
                </h2>
                <p className="text-slate-600">
                  {isAdmin ? 'Access the admin dashboard' : isHost ? 'Access your host dashboard' : 'Access your GetHotels account'}
                </p>
              </div>

              <LoginForm expectedRole={expectedRole} />

              {isHost && (
                <p className="text-center text-sm text-slate-500 mt-4">
                  New host?{' '}
                  <Link href="/host/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition">
                    Create a host account
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
