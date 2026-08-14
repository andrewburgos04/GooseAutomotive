import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleTitle } from "../lib/format";
import { useCurrentUser, useShop } from "../store";

export function NewROPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const customers = useShop((s) => s.customers);
  const vehicles = useShop((s) => s.vehicles);
  const createRO = useShop((s) => s.createRO);
  const locationId = useShop((s) => s.currentLocationId);
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [vehicleId, setVehicleId] = useState("");
  const [concern, setConcern] = useState("");
  const [promise, setPromise] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 3);
    return d.toISOString().slice(0, 16);
  });

  const owned = useMemo(() => vehicles.filter((v) => v.customerId === customerId), [vehicles, customerId]);
  const selectedVehicle = vehicleId || owned[0]?.id || "";

  if (!user) return null;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !selectedVehicle || !concern.trim()) return;
    const id = createRO({
      customerId,
      vehicleId: selectedVehicle,
      advisorId: user.id,
      locationId,
      concern: concern.trim(),
      promiseTime: new Date(promise).toISOString(),
    });
    navigate(`/ro/${id}`);
  }

  return (
    <form className="mx-auto max-w-xl space-y-4" onSubmit={onSubmit}>
      <h1 className="font-display text-4xl">New repair order</h1>
      <label className="block text-sm">
        Customer
        <select className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2" value={customerId} onChange={(event) => { setCustomerId(event.target.value); setVehicleId(""); }}>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.company ?? customer.name}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Vehicle
        <select className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2" value={selectedVehicle} onChange={(event) => setVehicleId(event.target.value)}>
          {owned.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>{vehicleTitle(vehicle.year, vehicle.make, vehicle.model)} · {vehicle.plate}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Concern
        <textarea className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2" rows={4} value={concern} onChange={(event) => setConcern(event.target.value)} required placeholder="Why is it here?" />
      </label>
      <label className="block text-sm">
        Promise time
        <input className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2" type="datetime-local" value={promise} onChange={(event) => setPromise(event.target.value)} />
      </label>
      <button className="rounded-xl bg-gold px-4 py-3 font-semibold text-ink" type="submit">Create RO</button>
    </form>
  );
}
