import { useParams } from "react-router-dom";
import { inspectionCounts, jobTotal, money, vehicleTitle } from "../lib/format";
import { LABEL_COPY } from "../lib/media";
import { useShop } from "../store";

export function PrintPage() {
  const { id, kind } = useParams();
  const ro = useShop((s) => s.repairOrders.find((item) => item.id === id));
  const customer = useShop((s) => s.customers.find((c) => c.id === ro?.customerId));
  const vehicle = useShop((s) => s.vehicles.find((v) => v.id === ro?.vehicleId));
  const location = useShop((s) => s.locations.find((l) => l.id === ro?.locationId));
  const fleet = useShop((s) => s.fleetAccounts.find((f) => f.id === customer?.fleetAccountId));
  const allPayments = useShop((s) => s.payments);

  if (!ro || !customer || !vehicle || !location) return <p className="p-8">Not found.</p>;
  const payments = allPayments.filter((p) => p.roId === id);
  const title = kind === "inspection" ? "Digital vehicle inspection" : kind === "invoice" ? "Invoice" : "Estimate";

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 print:p-0">
      <div className="mb-6 flex items-start justify-between">
        <img src="/logo.png" alt="Goose Automotive" className="h-12" />
        <div className="text-right text-sm">
          <p className="font-bold">{location.name}</p>
          <p>{location.address}<br />{location.city}<br />{location.phone}</p>
        </div>
      </div>
      <h1 className="text-3xl font-extrabold">{title} {ro.number}</h1>
      <p>{customer.company ?? customer.name} · {vehicleTitle(vehicle.year, vehicle.make, vehicle.model)} · {vehicle.vin} · {vehicle.mileage.toLocaleString()} mi</p>
      {fleet && <p className="text-sm">Fleet {fleet.accountNumber}{vehicle.unitNumber ? ` · Unit ${vehicle.unitNumber}` : ""} · {fleet.gsa ? "GSA" : ""}</p>}
      <p className="mt-2 text-sm"><strong>Concern:</strong> {ro.concern}</p>
      {ro.labels.length > 0 && <p className="text-sm">Labels: {ro.labels.map((l) => LABEL_COPY[l]).join(", ")}</p>}

      {kind !== "invoice" && (
        <section className="mt-6">
          <h2 className="text-xl font-extrabold">Inspection</h2>
          <p className="text-sm">{inspectionCounts(ro).ok} green · {inspectionCounts(ro).recommend} yellow · {inspectionCounts(ro).urgent} red</p>
          {ro.inspection.items.filter((i) => i.rating && i.rating !== "ok" && i.rating !== "na").map((item) => (
            <div key={item.id} className="my-2 border-b border-navy/10 pb-2 text-sm">
              <strong>{item.rating === "urgent" ? "NOW" : "SOON"}</strong> {item.name} — {item.notes}
              <div className="mt-1 flex gap-2">
                {(item.photos ?? []).map((src, i) => <img key={i} src={src} alt="" className="h-20 rounded" />)}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-xl font-extrabold">{kind === "invoice" ? "Work performed" : "Jobs"}</h2>
        {(kind === "invoice" ? ro.jobs.filter((j) => j.authorized) : ro.jobs).map((job) => (
          <p key={job.id} className="flex justify-between border-b py-1 text-sm">
            <span>{job.title}{job.authorized === false ? " (declined)" : ""}</span>
            <span>{money(jobTotal(job))}</span>
          </p>
        ))}
      </section>

      {kind === "invoice" && (
        <section className="mt-6 text-sm">
          <p>Paid {money(ro.paidAmount)}</p>
          {payments.map((p) => <p key={p.id}>{p.method} {money(p.amount)} · {p.note}</p>)}
          <p className="mt-2">Most repairs: 3-year / 36,000-mile nationwide warranty.</p>
        </section>
      )}

      {ro.signature && (
        <div className="mt-8">
          <p className="text-sm">Authorized by {ro.signature.name}</p>
          <img src={ro.signature.dataUrl} alt="signature" className="h-16" />
        </div>
      )}

      <button className="mt-8 rounded-lg bg-goose px-4 py-2 font-bold text-white print:hidden" type="button" onClick={() => window.print()}>Print / Save PDF</button>
    </div>
  );
}
