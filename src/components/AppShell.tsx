"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CURRENT_USER, PRACTICE } from "@/data/store";

const NAV = [
  { href: "/", label: "Dashboard", icon: "◈" },
  { href: "/schedule", label: "Schedule", icon: "▦" },
  { href: "/patients", label: "Patients", icon: "◎" },
  { href: "/messages", label: "Messages", icon: "✉" },
  { href: "/labs", label: "Labs", icon: "⚗" },
  { href: "/billing", label: "Billing", icon: "$" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span className="brand-orb" aria-hidden />
            <span className="brand-name">Meridian</span>
          </div>
          <div className="brand-sub">Clinical EHR · Practice Suite</div>
        </div>

        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : undefined}
              >
                <span className="nav-icon" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="label">Practice</div>
          <div className="value">{PRACTICE.location}</div>
          <div className="muted" style={{ marginTop: 4, fontSize: "0.8rem" }}>
            {PRACTICE.phone}
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <form className="search" action="/patients" method="get" role="search">
            <span aria-hidden>⌕</span>
            <input
              name="q"
              placeholder="Search patients, MRN, or visit…"
              aria-label="Search patients"
            />
          </form>
          <div className="topbar-meta">
            <span className="chip">Today · Aug 15, 2026</span>
            <div className="user-pill">
              <div className="avatar">{CURRENT_USER.initials}</div>
              <div className="meta">
                <span className="name">{CURRENT_USER.name}</span>
                <span className="role">{CURRENT_USER.role}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
