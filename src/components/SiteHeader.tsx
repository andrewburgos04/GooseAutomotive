"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const clientLinks = [
  { href: "/submit", label: "Submit a ticket" },
  { href: "/track", label: "Track a ticket" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand-mark" aria-label="TechSync Systems home">
          <span className="brand-mark__glyph" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M6 16h8M18 16h8M16 6v8M16 18v8"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="3.2" fill="currentColor" />
              <circle cx="6" cy="16" r="2" fill="currentColor" />
              <circle cx="26" cy="16" r="2" fill="currentColor" />
              <circle cx="16" cy="6" r="2" fill="currentColor" />
              <circle cx="16" cy="26" r="2" fill="currentColor" />
            </svg>
          </span>
          <span className="brand-mark__text">
            TechSync <em>Systems</em>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {isAdmin ? (
            <>
              <Link href="/">Client portal</Link>
              <Link href="/admin">Inbox</Link>
            </>
          ) : (
            <>
              {clientLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
              <Link href="/admin/login" className="nav-quiet">
                Admin
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
