import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from '../trpc/client';
import { Toaster } from 'sonner';
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Next.js App",
  description: "A modern Next.js application",
  metadataBase: new URL('http://localhost:3000'),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans h-full bg-white text-gray-900`}>
        <div className="min-h-full">
          <TRPCReactProvider>
            {children}
            <Toaster />
          </TRPCReactProvider>
        </div>
      </body>
    </html>
  );
}
