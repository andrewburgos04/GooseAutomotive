import { useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cannedJobs, FINDING_TO_CANNED } from "../data/canned";
import type { InspectionItem, Rating } from "../types";
import { inspectionCounts, vehicleTitle } from "../lib/format";
import { compressImage } from "../lib/media";
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
  const addPhoto = useShop((s) => s.addPhoto);
  const addJobFromFinding = useShop((s) => s.addJobFromFinding);
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
        <button className="rounded-lg bg-mist px-3 py-2 text-sm" type="button" onClick={() => startInspection(ro.id, user.id)}>Start / claim inspection</button>
        <button className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white" type="button" onClick={() => {
          ro.inspection.items.filter((i) => i.rating === "urgent" || i.rating === "recommend").forEach((i) => addJobFromFinding(ro.id, i.id));
        }}>Add jobs from all red/yellow</button>
        <button className="rounded-lg bg-goose px-3 py-2 text-sm font-semibold text-white" type="button" onClick={() => { completeInspection(ro.id); navigate(`/ro/${ro.id}`); }}>Mark DVI complete</button>
      </div>
      <div className="space-y-6">
        {grouped.map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-2 text-2xl font-extrabold text-navy-brand">{category}</h2>
            <div className="grid gap-3">
              {items.map((item) => (
                <FindingRow
                  key={item.id}
                  item={item}
                  hasJob={ro.jobs.some((job) => job.sourceFindingId === item.id)}
                  canned={FINDING_TO_CANNED[item.name] ? cannedJobs.find((j) => j.id === FINDING_TO_CANNED[item.name])?.title : undefined}
                  onRate={(rating) => setRating(ro.id, item.id, rating)}
                  onNotes={(notes) => setRating(ro.id, item.id, item.rating, notes)}
                  onPhoto={async (file) => addPhoto(ro.id, item.id, await compressImage(file))}
                  onAddJob={() => addJobFromFinding(ro.id, item.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function FindingRow({
  item,
  hasJob,
  canned,
  onRate,
  onNotes,
  onPhoto,
  onAddJob,
}: {
  item: InspectionItem;
  hasJob: boolean;
  canned?: string;
  onRate: (rating: Rating) => void;
  onNotes: (notes: string) => void;
  onPhoto: (file: File) => void;
  onAddJob: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const needsJob = item.rating === "urgent" || item.rating === "recommend";
  return (
    <article className="rounded-xl border border-navy/10 bg-white p-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-semibold">{item.name}</h3>
        <div className="flex gap-1">
          {RATINGS.map((rating) => (
            <button key={String(rating.id)} type="button" className={`h-10 min-w-10 rounded-lg px-2 text-xs font-bold ${rating.className} ${item.rating === rating.id ? "ring-2 ring-navy" : "opacity-60"}`} onClick={() => onRate(rating.id)}>
              {rating.label[0]}
            </button>
          ))}
        </div>
      </div>
      <input className="w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm" placeholder="Notes, measurements…" value={item.notes} onChange={(e) => onNotes(e.target.value)} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhoto(f); e.target.value = ""; }} />
        <button className="rounded-lg bg-mist px-3 py-1.5 text-xs font-semibold" type="button" onClick={() => fileRef.current?.click()}>Attach photo</button>
        {needsJob && (
          <button className="rounded-lg bg-goose px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40" type="button" disabled={hasJob} onClick={onAddJob}>
            {hasJob ? "Job added" : `Add job${canned ? `: ${canned}` : ""}`}
          </button>
        )}
      </div>
      {(item.photos?.length ?? 0) > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {item.photos.map((src, i) => (
            <img key={i} src={src} alt="" className="h-24 rounded-lg border border-navy/10 object-cover" />
          ))}
        </div>
      )}
    </article>
  );
}
