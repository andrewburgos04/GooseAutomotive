import { money } from "../lib/format";
import { useShop } from "../store";
import type { VendorId } from "../types";

const VENDORS: VendorId[] = ["napa", "partstech", "nexpart", "local"];

export function InventoryPage() {
  const locationId = useShop((s) => s.currentLocationId);
  const inventory = useShop((s) => s.inventory);
  const orders = useShop((s) => s.partsOrders);
  const ros = useShop((s) => s.repairOrders);
  const receiveParts = useShop((s) => s.receiveParts);
  const orderParts = useShop((s) => s.orderParts);
  const adjustInventory = useShop((s) => s.adjustInventory);
  const items = inventory.filter((i) => i.locationId === locationId);

  const waiting = ros.find((ro) => ro.locationId === locationId && ro.jobs.some((j) => j.parts.some((p) => p.status === "needed" || p.status === "ordered")));

  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-wider text-goose">PartsTech / Nexpart / NAPA</p>
      <h1 className="mb-4 text-4xl font-extrabold">Inventory & vendor orders</h1>
      <div className="mb-6 overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead><tr className="text-muted"><th className="p-3">SKU</th><th>Part</th><th>On hand</th><th>Min</th><th>Vendor</th><th>Price</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={`border-t border-navy/5 ${item.qty < item.minQty ? "bg-red-50" : ""}`}>
                <td className="p-3 font-mono text-xs">{item.sku}</td>
                <td>{item.name}</td>
                <td>
                  <input className="w-16 rounded border border-navy/10 px-2 py-1" type="number" value={item.qty} onChange={(e) => adjustInventory(item.id, Number(e.target.value))} />
                </td>
                <td>{item.minQty}</td>
                <td className="uppercase">{item.vendorId}</td>
                <td>{money(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-2 text-xl font-extrabold">Open vendor POs</h2>
          {orders.map((order) => (
            <div key={order.id} className="mb-3 rounded-lg border border-navy/10 p-3 text-sm">
              <p className="font-semibold uppercase">{order.vendorId} · {order.status}{order.confirmation ? ` · ${order.confirmation}` : ""} · {order.lines.map((l) => l.name).join(", ")}</p>
              {order.status !== "received" && (
                <button className="mt-2 rounded-lg bg-goose px-3 py-1.5 text-xs font-bold text-white" type="button" onClick={() => receiveParts(order.id)}>Mark received</button>
              )}
            </div>
          ))}
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-2 text-xl font-extrabold">One-click order from RO</h2>
          <p className="mb-3 text-sm text-muted">Demo adapters for PartsTech, Nexpart, and NAPA. Swap the vendor module for live credentials later.</p>
          {waiting ? (
            VENDORS.filter((v) => v !== "local").map((vendor) => (
              <button key={vendor} className="mb-2 mr-2 rounded-lg bg-navy px-3 py-2 text-sm font-bold uppercase text-white" type="button" onClick={() => {
                const lines = waiting.jobs.flatMap((j) => j.parts.filter((p) => p.status === "needed")).map((p) => ({ sku: p.sku ?? p.name, name: p.name, qty: p.qty, cost: p.cost }));
                if (lines.length) orderParts(waiting.id, vendor, lines);
              }}>Order {waiting.number} via {vendor}</button>
            ))
          ) : <p className="text-sm text-muted">No needed parts on an open RO.</p>}
        </section>
      </div>
    </div>
  );
}
