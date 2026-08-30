import { useState } from "react";
import { Link } from "react-router-dom";
import { PoweredBy } from "../components/PoweredBy";
import { useShop } from "../store";

export function LoginPage() {
  const users = useShop((s) => s.users);
  const locations = useShop((s) => s.locations);
  const login = useShop((s) => s.login);
  const loginWithPin = useShop((s) => s.loginWithPin);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const shops = locations.filter((location) => users.some((user) => user.locationId === location.id));

  return (
    <div className="min-h-screen bg-mist text-navy">
      <header className="border-b border-navy/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <img src="/logo.png" alt="Goose Automotive" className="h-12 w-auto" />
          <p className="hidden text-sm font-semibold text-navy-brand sm:block">Let Goose be your wingman.</p>
        </div>
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2">
        <div>
          <p className="font-accent text-sm font-bold uppercase tracking-[0.18em] text-goose">Goose Automotive</p>
          <h1 className="mt-3 max-w-lg text-5xl font-extrabold leading-[0.95] text-navy md:text-6xl">The shop app for Goose techs and advisors.</h1>
          <p className="mt-5 max-w-md text-muted">
            Same family. Same 3-year / 36,000-mile warranty. Job board, 32-point DVI, estimates, clocks, and the office tools that used to live in Tekmetric.
          </p>
          <p className="mt-4 text-sm"><Link className="font-semibold text-goose" to="/book">Customer booking →</Link></p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="mb-4 text-2xl font-extrabold text-navy">Shop login</h2>
          <form className="mb-5 flex gap-2" onSubmit={(e) => { e.preventDefault(); setError(loginWithPin(pin) ? "" : "Unknown PIN"); }}>
            <input className="flex-1 rounded-lg border border-navy/10 px-3 py-2" inputMode="numeric" placeholder="PIN (Andi 1002 · Marco 2001)" value={pin} onChange={(e) => setPin(e.target.value)} />
            <button className="rounded-lg bg-goose px-4 py-2 font-bold text-white" type="submit">Sign in</button>
          </form>
          {error && <p className="mb-3 text-sm text-goose">{error}</p>}
          <p className="mb-3 text-xs text-muted">Or tap a teammate. PIN login is per browser; tickets live in the shared shop database.</p>
          <div className="space-y-5">
            {shops.map((shop) => (
              <div key={shop.id}>
                <p className="mb-2 font-accent text-xs font-bold uppercase tracking-wider text-goose">{shop.name}</p>
                <div className="grid gap-2">
                  {users
                    .filter((user) => user.locationId === shop.id)
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => login(user.id)}
                        className="flex items-center justify-between rounded-xl border border-navy/10 bg-mist px-4 py-3 text-left hover:border-goose"
                      >
                        <span>
                          <span className="block font-semibold text-navy">{user.name}</span>
                          <span className="text-sm text-muted">{user.title}</span>
                        </span>
                        <span className="rounded-full bg-navy px-2 py-0.5 text-[11px] font-bold uppercase text-white">{user.role}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PoweredBy className="pb-8 text-center text-[11px] uppercase tracking-[0.16em] text-muted" />
    </div>
  );
}
