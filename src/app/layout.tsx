import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "TechSync Systems | Client Support",
    template: "%s | TechSync Systems",
  },
  description:
    "Client-facing support ticketing for TechSync Systems — submit issues, track progress, and get updates from our team.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="site-footer">
          <span>TechSync Systems — Client Support Portal</span>
          <span>Response targets based on priority</span>
        </footer>
      </body>
    </html>
  );
}
