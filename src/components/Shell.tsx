import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ClipboardList, Gauge, LogOut, Plus, Users, Wrench } from "lucide-react";
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
          <img src="/logo.png" alt="Goose Automotive" className="h-10 w-auto" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted">{user.title} · {user.name}</p>
          </div>
          <select
            className="ml-auto max-w-[220px] rounded-lg border border-navy/15 bg-mist px-3 py-2 text-sm font-medium text-navy"
            value={location.id}
            onChange={(event) => setLocation(event.target.value as typeof location.id)}
          >
            {locations.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          {user.role !== "tech" && (
            <button
              className="hidden items-center gap-1 rounded-full bg-goose px-4 py-2 text-sm font-bold text-white hover:bg-goose-dark sm:flex"
              onClick={() => navigate("/ro/new")}
              type="button"
            >
              <Plus className="h-4 w-4" /> New RO
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-0 md:gap-6">
        <nav className="hidden w-52 shrink-0 flex-col gap-1 p-4 md:flex">
          <NavLink to="/board" className={linkClass}><ClipboardList className="h-4 w-4" /> Job board</NavLink>
          <NavLink to="/techs" className={linkClass}><Wrench className="h-4 w-4" /> Tech board</NavLink>
          <NavLink to="/customers" className={linkClass}><Users className="h-4 w-4" /> Customers</NavLink>
          <NavLink to="/ro/new" className={linkClass}><Plus className="h-4 w-4" /> New RO</NavLink>
          <div className="mt-auto space-y-1 pt-8">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-white" onClick={resetDemo} type="button">
              <Gauge className="h-4 w-4" /> Reset demo
            </button>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-white" onClick={logout} type="button">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </nav>
        <main className="min-w-0 flex-1 px-4 py-4 pb-24 md:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-navy/10 bg-white text-navy md:hidden">
        <NavLink to="/board" className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold"><ClipboardList className="h-5 w-5" /> Board</NavLink>
        <NavLink to="/techs" className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold"><Wrench className="h-5 w-5" /> Techs</NavLink>
        <NavLink to="/customers" className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold"><Users className="h-5 w-5" /> Customers</NavLink>
        <NavLink to="/ro/new" className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold"><Plus className="h-5 w-5" /> New RO</NavLink>
      </nav>
    </div>
  );
}
