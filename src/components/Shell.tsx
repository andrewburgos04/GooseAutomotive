import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Calendar, ClipboardList, Clock, Gauge, LogOut, MessageSquare, Package, Plus, Settings, Sparkles, Users, Wrench } from "lucide-react";
import { PoweredBy } from "./PoweredBy";
import { useCurrentUser, useShop } from "../store";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
    isActive ? "bg-goose text-white" : "text-navy hover:bg-mist"
  }`;

export function Shell({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const location = useShop((s) => s.locations.find((l) => l.id === s.currentLocationId));
  const locations = useShop((s) => s.locations);
  const setLocation = useShop((s) => s.setLocation);
  const logout = useShop((s) => s.logout);
  const resetDemo = useShop((s) => s.resetDemo);
  const navigate = useNavigate();

  if (!user || !location) return null;

  return (
    <div className="min-h-screen bg-mist text-navy">
      <header className="sticky top-0 z-40 border-b border-navy/10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3">
          <div className="shrink-0">
            <img src="/logo.png" alt="Goose Automotive" className="h-10 w-auto" />
            <PoweredBy className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-muted" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted">{user.title} · {user.name}</p>
          </div>
          <select
            className="ml-auto max-w-[220px] rounded-lg border border-navy/15 bg-mist px-3 py-2 text-sm font-medium text-navy"
            value={location.id}
            onChange={(event) => setLocation(event.target.value as typeof location.id)}
          >
            {locations.map((shop) => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
          {user.role !== "tech" && (
            <button className="hidden items-center gap-1 rounded-full bg-goose px-4 py-2 text-sm font-bold text-white hover:bg-goose-dark sm:flex" onClick={() => navigate("/ro/new")} type="button">
              <Plus className="h-4 w-4" /> New RO
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <nav className="hidden w-56 shrink-0 flex-col gap-1 overflow-y-auto p-4 md:flex">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted">Shop floor</p>
          <NavLink to="/board" className={linkClass}><ClipboardList className="h-4 w-4" /> Job board</NavLink>
          <NavLink to="/techs" className={linkClass}><Wrench className="h-4 w-4" /> Tech board</NavLink>
          <NavLink to="/calendar" className={linkClass}><Calendar className="h-4 w-4" /> Calendar</NavLink>
          <NavLink to="/clock" className={linkClass}><Clock className="h-4 w-4" /> Time clock</NavLink>
          <NavLink to="/customers" className={linkClass}><Users className="h-4 w-4" /> Customers</NavLink>
          <p className="mt-3 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted">Office</p>
          <NavLink to="/inventory" className={linkClass}><Package className="h-4 w-4" /> Parts & stock</NavLink>
          <NavLink to="/messages" className={linkClass}><MessageSquare className="h-4 w-4" /> SMS / email</NavLink>
          <NavLink to="/reports" className={linkClass}><BarChart3 className="h-4 w-4" /> Reports</NavLink>
          <NavLink to="/marketing" className={linkClass}><Sparkles className="h-4 w-4" /> Marketing</NavLink>
          <NavLink to="/settings" className={linkClass}><Settings className="h-4 w-4" /> Settings</NavLink>
          <div className="mt-auto space-y-1 pt-8">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-white" onClick={resetDemo} type="button">
              <Gauge className="h-4 w-4" /> Reset demo
            </button>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-white" onClick={logout} type="button">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
            <PoweredBy className="px-3 pt-3 text-[10px] uppercase tracking-[0.14em] text-muted" />
          </div>
        </nav>
        <main className="min-w-0 flex-1 px-4 py-4 pb-24 md:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-navy/10 bg-white text-navy md:hidden">
        <NavLink to="/board" className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold"><ClipboardList className="h-5 w-5" /> Board</NavLink>
        <NavLink to="/techs" className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold"><Wrench className="h-5 w-5" /> Techs</NavLink>
        <NavLink to="/clock" className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold"><Clock className="h-5 w-5" /> Clock</NavLink>
        <NavLink to="/calendar" className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold"><Calendar className="h-5 w-5" /> Book</NavLink>
        <NavLink to="/reports" className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold"><BarChart3 className="h-5 w-5" /> Reports</NavLink>
      </nav>
    </div>
  );
}
