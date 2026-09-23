import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import AppProviders from "./providers";

export const metadata: Metadata = {
  title: "Travels Pro - Trips, Tours, Activities, and Rentals",
  description: "Discover and book trips, tours, activities, and rentals with Travels Pro",
  keywords: "tours, trips, activities, rentals, travel, booking, destinations",
  authors: [{ name: "Travels Pro" }],
  creator: "Travels Pro",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Travels Pro",
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
    <html lang="en" className="h-full antialiased">
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
