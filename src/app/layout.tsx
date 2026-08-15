import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian Clinical — EHR & Practice Suite",
  description:
    "Demo electronic health record and practice management software inspired by modern ambulatory EHR workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
