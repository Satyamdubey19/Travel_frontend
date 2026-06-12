'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-block mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-lg font-bold text-white shadow-lg">
              GH
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">Terms & Conditions</h1>
          <p className="text-slate-600">Last updated: April 12, 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-700">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using GetHotels, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. User Accounts</h2>
            <p className="mb-4">
              When you create an account with GetHotels, you must provide information that is accurate, complete, and current at all times. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on GetHotels's web site for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the site</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Booking and Reservations</h2>
            <p className="mb-4">
              GetHotels acts as an intermediary between users and hotel partners. We are not responsible for the quality, accuracy, or availability of accommodations offered by our partners. All bookings are subject to the terms and conditions of the individual properties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Cancellation Policy</h2>
            <p className="mb-4">
              Cancellation policies vary by property and are displayed at the time of booking. Users are responsible for reviewing and accepting the specific cancellation terms before confirming their reservation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall GetHotels or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GetHotels's web site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Accuracy of Materials</h2>
            <p className="mb-4">
              The materials appearing on GetHotels's web site could include technical, typographical, or photographic errors. GetHotels does not warrant that any of the materials on our web site are accurate, complete, or current.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Modifications</h2>
            <p className="mb-4">
              GetHotels may revise these terms of service for our web site at any time without notice. By using this web site, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms & Conditions, please contact us at:
            </p>
            <p className="text-slate-600">
              Email: support@gethotels.com<br />
              Address: GetHotels Inc., 123 Travel Street, Adventure City, AC 12345
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-600">
          <p>© 2026 GetHotels. All rights reserved.</p>
          <Link href="/" className="text-sky-600 hover:text-sky-700 transition mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
