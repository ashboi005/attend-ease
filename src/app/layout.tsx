import type { Metadata } from "next";
import { Crimson_Text } from "next/font/google";
import "./globals.css";

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Attend Ease - Smart Attendance System",
  description: "Modern attendance management system for schools and institutions",
};

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${crimsonText.variable} antialiased`}
        style={{fontFamily: 'var(--font-crimson), serif'}}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
