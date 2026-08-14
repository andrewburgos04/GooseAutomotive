import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { inspectionCounts, jobTotal, money, vehicleTitle } from "../lib/format";
import { useShop } from "../store";

export function EstimatePage() {
  const { id } = useParams();
  const ro = useShop((s) => s.repairOrders.find((item) => item.id === id));
  const customer = useShop((s) => s.customers.find((c) => c.id === ro?.customerId));
  const vehicle = useShop((s) => s.vehicles.find((v) => v.id === ro?.vehicleId));
  const location = useShop((s) => s.locations.find((l) => l.id === ro?.locationId));
  const authorizeJobs = useShop((s) => s.authorizeJobs);
  const declineJob = useShop((s) => s.declineJob);
  const saveSignature = useShop((s) => s.saveSignature);
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const findings = useMemo(
    () => ro?.inspection.items.filter((item) => item.rating === "urgent" || item.rating === "recommend") ?? [],
    [ro],
  );

  if (!ro || !customer || !vehicle || !location) {
    return <div className="p-8 text-navy">Estimate not found.</div>;
  }

  const counts = inspectionCounts(ro);
  const total = ro.jobs.filter((job) => selected.includes(job.id)).reduce((sum, job) => sum + jobTotal(job), 0);

  return (
    <div className="min-h-screen bg-mist text-navy">
      <header className="border-b border-navy/10 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <img src="/logo.png" alt="Goose Automotive" className="h-10 w-auto" />
          <div>
            <p className="text-sm font-semibold text-muted">{location.name} · {location.phone}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="font-accent text-sm font-bold uppercase tracking-wider text-goose">Repair estimate {ro.number}</p>
        <h1 className="text-4xl font-extrabold">{vehicleTitle(vehicle.year, vehicle.make, vehicle.model)}</h1>
        <p className="text-muted">{customer.name} · {vehicle.mileage.toLocaleString()} miles</p>
        <p className="mt-3 rounded-xl bg-white p-3 text-sm shadow-card"><strong>Concern:</strong> {ro.concern}</p>

        <section className="mt-6">
          <h2 className="text-2xl font-extrabold">Inspection snapshot</h2>
          <p className="text-sm text-muted">{counts.ok} good · {counts.recommend} recommended · {counts.urgent} urgent</p>
          <ul className="mt-3 space-y-2">
            {findings.map((item) => (
              <li key={item.id} className={`rounded-xl p-3 ${item.rating === "urgent" ? "bg-red-50" : "bg-amber-50"}`}>
                <span className={`mr-2 text-xs font-bold uppercase ${item.rating === "urgent" ? "text-urgent" : "text-warn"}`}>
                  {item.rating === "urgent" ? "Now" : "Soon"}
                </span>
                {item.name}
                {item.notes ? <span className="block text-sm text-muted">{item.notes}</span> : null}
                {item.photos?.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {item.photos.map((src, i) => <img key={i} src={src} alt="" className="h-24 rounded-lg object-cover" />)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-extrabold">Choose the work</h2>
          {done ? (
            <p className="mt-4 rounded-xl bg-green-50 p-4 text-ok">Approved. The shop can start the authorized jobs. Most repairs carry Goose’s 3-year / 36,000-mile nationwide warranty.</p>
          ) : (
            <>
              <div className="mt-3 space-y-2">
                {ro.jobs.map((job) => (
                  <label key={job.id} className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selected.includes(job.id)}
                      onChange={(event) => {
                        setSelected((current) =>
                          event.target.checked ? [...current, job.id] : current.filter((id) => id !== job.id),
                        );
                      }}
                    />
                    <span className="flex-1">
                      <span className="block font-semibold">{job.title}</span>
                      <span className="text-sm text-muted">{job.concern}</span>
                    </span>
                    <strong>{money(jobTotal(job))}</strong>
                  </label>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold">Digital signature</p>
                <input className="w-full rounded-lg border border-navy/10 px-3 py-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={140}
                  className="w-full rounded-xl border border-navy/15 bg-white"
                  onPointerDown={(e) => {
                    drawing.current = true;
                    const ctx = canvasRef.current?.getContext("2d");
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!ctx || !rect) return;
                    ctx.beginPath();
                    ctx.moveTo((e.clientX - rect.left) * (520 / rect.width), (e.clientY - rect.top) * (140 / rect.height));
                  }}
                  onPointerMove={(e) => {
                    if (!drawing.current) return;
                    const ctx = canvasRef.current?.getContext("2d");
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!ctx || !rect) return;
                    ctx.lineWidth = 2;
                    ctx.lineTo((e.clientX - rect.left) * (520 / rect.width), (e.clientY - rect.top) * (140 / rect.height));
                    ctx.stroke();
                  }}
                  onPointerUp={() => { drawing.current = false; }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-semibold">Selected {money(total)}</p>
                <button
                  className="rounded-full bg-goose px-5 py-3 font-bold text-white disabled:opacity-40"
                  type="button"
                  disabled={selected.length === 0 || !name.trim()}
                  onClick={() => {
                    ro.jobs.forEach((job) => {
                      if (!selected.includes(job.id)) declineJob(ro.id, job.id);
                    });
                    authorizeJobs(ro.id, selected, "text");
                    saveSignature(ro.id, { name: name.trim(), dataUrl: canvasRef.current?.toDataURL() ?? "", at: new Date().toISOString() });
                    setDone(true);
                  }}
                >
                  Approve & sign
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
