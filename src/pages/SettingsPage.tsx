import { useState } from "react";
import { formatWhen, hoursFromSeconds, punchSeconds } from "../lib/format";
import { fetchPayroll } from "../lib/integrations";
import { useShop } from "../store";

export function SettingsPage() {
  const matrix = useShop((s) => s.laborMatrix);
  const parts = useShop((s) => s.partsMatrix);
  const guide = useShop((s) => s.laborGuide);
  const qb = useShop((s) => s.qb);
  const punches = useShop((s) => s.timePunches);
  const users = useShop((s) => s.users);
  const setLaborRate = useShop((s) => s.setLaborRate);
  const setPartsMarkup = useShop((s) => s.setPartsMarkup);
  const syncQuickBooks = useShop((s) => s.syncQuickBooks);
  const session = useShop((s) => s.sessionToken);
  const [payroll, setPayroll] = useState<Array<{ userId: string; name: string; hours: number; role: string }>>([]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h1 className="text-2xl font-extrabold">Labor & parts matrices</h1>
        <p className="mb-3 text-sm text-muted">Rates used when adding canned jobs from DVI findings.</p>
        {(["domestic", "import", "euro", "diesel"] as const).map((key) => (
          <label key={key} className="mb-2 flex items-center justify-between text-sm capitalize">
            {key} $/hr
            <input className="w-24 rounded border border-navy/10 px-2 py-1" type="number" value={matrix[key]} onChange={(e) => setLaborRate(key, Number(e.target.value))} />
          </label>
        ))}
        {(["under20", "under50", "under150", "over"] as const).map((key) => (
          <label key={key} className="mb-2 flex items-center justify-between text-sm">
            Parts {key} markup
            <input className="w-24 rounded border border-navy/10 px-2 py-1" type="number" step="0.1" value={parts[key]} onChange={(e) => setPartsMarkup(key, Number(e.target.value))} />
          </label>
        ))}
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-2xl font-extrabold">Labor guide</h2>
        {guide.map((row) => (
          <p key={row.id} className="flex justify-between border-b border-navy/5 py-2 text-sm">
            <span>{row.name}</span>
            <span className="text-muted">{row.domesticHours}h / {row.importHours}h / {row.euroHours}h euro</span>
          </p>
        ))}
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-2xl font-extrabold">QuickBooks / payroll</h2>
        <p className="text-sm text-muted">Demo sync posts posted invoices. Connect Intuit OAuth to go live.</p>
        <p className="my-2">Last sync: {qb.lastSync ? formatWhen(qb.lastSync) : "never"} · {qb.invoicesExported} invoices · {qb.status}</p>
        <button className="rounded-lg bg-navy px-4 py-2 font-bold text-white" type="button" onClick={syncQuickBooks}>Sync invoices to QuickBooks</button>
        <h3 className="mt-4 font-bold">Payroll (time clock hours)</h3>
        {users.filter((u) => u.role !== "advisor").map((u) => {
          const hours = hoursFromSeconds(punchSeconds(punches.filter((p) => p.userId === u.id)));
          return <p key={u.id} className="text-sm">{u.name} · {hours.toFixed(2)} hrs</p>;
        })}
        <button className="mt-3 rounded-lg border border-navy/15 px-3 py-2 text-sm font-semibold" type="button" onClick={async () => setPayroll(await fetchPayroll())}>Export payroll via /api/payroll</button>
        {payroll.map((row) => (
          <p key={row.userId} className="text-sm text-muted">{row.name} · {row.hours}h ({row.role})</p>
        ))}
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-2xl font-extrabold">Integrations & logins</h2>
        <ul className="space-y-1 text-sm">
          <li>PartsTech / Nexpart / NAPA — HTTP adapters at /api/vendors/:id/order</li>
          <li>Payments (card / Apple Pay / text-to-pay) — /api/pay</li>
          <li>SMS/email estimates — /api/sms and /api/email</li>
          <li>Synchrony / American First / EasyPay — /api/finance</li>
          <li>QuickBooks — /api/qb · payroll — /api/payroll</li>
          <li>NHTSA VIN decode — live API with year-code fallback</li>
          <li>Shared shop database — GET/PUT /api/state (data/shop.json)</li>
          <li>PIN login mints a session token (kept in this browser, not the shared file)</li>
          <li>Session: <span className="font-mono text-xs">{session ?? "signed out"}</span></li>
        </ul>
        <p className="mt-3 text-xs text-muted">Demo PINs: Andi 1002, Marco 2001, Eileen 1001. Swap adapter URLs for live vendor credentials.</p>
      </section>
    </div>
  );
}
