import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { InspectionItem, Rating } from "../types";
import { inspectionCounts, vehicleTitle } from "../lib/format";
import { useCurrentUser, useShop } from "../store";

const RATINGS: { id: Rating; label: string; className: string }[] = [
  { id: "ok", label: "Green", className: "bg-ok text-white" },
  { id: "recommend", label: "Yellow", className: "bg-warn text-navy" },
  { id: "urgent", label: "Red", className: "bg-urgent text-white" },
  { id: "na", label: "N/A", className: "bg-mist text-navy" },
];

export function InspectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const ro = useShop((s) => s.repairOrders.find((item) => item.id === id));
  const vehicle = useShop((s) => s.vehicles.find((v) => v.id === ro?.vehicleId));
  const setRating = useShop((s) => s.setRating);
  const startInspection = useShop((s) => s.startInspection);
  const completeInspection = useShop((s) => s.completeInspection);

  const grouped = useMemo(() => {
    const map = new Map<string, InspectionItem[]>();
    if (!ro) return [];
    for (const item of ro.inspection.items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()];
  }, [ro]);

  if (!ro || !vehicle || !user) return <p>Inspection not found.</p>;

  const counts = inspectionCounts(ro);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/ro/${ro.id}`} className="text-sm font-semibold text-goose">← Back to {ro.number}</Link>
      <h1 className="mt-2 text-4xl font-extrabold text-navy">32-point DVI</h1>
      <p className="mb-4 text-muted">{vehicleTitle(vehicle.year, vehicle.make, vehicle.model)} · {counts.done}/{counts.total}</p>
      <div className="mb-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-mist px-3 py-2 text-sm" type="button" onClick={() => startInspection(ro.id, user.id)}>
          Start / claim inspection
        </button>
        <button
          className="rounded-lg bg-goose px-3 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={() => {
            completeInspection(ro.id);
            navigate(`/ro/${ro.id}`);
          }}
        >
          Mark DVI complete
        </button>
      </div>
      <div className="space-y-6">
        {grouped.map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-2 text-2xl font-extrabold text-navy-brand">{category}</h2>
            <div className="grid gap-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-xl border border-navy/10 bg-white p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{item.name}</h3>
                    <div className="flex gap-1">
                      {RATINGS.map((rating) => (
                        <button
                          key={String(rating.id)}
                          type="button"
                          className={`h-10 min-w-10 rounded-lg px-2 text-xs font-bold ${rating.className} ${item.rating === rating.id ? "ring-2 ring-navy" : "opacity-60"}`}
                          onClick={() => setRating(ro.id, item.id, rating.id)}
                        >
                          {rating.label[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    className="w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm"
                    placeholder="Notes, measurements, photo description…"
                    value={item.notes}
                    onChange={(event) => setRating(ro.id, item.id, item.rating, event.target.value)}
                  />
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
