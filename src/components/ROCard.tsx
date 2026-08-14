import { Link } from "react-router-dom";
import type { Customer, RepairOrder, User, Vehicle } from "../types";
import { LABEL_COPY } from "../lib/media";
import { columnFor, formatTime, inspectionCounts, money, roTotals, statusLabel, vehicleTitle } from "../lib/format";

export function StatusChip({ status }: { status: RepairOrder["status"] }) {
  const column = columnFor(status);
  const color =
    column === "wip"
      ? "bg-navy/10 text-navy-brand"
      : column === "completed"
        ? "bg-ok/15 text-ok"
        : "bg-goose/10 text-goose";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${color}`}>{statusLabel(status)}</span>;
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
      className="block rounded-xl border border-navy/10 bg-white p-3 shadow-card transition hover:border-goose"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <StatusChip status={ro.status} />
        <span className="text-xs font-semibold text-muted">{ro.number}</span>
      </div>
      <p className="text-lg font-extrabold leading-tight text-navy">
        {vehicle ? vehicleTitle(vehicle.year, vehicle.make, vehicle.model) : "Vehicle"}
      </p>
      <p className="text-sm text-muted">{customer?.company ?? customer?.name}</p>
      {ro.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {ro.labels.map((label) => (
            <span key={label} className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-bold uppercase text-navy">{LABEL_COPY[label]}</span>
          ))}
        </div>
      )}
      <p className="mt-2 line-clamp-2 text-xs text-muted">{ro.concern}</p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted">Promise {formatTime(ro.promiseTime)}</span>
        {tech && <span className="font-semibold text-navy-brand">{tech.name.split(" ")[0]}</span>}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-2 text-xs">
        <span className={inspectDone ? "font-semibold text-ok" : "text-muted"}>
          DVI {counts.done}/{counts.total}
          {counts.urgent > 0 ? ` · ${counts.urgent} red` : ""}
        </span>
        <span className="font-bold text-navy">
          {money(totals.authorized)}
          <span className="font-normal text-muted"> / {money(totals.written)}</span>
        </span>
      </div>
    </Link>
  );
}
