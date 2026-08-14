import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { vehicleTitle } from "../lib/format";
import { useShop } from "../store";

export function CustomersPage() {
  const [query, setQuery] = useState("");
  const customers = useShop((s) => s.customers);
  const vehicles = useShop((s) => s.vehicles);
  const ros = useShop((s) => s.repairOrders);
  const locationId = useShop((s) => s.currentLocationId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const owned = vehicles.filter((v) => v.customerId === customer.id);
      const hay = [customer.name, customer.phone, customer.email, customer.company, ...owned.map((v) => `${v.year} ${v.make} ${v.model} ${v.plate} ${v.vin}`)]
        .join(" ")
        .toLowerCase();
      return !q || hay.includes(q);
    });
  }, [customers, vehicles, query]);

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-navy">Customers & vehicles</h1>
      <input
        className="my-4 w-full max-w-xl rounded-xl border border-navy/10 bg-white px-4 py-3"
        placeholder="Search name, plate, VIN, company…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="grid gap-3">
        {filtered.map((customer) => {
          const owned = vehicles.filter((v) => v.customerId === customer.id);
          return (
            <article key={customer.id} className="rounded-2xl border border-navy/10 bg-white p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold">{customer.company ?? customer.name}</h2>
                  {customer.company && <p className="text-sm text-muted">{customer.name}</p>}
                  <p className="text-sm text-muted">{customer.phone} · {customer.email}</p>
                </div>
                {customer.fleet && <span className="h-fit rounded-full bg-goose/10 px-2 py-0.5 text-xs text-goose-bright">Fleet</span>}
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {owned.map((vehicle) => {
                  const history = ros.filter((ro) => ro.vehicleId === vehicle.id && ro.locationId === locationId);
                  return (
                    <div key={vehicle.id} className="rounded-xl bg-mist p-3 text-sm">
                      <p className="font-semibold">{vehicleTitle(vehicle.year, vehicle.make, vehicle.model)}</p>
                      <p className="text-muted">{vehicle.plate} · {vehicle.vin} · {vehicle.mileage.toLocaleString()} mi</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {history.slice(0, 3).map((ro) => (
                          <Link key={ro.id} to={`/ro/${ro.id}`} className="rounded bg-mist px-2 py-1 text-xs">{ro.number}</Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
