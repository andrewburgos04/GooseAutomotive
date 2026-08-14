import { Link } from "react-router-dom";
import type { Customer, RepairOrder, User, Vehicle } from "../types";
import { columnFor, formatTime, inspectionCounts, money, roTotals, statusLabel, vehicleTitle } from "../lib/format";

export function StatusChip({ status }: { status: RepairOrder["status"] }) {
  const column = columnFor(status);
  const color =
    column === "wip" ? "bg-gold/20 text-gold-bright" : column === "completed" ? "bg-ok/20 text-ok" : "bg-white/10 text-paper/80";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${color}`}>{statusLabel(status)}</span>;
}

export function ROCard({
  ro,
  customer,
  vehicle,
  tech,
}: {
  ro: RepairOrder;
  customer?: Customer;
  vehicle?: Vehicle;
  tech?: User;
}) {
  const totals = roTotals(ro);
  const counts = inspectionCounts(ro);
  const inspectDone = Boolean(ro.inspection.completedAt);

  return (
    <Link
      to={`/ro/${ro.id}`}
      className="block rounded-xl border border-white/10 bg-ink-800 p-3 shadow-sm transition hover:border-gold/50"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <StatusChip status={ro.status} />
        <span className="text-xs text-paper/50">{ro.number}</span>
      </div>
      <p className="font-display text-lg leading-tight">
        {vehicle ? vehicleTitle(vehicle.year, vehicle.make, vehicle.model) : "Vehicle"}
      </p>
      <p className="text-sm text-paper/70">{customer?.company ?? customer?.name}</p>
      <p className="mt-2 line-clamp-2 text-xs text-paper/55">{ro.concern}</p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-paper/60">Promise {formatTime(ro.promiseTime)}</span>
        {tech && <span className="text-gold-bright">{tech.name.split(" ")[0]}</span>}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
        <span className={inspectDone ? "text-ok" : "text-paper/50"}>
          DVI {counts.done}/{counts.total}
          {counts.urgent > 0 ? ` · ${counts.urgent} red` : ""}
        </span>
        <span className="font-semibold">
          {money(totals.authorized)}
          <span className="font-normal text-paper/45"> / {money(totals.written)}</span>
        </span>
      </div>
    </Link>
  );
}
