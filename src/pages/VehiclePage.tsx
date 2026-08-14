import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { money, roTotals, statusLabel, vehicleTitle } from "../lib/format";
import { decodeVin } from "../lib/media";
import { useShop } from "../store";

export function VehiclePage() {
  const { id } = useParams();
  const vehicle = useShop((s) => s.vehicles.find((v) => v.id === id));
  const customer = useShop((s) => s.customers.find((c) => c.id === vehicle?.customerId));
  const fleet = useShop((s) => s.fleetAccounts.find((f) => f.id === customer?.fleetAccountId));
  const repairOrders = useShop((s) => s.repairOrders);
  const applyVinDecode = useShop((s) => s.applyVinDecode);
  const updateMileage = useShop((s) => s.updateMileage);
  const [busy, setBusy] = useState(false);
  const [vin, setVin] = useState(vehicle?.vin ?? "");

  const history = repairOrders.filter((ro) => ro.vehicleId === id);

  if (!vehicle || !customer) return <p>Vehicle not found.</p>;

  const declined = history.flatMap((ro) => ro.jobs.filter((j) => j.authorized === false).map((j) => ({ ro, j })));

  return (
    <div>
      <Link to="/customers" className="text-sm font-semibold text-goose">← Customers</Link>
      <h1 className="text-4xl font-extrabold">{vehicleTitle(vehicle.year, vehicle.make, vehicle.model)}</h1>
      <p className="text-muted">{customer.company ?? customer.name} · {vehicle.plate} · {vehicle.mileage.toLocaleString()} mi {vehicle.unitNumber ? `· Unit ${vehicle.unitNumber}` : ""}</p>
      {fleet && (
        <p className="mt-2 rounded-xl bg-navy px-3 py-2 text-sm text-white">Fleet {fleet.company} · {fleet.accountNumber} {fleet.gsa ? "· GSA" : ""} · bill {fleet.billingEmail}</p>
      )}
      <section className="mt-4 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="mb-2 text-xl font-extrabold">VIN decode</h2>
        <div className="flex flex-wrap gap-2">
          <input className="rounded-lg border border-navy/10 px-3 py-2 font-mono text-sm" value={vin} onChange={(e) => setVin(e.target.value)} />
          <button className="rounded-lg bg-navy px-3 py-2 font-bold text-white" type="button" disabled={busy} onClick={async () => {
            setBusy(true);
            applyVinDecode(vehicle.id, await decodeVin(vin));
            setBusy(false);
          }}>{busy ? "Decoding…" : "Decode VIN"}</button>
          <label className="text-sm">Mileage
            <input className="ml-2 w-28 rounded border border-navy/10 px-2 py-1" type="number" defaultValue={vehicle.mileage} onBlur={(e) => updateMileage(vehicle.id, Number(e.target.value))} />
          </label>
        </div>
        {vehicle.decoded && <p className="mt-2 text-sm text-muted">{vehicle.decoded.body} {vehicle.decoded.engine} {vehicle.decoded.drive}</p>}
      </section>
      <section className="mt-4 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="mb-2 text-xl font-extrabold">Repair history</h2>
        {history.map((ro) => (
          <Link key={ro.id} to={`/ro/${ro.id}`} className="flex justify-between border-b border-navy/5 py-2 text-sm">
            <span>{ro.number} · {statusLabel(ro.status)} · {ro.concern}</span>
            <span>{money(roTotals(ro).authorized)}</span>
          </Link>
        ))}
      </section>
      <section className="mt-4 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="mb-2 text-xl font-extrabold">Declined jobs (follow-up)</h2>
        {declined.length === 0 && <p className="text-sm text-muted">None on this vehicle.</p>}
        {declined.map(({ ro, j }) => (
          <p key={j.id} className="text-sm">{ro.number} · {j.title}</p>
        ))}
      </section>
    </div>
  );
}
