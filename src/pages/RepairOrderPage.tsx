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
import type { AuthMethod, FinanceProvider, PayMethod, RoLabel, RoStatus, VendorId } from "../types";
import { LABEL_COPY } from "../lib/media";
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
  const toggleLabel = useShop((s) => s.toggleLabel);
  const takePayment = useShop((s) => s.takePayment);
  const applyFinancing = useShop((s) => s.applyFinancing);
  const orderParts = useShop((s) => s.orderParts);
  const fleet = useShop((s) => s.fleetAccounts.find((f) => f.id === s.customers.find((c) => c.id === ro?.customerId)?.fleetAccountId));
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
            <p className="text-xs text-goose">{ro.number}</p>
            <h1 className="text-4xl font-extrabold text-navy">{vehicleTitle(vehicle.year, vehicle.make, vehicle.model)}</h1>
            <p className="text-muted">
              {customer.company ? `${customer.company} · ${customer.name}` : customer.name} · {vehicle.mileage.toLocaleString()} mi · {vehicle.plate}
              {vehicle.unitNumber ? ` · Unit ${vehicle.unitNumber}` : ""}
            </p>
            {fleet && <p className="mt-1 text-sm font-semibold text-navy-brand">Fleet {fleet.company} · {fleet.accountNumber}{fleet.gsa ? " · GSA" : ""} · {fleet.billingEmail}</p>}
            <div className="mt-2 flex flex-wrap gap-1">
              {(["waiting_parts", "customer_waiting", "come_back", "warranty", "fleet", "euro"] as RoLabel[]).map((label) => (
                <button key={label} type="button" onClick={() => toggleLabel(ro.id, label)} className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ro.labels.includes(label) ? "bg-navy text-white" : "bg-mist text-muted"}`}>
                  {LABEL_COPY[label]}
                </button>
              ))}
            </div>
          </div>
          <StatusChip status={ro.status} />
        </div>

        <section className="mb-4 rounded-2xl border border-navy/10 bg-white p-4">
          <h2 className="mb-2 text-xl font-extrabold">Customer concern</h2>
          <p>{ro.concern}</p>
          <p className="mt-2 text-sm text-muted">Advisor {advisor?.name} · Promise {formatWhen(ro.promiseTime)}</p>
        </section>

        <section className="mb-4 rounded-2xl border border-navy/10 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-extrabold">32-point inspection</h2>
            <Link className="rounded-lg bg-goose px-3 py-2 text-sm font-semibold text-white" to={`/ro/${ro.id}/inspect`}>
              {user.role === "tech" ? "Perform DVI" : "Open DVI"}
            </Link>
            <Link className="rounded-lg bg-mist px-3 py-2 text-sm font-semibold" to={`/vehicles/${vehicle.id}`}>Vehicle history</Link>
          </div>
          {counts && (
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-ok">{counts.ok} green</span>
              <span className="text-warn">{counts.recommend} yellow</span>
              <span className="text-urgent">{counts.urgent} red</span>
              <span className="text-muted">{counts.done}/{counts.total} rated</span>
              {ro.inspection.completedAt && <span className="text-ok">Complete</span>}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-navy/10 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-extrabold">Jobs</h2>
            {user.role !== "tech" && (
              <select
                className="rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm"
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
          {ro.jobs.length === 0 && <p className="text-sm text-muted">No jobs yet. Finish the DVI, then add canned jobs from yellow/red findings.</p>}
          <div className="grid gap-3">
            {ro.jobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-navy/10 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted">{job.concern}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{money(jobTotal(job))}</p>
                    <p className="text-xs text-muted">
                      {job.authorized === true ? "Authorized" : job.authorized === false ? "Declined" : "Needs authorization"}
                    </p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {job.labor.map((line) => (
                    <li key={line.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-mist p-2">
                      <span className="flex-1">{line.description} · {line.hours}h</span>
                      <select
                        className="rounded border border-navy/10 bg-mist px-2 py-1 text-xs"
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
                    <li key={part.id} className="flex justify-between text-muted">
                      <span>{part.qty}× {part.name} · {part.status.replace("_", " ")}</span>
                      <span>{money(part.qty * part.price)}</span>
                    </li>
                  ))}
                </ul>
                {user.role !== "tech" && job.authorized == null && (
                  <div className="mt-3 flex gap-2">
                    <button className="rounded-lg bg-goose px-3 py-1.5 text-sm font-semibold text-white" type="button" onClick={() => authorizeJobs(ro.id, [job.id], method)}>Authorize</button>
                    <button className="rounded-lg bg-mist px-3 py-1.5 text-sm font-semibold text-navy" type="button" onClick={() => declineJob(ro.id, job.id)}>Decline</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-navy/10 bg-white p-4">
          <h2 className="mb-3 text-xl font-extrabold">Totals</h2>
          <p className="flex justify-between"><span>Written</span><strong>{money(totals.written)}</strong></p>
          <p className="flex justify-between text-ok"><span>Authorized</span><strong>{money(totals.authorized)}</strong></p>
          <p className="flex justify-between text-warn"><span>Recommended</span><strong>{money(totals.recommended)}</strong></p>
          <p className="mt-2 flex justify-between text-sm"><span>Paid</span><strong>{money(ro.paidAmount)}</strong></p>
          <p className="text-sm text-muted">Balance {money(Math.max(0, totals.authorized - ro.paidAmount))}</p>
        </section>
        <section className="rounded-2xl border border-navy/10 bg-white p-4">
          <h2 className="mb-3 text-xl font-extrabold">Collect / finance / print</h2>
          <div className="grid gap-2">
            {(["card", "apple", "text", "cash"] as PayMethod[]).map((methodName) => (
              <button key={methodName} className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold capitalize text-white" type="button" onClick={() => takePayment(ro.id, methodName, Math.max(1, totals.authorized - ro.paidAmount), methodName === "card" ? "Visa 4242 demo" : "demo")}>
                Pay {methodName === "text" ? "text-to-pay" : methodName}
              </button>
            ))}
            {(["synchrony", "aff", "easypay"] as FinanceProvider[]).map((provider) => (
              <button key={provider} className="rounded-lg border border-navy/15 px-3 py-2 text-sm font-semibold uppercase" type="button" onClick={() => applyFinancing(ro.id, provider, totals.written)}>
                {provider === "aff" ? "American First" : provider === "easypay" ? "EasyPay" : "Synchrony"}
              </button>
            ))}
            <button className="rounded-lg bg-mist px-3 py-2 text-sm font-semibold" type="button" onClick={() => {
              const lines = ro.jobs.flatMap((j) => j.parts.filter((p) => p.status === "needed")).map((p) => ({ sku: p.sku ?? p.name, name: p.name, qty: p.qty, cost: p.cost }));
              if (lines.length) orderParts(ro.id, "napa" as VendorId, lines);
            }}>Order needed parts (NAPA)</button>
            <Link className="rounded-lg border border-navy/15 px-3 py-2 text-center text-sm font-semibold" to={`/print/${ro.id}/inspection`}>Print DVI</Link>
            <Link className="rounded-lg border border-navy/15 px-3 py-2 text-center text-sm font-semibold" to={`/print/${ro.id}/estimate`}>Print estimate</Link>
            <Link className="rounded-lg border border-navy/15 px-3 py-2 text-center text-sm font-semibold" to={`/print/${ro.id}/invoice`}>Print invoice</Link>
          </div>
        </section>
        <section className="rounded-2xl border border-navy/10 bg-white p-4">
          <h2 className="mb-3 text-xl font-extrabold">Workflow</h2>
          <label className="mb-3 block text-sm text-muted">
            Status
            <select className="mt-1 w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-navy" value={ro.status} onChange={(event) => setStatus(ro.id, event.target.value as RoStatus)}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{statusLabel(status)}</option>
              ))}
            </select>
          </label>
          {user.role !== "tech" && (
            <>
              <label className="mb-3 block text-sm text-muted">
                Authorization method
                <select className="mt-1 w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-navy" value={method} onChange={(event) => setMethod(event.target.value as AuthMethod)}>
                  <option value="in_person">Verbal in person</option>
                  <option value="phone">Phone</option>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                </select>
              </label>
              <div className="grid gap-2">
                <button className="rounded-lg bg-goose px-3 py-2 font-semibold text-white" type="button" onClick={() => sendEstimate(ro.id)}>
                  Send estimate to customer
                </button>
                <button className="rounded-lg border border-navy/15 px-3 py-2 font-semibold" type="button" onClick={() => navigate(`/approve/${ro.id}`)}>
                  Open customer approval
                </button>
                <button
                  className="rounded-lg bg-goose px-3 py-2 font-semibold text-white"
                  type="button"
                  onClick={() => authorizeJobs(ro.id, ro.jobs.filter((j) => j.authorized !== false).map((j) => j.id), method)}
                >
                  Authorize remaining jobs
                </button>
              </div>
              {ro.estimateSentAt && <p className="mt-2 text-xs text-muted">Estimate sent {formatWhen(ro.estimateSentAt)}</p>}
            </>
          )}
        </section>
        <section className="rounded-2xl border border-navy/10 bg-white p-4">
          <h2 className="mb-3 text-xl font-extrabold">WIP notes</h2>
          <div className="mb-3 max-h-56 space-y-2 overflow-auto text-sm">
            {ro.notes.map((item) => (
              <p key={item.id}>
                <span className="text-goose">{users.find((u) => u.id === item.userId)?.name.split(" ")[0]}</span>
                <span className="text-muted"> · {formatWhen(item.at)}</span>
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
            <textarea className="rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note for the other side of the shop…" />
            <button className="rounded-lg bg-mist px-3 py-2 text-sm" type="submit">Add note</button>
          </form>
        </section>
      </aside>
    </div>
  );
}
