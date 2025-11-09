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
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ffffff',
};

/**
 * App root layout that provides global TRPC context and mounts a global toast container.
 *
 * @param children - The page content to render inside the root layout
 * @returns The root HTML element tree for the application, including provider and toast container
 */
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