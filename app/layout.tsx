import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import AppProviders from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travels Pro - Trips, Tours, Activities, and Rentals",
  description: "Discover and book trips, tours, activities, and rentals with Travels Pro",
  keywords: "tours, trips, activities, rentals, travel, booking, destinations",
  authors: [{ name: "GetHotels" }],
  creator: "GetHotels",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gethotels.com",
    siteName: "GetHotels",
    title: "Travels Pro - Trips, Tours, Activities, and Rentals",
    description: "Discover and book trips, tours, activities, and rentals",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <AuthProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </AuthProvider>
        </AppProviders>
      </body>
    </html>
  );
}
