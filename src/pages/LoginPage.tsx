import { useShop } from "../store";

export function LoginPage() {
  const users = useShop((s) => s.users);
  const locations = useShop((s) => s.locations);
  const login = useShop((s) => s.login);

  const shops = locations.filter((location) => users.some((user) => user.locationId === location.id));

  return (
    <div className="min-h-screen bg-ink text-paper">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2">
        <div>
          <img src="/logo.svg" alt="" className="mb-6 h-16 w-16" />
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Goose Automotive</p>
          <h1 className="mt-3 max-w-lg font-display text-5xl leading-[0.95] md:text-7xl">The shop app. Not the marketing site.</h1>
          <p className="mt-5 max-w-md text-paper/70">
            Built for Goose advisors and technicians: job board, 32-point DVI, estimates, authorization, and tech clocks — the Tekmetric workflow, on Goose’s terms.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink-800 p-5">
          <h2 className="mb-4 font-display text-2xl">Sign in as a teammate</h2>
          <div className="space-y-5">
            {shops.map((shop) => (
              <div key={shop.id}>
                <p className="mb-2 text-xs uppercase tracking-wider text-gold">{shop.name}</p>
                <div className="grid gap-2">
                  {users
                    .filter((user) => user.locationId === shop.id)
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => login(user.id)}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-ink px-4 py-3 text-left hover:border-gold"
                      >
                        <span>
                          <span className="block font-semibold">{user.name}</span>
                          <span className="text-sm text-paper/55">{user.title}</span>
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] uppercase">{user.role}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
