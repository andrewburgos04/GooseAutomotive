import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { vehicleTitle } from "../lib/format";
import { useShop } from "../store";

export function BookPage() {
  const customers = useShop((s) => s.customers);
  const vehicles = useShop((s) => s.vehicles);
  const locations = useShop((s) => s.locations);
  const createAppointment = useShop((s) => s.createAppointment);
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "bandera");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [concern, setConcern] = useState("32-point inspection");
  const [start, setStart] = useState(() => new Date(Date.now() + 3600000).toISOString().slice(0, 16));
  const [done, setDone] = useState(false);
  const owned = useMemo(() => vehicles.filter((v) => v.customerId === customerId), [vehicles, customerId]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const vehicle = owned[0];
    if (!vehicle) return;
    createAppointment({
      locationId,
      customerId,
      vehicleId: vehicle.id,
      advisorId: "u-andi",
      start: new Date(start).toISOString(),
      durationMin: 60,
      concern,
      status: "booked",
      source: "online",
    });
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-mist text-navy">
      <header className="border-b border-navy/10 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <img src="/logo.png" alt="Goose Automotive" className="h-10 w-auto" />
          <Link className="text-sm font-semibold text-goose" to="/login">Shop login</Link>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 py-10">
        <p className="font-accent text-sm font-bold uppercase tracking-wider text-goose">Online scheduling</p>
        <h1 className="text-4xl font-extrabold">Book Goose — not a Tekmetric iframe.</h1>
        <p className="mt-3 text-muted">Mon–Fri 7:00am–6:00pm. This writes into the same shop calendar advisors use on the floor.</p>
        {done ? (
          <p className="mt-6 rounded-2xl bg-green-50 p-4 text-ok">You’re on the board. The shop will confirm by text.</p>
        ) : (
          <form className="mt-6 space-y-3 rounded-2xl bg-white p-5 shadow-card" onSubmit={onSubmit}>
            <label className="block text-sm">Shop
              <select className="mt-1 w-full rounded-lg border border-navy/10 px-3 py-2" value={locationId} onChange={(e) => setLocationId(e.target.value as typeof locationId)}>
                {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </label>
            <label className="block text-sm">Customer
              <select className="mt-1 w-full rounded-lg border border-navy/10 px-3 py-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.company ?? c.name}</option>)}
              </select>
            </label>
            {owned[0] && <p className="text-sm text-muted">{vehicleTitle(owned[0].year, owned[0].make, owned[0].model)} · {owned[0].plate}</p>}
            <label className="block text-sm">When
              <input className="mt-1 w-full rounded-lg border border-navy/10 px-3 py-2" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="block text-sm">Concern
              <input className="mt-1 w-full rounded-lg border border-navy/10 px-3 py-2" value={concern} onChange={(e) => setConcern(e.target.value)} />
            </label>
            <button className="w-full rounded-xl bg-goose py-3 font-bold text-white" type="submit">Request appointment</button>
          </form>
        )}
      </main>
    </div>
  );
}
