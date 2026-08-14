import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { InspectionItem, Rating } from "../types";
import { inspectionCounts, vehicleTitle } from "../lib/format";
import { useCurrentUser, useShop } from "../store";

const RATINGS: { id: Rating; label: string; className: string }[] = [
  { id: "ok", label: "Green", className: "bg-ok" },
  { id: "recommend", label: "Yellow", className: "bg-warn text-ink" },
  { id: "urgent", label: "Red", className: "bg-urgent" },
  { id: "na", label: "N/A", className: "bg-white/20" },
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
      <Link to={`/ro/${ro.id}`} className="text-sm text-gold">← Back to {ro.number}</Link>
      <h1 className="mt-2 font-display text-4xl">32-point DVI</h1>
      <p className="mb-4 text-paper/70">{vehicleTitle(vehicle.year, vehicle.make, vehicle.model)} · {counts.done}/{counts.total}</p>
      <div className="mb-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-white/10 px-3 py-2 text-sm" type="button" onClick={() => startInspection(ro.id, user.id)}>
          Start / claim inspection
        </button>
        <button
          className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-ink"
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
            <h2 className="mb-2 font-display text-2xl text-gold">{category}</h2>
            <div className="grid gap-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-ink-800 p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{item.name}</h3>
                    <div className="flex gap-1">
                      {RATINGS.map((rating) => (
                        <button
                          key={String(rating.id)}
                          type="button"
                          className={`h-10 min-w-10 rounded-lg px-2 text-xs font-bold ${rating.className} ${item.rating === rating.id ? "ring-2 ring-white" : "opacity-60"}`}
                          onClick={() => setRating(ro.id, item.id, rating.id)}
                        >
                          {rating.label[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
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
