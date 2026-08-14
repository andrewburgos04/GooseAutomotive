import { useMemo } from "react";
import { ROCard } from "../components/ROCard";
import { columnFor, money, roTotals } from "../lib/format";
import { useShop } from "../store";
import type { BoardColumn } from "../types";

const COLUMNS: { id: BoardColumn; title: string }[] = [
  { id: "estimates", title: "Estimates" },
  { id: "wip", title: "Work in progress" },
  { id: "completed", title: "Completed" },
];

export function JobBoardPage() {
  const locationId = useShop((s) => s.currentLocationId);
  const repairOrders = useShop((s) => s.repairOrders);
  const customers = useShop((s) => s.customers);
  const vehicles = useShop((s) => s.vehicles);
  const users = useShop((s) => s.users);
  const locations = useShop((s) => s.locations);
  const location = locations.find((l) => l.id === locationId);
  const ros = useMemo(
    () => repairOrders.filter((ro) => ro.locationId === locationId),
    [repairOrders, locationId],
  );

  const grouped = useMemo(() => {
    const map: Record<BoardColumn, typeof ros> = { estimates: [], wip: [], completed: [] };
    for (const ro of ros) map[columnFor(ro.status)].push(ro);
    return map;
  }, [ros]);

  const todayPosted = ros.filter((ro) => ro.status === "posted" || ro.status === "ready");
  const aro =
    todayPosted.length === 0
      ? 0
      : todayPosted.reduce((sum, ro) => sum + roTotals(ro).authorized, 0) / todayPosted.length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-accent text-xs font-bold uppercase tracking-[0.18em] text-goose">Job board</p>
          <h1 className="text-4xl font-extrabold text-navy">{location?.name}</h1>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <div><span className="block text-2xl font-extrabold text-navy">{ros.length}</span> open cars</div>
          <div><span className="block text-2xl font-extrabold text-goose">{money(aro)}</span> ARO (ready/posted)</div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {COLUMNS.map((column) => (
          <section key={column.id} className="rounded-2xl bg-white/70 p-3">
            <header className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-xl font-extrabold text-navy">{column.title}</h2>
              <span className="rounded-full bg-mist px-2 py-0.5 text-xs font-bold text-navy">{grouped[column.id].length}</span>
            </header>
            <div className="grid gap-3">
              {grouped[column.id].map((ro) => (
                <ROCard
                  key={ro.id}
                  ro={ro}
                  customer={customers.find((c) => c.id === ro.customerId)}
                  vehicle={vehicles.find((v) => v.id === ro.vehicleId)}
                  tech={users.find((u) => u.id === ro.inspection.techId || ro.jobs.some((j) => j.labor.some((l) => l.techId === u.id)))}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
