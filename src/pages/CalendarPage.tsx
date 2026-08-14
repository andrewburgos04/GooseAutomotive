import { FormEvent, useMemo, useState } from "react";
import { formatTime, vehicleTitle } from "../lib/format";
import { useCurrentUser, useShop } from "../store";

export function CalendarPage() {
  const locationId = useShop((s) => s.currentLocationId);
  const allAppointments = useShop((s) => s.appointments);
  const customers = useShop((s) => s.customers);
  const vehicles = useShop((s) => s.vehicles);
  const createAppointment = useShop((s) => s.createAppointment);
  const updateAppointment = useShop((s) => s.updateAppointment);
  const createRO = useShop((s) => s.createRO);
  const user = useCurrentUser();
  const [concern, setConcern] = useState("Oil change");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [start, setStart] = useState(() => new Date(Date.now() + 3600000).toISOString().slice(0, 16));

  const appointments = useMemo(() => allAppointments.filter((a) => a.locationId === locationId), [allAppointments, locationId]);
  const owned = useMemo(() => vehicles.filter((v) => v.customerId === customerId), [vehicles, customerId]);
  const day = appointments.slice().sort((a, b) => a.start.localeCompare(b.start));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !owned[0]) return;
    createAppointment({
      locationId,
      customerId,
      vehicleId: owned[0].id,
      advisorId: user.id,
      start: new Date(start).toISOString(),
      durationMin: 60,
      concern,
      status: "booked",
      source: "phone",
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div>
        <p className="font-accent text-xs font-bold uppercase tracking-wider text-goose">Scheduler</p>
        <h1 className="mb-4 text-4xl font-extrabold">Appointment calendar</h1>
        <div className="grid gap-2">
          {day.map((ap) => {
            const customer = customers.find((c) => c.id === ap.customerId);
            const vehicle = vehicles.find((v) => v.id === ap.vehicleId);
            return (
              <article key={ap.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-card">
                <div>
                  <p className="font-bold">{formatTime(ap.start)} · {ap.durationMin}m</p>
                  <p>{customer?.company ?? customer?.name} · {vehicle ? vehicleTitle(vehicle.year, vehicle.make, vehicle.model) : ""}</p>
                  <p className="text-sm text-muted">{ap.concern} · {ap.source} · {ap.status}</p>
                </div>
                <div className="flex gap-2">
                  {ap.status === "booked" && (
                    <>
                      <button className="rounded-lg bg-mist px-3 py-1.5 text-sm font-semibold" type="button" onClick={() => updateAppointment(ap.id, { status: "arrived" })}>Arrived</button>
                      {user && (
                        <button className="rounded-lg bg-goose px-3 py-1.5 text-sm font-semibold text-white" type="button" onClick={() => {
                          createRO({ customerId: ap.customerId, vehicleId: ap.vehicleId, advisorId: user.id, locationId, concern: ap.concern, promiseTime: new Date(Date.now() + 3 * 3600000).toISOString() });
                          updateAppointment(ap.id, { status: "converted" });
                        }}>Create RO</button>
                      )}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <form className="h-fit rounded-2xl bg-white p-4 shadow-card" onSubmit={onSubmit}>
        <h2 className="mb-3 text-xl font-extrabold">Book (replaces Tekmetric iframe)</h2>
        <label className="mb-2 block text-sm">Customer
          <select className="mt-1 w-full rounded-lg border border-navy/10 px-3 py-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.company ?? c.name}</option>)}
          </select>
        </label>
        <label className="mb-2 block text-sm">Start
          <input className="mt-1 w-full rounded-lg border border-navy/10 px-3 py-2" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="mb-3 block text-sm">Concern
          <input className="mt-1 w-full rounded-lg border border-navy/10 px-3 py-2" value={concern} onChange={(e) => setConcern(e.target.value)} />
        </label>
        <button className="w-full rounded-xl bg-goose py-3 font-bold text-white" type="submit">Save appointment</button>
      </form>
    </div>
  );
}
