import { Link, useNavigate, useParams } from "react-router-dom";
import { cannedJobs, cannedToJob } from "../data/canned";
import {
  clockedSeconds,
  formatDuration,
  formatWhen,
  inspectionCounts,
  jobTotal,
  money,
  roTotals,
  statusLabel,
  vehicleTitle,
} from "../lib/format";
import { useCurrentUser, useShop } from "../store";
import { StatusChip } from "../components/ROCard";
import type { AuthMethod, RoStatus } from "../types";
import { useEffect, useMemo, useState } from "react";

const STATUSES: RoStatus[] = [
  "not_started",
  "inspecting",
  "requires_auth",
  "pending_auth",
  "in_progress",
  "waiting_parts",
  "qc",
  "ready",
  "posted",
];

export function RepairOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const ro = useShop((s) => s.repairOrders.find((item) => item.id === id));
  const customer = useShop((s) => s.customers.find((c) => c.id === ro?.customerId));
  const vehicle = useShop((s) => s.vehicles.find((v) => v.id === ro?.vehicleId));
  const users = useShop((s) => s.users);
  const techs = users.filter((u) => u.locationId === ro?.locationId && u.role === "tech");
  const setStatus = useShop((s) => s.setStatus);
  const sendEstimate = useShop((s) => s.sendEstimate);
  const authorizeJobs = useShop((s) => s.authorizeJobs);
  const declineJob = useShop((s) => s.declineJob);
  const toggleClock = useShop((s) => s.toggleClock);
  const assignLaborTech = useShop((s) => s.assignLaborTech);
  const addCannedJob = useShop((s) => s.addCannedJob);
  const addNote = useShop((s) => s.addNote);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<AuthMethod>("in_person");
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totals = useMemo(() => (ro ? roTotals(ro) : { written: 0, authorized: 0, recommended: 0 }), [ro]);
  const counts = ro ? inspectionCounts(ro) : null;

  if (!ro || !customer || !vehicle || !user) {
    return <p>Repair order not found.</p>;
  }

  const advisor = users.find((u) => u.id === ro.advisorId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <div>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gold">{ro.number}</p>
            <h1 className="font-display text-4xl">{vehicleTitle(vehicle.year, vehicle.make, vehicle.model)}</h1>
            <p className="text-paper/70">
              {customer.company ? `${customer.company} · ${customer.name}` : customer.name} · {vehicle.mileage.toLocaleString()} mi · {vehicle.plate}
            </p>
          </div>
          <StatusChip status={ro.status} />
        </div>

        <section className="mb-4 rounded-2xl border border-white/10 bg-ink-800 p-4">
          <h2 className="mb-2 font-display text-xl">Customer concern</h2>
          <p>{ro.concern}</p>
          <p className="mt-2 text-sm text-paper/55">Advisor {advisor?.name} · Promise {formatWhen(ro.promiseTime)}</p>
        </section>

        <section className="mb-4 rounded-2xl border border-white/10 bg-ink-800 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl">32-point inspection</h2>
            <Link className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-ink" to={`/ro/${ro.id}/inspect`}>
              {user.role === "tech" ? "Perform DVI" : "Open DVI"}
            </Link>
          </div>
          {counts && (
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-ok">{counts.ok} green</span>
              <span className="text-warn">{counts.recommend} yellow</span>
              <span className="text-urgent">{counts.urgent} red</span>
              <span className="text-paper/50">{counts.done}/{counts.total} rated</span>
              {ro.inspection.completedAt && <span className="text-ok">Complete</span>}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-ink-800 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl">Jobs</h2>
            {user.role !== "tech" && (
              <select
                className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
                defaultValue=""
                onChange={(event) => {
                  const canned = cannedJobs.find((item) => item.id === event.target.value);
                  if (canned) addCannedJob(ro.id, cannedToJob(canned));
                  event.target.value = "";
                }}
              >
                <option value="">Add canned job</option>
                {cannedJobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            )}
          </div>
          {ro.jobs.length === 0 && <p className="text-sm text-paper/50">No jobs yet. Finish the DVI, then add canned jobs from yellow/red findings.</p>}
          <div className="grid gap-3">
            {ro.jobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-white/10 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-paper/60">{job.concern}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{money(jobTotal(job))}</p>
                    <p className="text-xs text-paper/50">
                      {job.authorized === true ? "Authorized" : job.authorized === false ? "Declined" : "Needs authorization"}
                    </p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {job.labor.map((line) => (
                    <li key={line.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-black/20 p-2">
                      <span className="flex-1">{line.description} · {line.hours}h</span>
                      <select
                        className="rounded border border-white/10 bg-ink-700 px-2 py-1 text-xs"
                        value={line.techId ?? ""}
                        onChange={(event) => assignLaborTech(ro.id, line.id, event.target.value || null)}
                      >
                        <option value="">Unassigned</option>
                        {techs.map((tech) => (
                          <option key={tech.id} value={tech.id}>{tech.name}</option>
                        ))}
                      </select>
                      {(user.role === "tech" ? line.techId === user.id : true) && job.authorized && (
                        <button
                          className={`rounded-lg px-3 py-1 text-xs font-semibold ${line.clockStartedAt ? "bg-urgent text-white" : "bg-ok text-white"}`}
                          type="button"
                          onClick={() => toggleClock(ro.id, line.id)}
                        >
                          {line.clockStartedAt ? "Stop" : "Clock in"} · {formatDuration(clockedSeconds(line.clockStartedAt, line.billedSeconds))}
                        </button>
                      )}
                    </li>
                  ))}
                  {job.parts.map((part) => (
                    <li key={part.id} className="flex justify-between text-paper/70">
                      <span>{part.qty}× {part.name} · {part.status.replace("_", " ")}</span>
                      <span>{money(part.qty * part.price)}</span>
                    </li>
                  ))}
                </ul>
                {user.role !== "tech" && job.authorized == null && (
                  <div className="mt-3 flex gap-2">
                    <button className="rounded-lg bg-ok px-3 py-1.5 text-sm font-semibold" type="button" onClick={() => authorizeJobs(ro.id, [job.id], method)}>Authorize</button>
                    <button className="rounded-lg bg-white/10 px-3 py-1.5 text-sm" type="button" onClick={() => declineJob(ro.id, job.id)}>Decline</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-ink-800 p-4">
          <h2 className="mb-3 font-display text-xl">Totals</h2>
          <p className="flex justify-between"><span>Written</span><strong>{money(totals.written)}</strong></p>
          <p className="flex justify-between text-ok"><span>Authorized</span><strong>{money(totals.authorized)}</strong></p>
          <p className="flex justify-between text-warn"><span>Recommended</span><strong>{money(totals.recommended)}</strong></p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-ink-800 p-4">
          <h2 className="mb-3 font-display text-xl">Workflow</h2>
          <label className="mb-3 block text-sm text-paper/70">
            Status
            <select className="mt-1 w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-paper" value={ro.status} onChange={(event) => setStatus(ro.id, event.target.value as RoStatus)}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{statusLabel(status)}</option>
              ))}
            </select>
          </label>
          {user.role !== "tech" && (
            <>
              <label className="mb-3 block text-sm text-paper/70">
                Authorization method
                <select className="mt-1 w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-paper" value={method} onChange={(event) => setMethod(event.target.value as AuthMethod)}>
                  <option value="in_person">Verbal in person</option>
                  <option value="phone">Phone</option>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                </select>
              </label>
              <div className="grid gap-2">
                <button className="rounded-lg bg-gold px-3 py-2 font-semibold text-ink" type="button" onClick={() => sendEstimate(ro.id)}>
                  Send estimate to customer
                </button>
                <button className="rounded-lg border border-white/15 px-3 py-2" type="button" onClick={() => navigate(`/approve/${ro.id}`)}>
                  Open customer approval
                </button>
                <button
                  className="rounded-lg bg-ok px-3 py-2 font-semibold"
                  type="button"
                  onClick={() => authorizeJobs(ro.id, ro.jobs.filter((j) => j.authorized !== false).map((j) => j.id), method)}
                >
                  Authorize remaining jobs
                </button>
              </div>
              {ro.estimateSentAt && <p className="mt-2 text-xs text-paper/50">Estimate sent {formatWhen(ro.estimateSentAt)}</p>}
            </>
          )}
        </section>
        <section className="rounded-2xl border border-white/10 bg-ink-800 p-4">
          <h2 className="mb-3 font-display text-xl">WIP notes</h2>
          <div className="mb-3 max-h-56 space-y-2 overflow-auto text-sm">
            {ro.notes.map((item) => (
              <p key={item.id}>
                <span className="text-gold">{users.find((u) => u.id === item.userId)?.name.split(" ")[0]}</span>
                <span className="text-paper/40"> · {formatWhen(item.at)}</span>
                <br />
                {item.body}
              </p>
            ))}
          </div>
          <form
            className="grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!note.trim()) return;
              addNote(ro.id, user.id, note.trim());
              setNote("");
            }}
          >
            <textarea className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note for the other side of the shop…" />
            <button className="rounded-lg bg-white/10 px-3 py-2 text-sm" type="submit">Add note</button>
          </form>
        </section>
      </aside>
    </div>
  );
}
