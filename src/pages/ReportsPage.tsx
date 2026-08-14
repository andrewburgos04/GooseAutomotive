import { useMemo } from "react";
import { clockedSeconds, hoursFromSeconds, money, roTotals } from "../lib/format";
import { useShop } from "../store";

export function ReportsPage() {
  const locationId = useShop((s) => s.currentLocationId);
  const allRos = useShop((s) => s.repairOrders);
  const ros = allRos.filter((ro) => ro.locationId === locationId);
  const users = useShop((s) => s.users);
  const locations = useShop((s) => s.locations);
  const punches = useShop((s) => s.timePunches);

  const posted = ros.filter((ro) => ro.status === "posted" || ro.status === "ready");
  const written = ros.reduce((s, ro) => s + roTotals(ro).written, 0);
  const authorized = ros.reduce((s, ro) => s + roTotals(ro).authorized, 0);
  const declined = ros.flatMap((ro) => ro.jobs.filter((j) => j.authorized === false));
  const dviDone = ros.filter((ro) => ro.inspection.completedAt).length;
  const aro = posted.length ? posted.reduce((s, ro) => s + roTotals(ro).authorized, 0) / posted.length : 0;
  const close = written ? authorized / written : 0;

  const techs = users.filter((u) => u.locationId === locationId && u.role === "tech");

  const org = useMemo(() => locations.map((loc) => {
    const list = allRos.filter((ro) => ro.locationId === loc.id);
    const done = list.filter((ro) => ro.status === "posted" || ro.status === "ready");
    const w = list.reduce((s, ro) => s + roTotals(ro).written, 0);
    const a = list.reduce((s, ro) => s + roTotals(ro).authorized, 0);
    return {
      loc,
      cars: list.length,
      aro: done.length ? done.reduce((s, ro) => s + roTotals(ro).authorized, 0) / done.length : 0,
      close: w ? a / w : 0,
      dvi: list.length ? list.filter((ro) => ro.inspection.completedAt).length / list.length : 0,
    };
  }), [allRos, locations]);

  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-wider text-goose">Reporting</p>
      <h1 className="mb-4 text-4xl font-extrabold">Shop dashboard</h1>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Car count" value={String(ros.length)} />
        <Kpi label="ARO" value={money(aro)} />
        <Kpi label="Close ratio" value={`${Math.round(close * 100)}%`} />
        <Kpi label="DVI complete" value={`${dviDone}/${ros.length}`} />
        <Kpi label="Declined jobs" value={String(declined.length)} />
      </div>
      <section className="mb-6 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="mb-3 text-xl font-extrabold">Tech efficiency (billed vs job-clocked)</h2>
        {techs.map((tech) => {
          const lines = ros.flatMap((ro) => ro.jobs.flatMap((j) => j.labor.filter((l) => l.techId === tech.id)));
          const billed = lines.reduce((s, l) => s + l.hours, 0);
          const clocked = lines.reduce((s, l) => s + hoursFromSeconds(clockedSeconds(l.clockStartedAt, l.billedSeconds)), 0);
          const punchesToday = punches.filter((p) => p.userId === tech.id);
          return (
            <p key={tech.id} className="flex justify-between border-b border-navy/5 py-2 text-sm">
              <span>{tech.name}</span>
              <span className="text-muted">{billed.toFixed(1)} billed hrs · {clocked.toFixed(1)} job hrs · {clocked ? Math.round((billed / clocked) * 100) : 0}% · {punchesToday.length} punches</span>
            </p>
          );
        })}
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="mb-3 text-xl font-extrabold">Multi-shop org (all 9 Goose locations)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="text-muted"><th className="py-2">Shop</th><th>Cars</th><th>ARO</th><th>Close</th><th>DVI</th></tr></thead>
            <tbody>
              {org.map((row) => (
                <tr key={row.loc.id} className="border-t border-navy/5">
                  <td className="py-2 font-semibold">{row.loc.name}</td>
                  <td>{row.cars}</td>
                  <td>{money(row.aro)}</td>
                  <td>{Math.round(row.close * 100)}%</td>
                  <td>{Math.round(row.dvi * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="text-2xl font-extrabold text-navy">{value}</p>
    </div>
  );
}
