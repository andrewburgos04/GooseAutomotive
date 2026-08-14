import type { BoardColumn, ClockKind, Job, RepairOrder, RoStatus } from "../types";

export const LABOR_RATE = 145;

export function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function jobTotal(job: Job) {
  const labor = job.labor.reduce((sum, line) => sum + line.hours * line.rate, 0);
  const parts = job.parts.reduce((sum, line) => sum + line.qty * line.price, 0);
  return labor + parts;
}

export function roTotals(ro: RepairOrder) {
  const written = ro.jobs.reduce((sum, job) => sum + jobTotal(job), 0);
  const authorized = ro.jobs.filter((job) => job.authorized).reduce((sum, job) => sum + jobTotal(job), 0);
  const recommended = ro.jobs.filter((job) => job.authorized !== true).reduce((sum, job) => sum + jobTotal(job), 0);
  return { written, authorized, recommended };
}

export function columnFor(status: RoStatus): BoardColumn {
  if (status === "in_progress" || status === "waiting_parts" || status === "qc") return "wip";
  if (status === "ready" || status === "posted") return "completed";
  return "estimates";
}

export function statusLabel(status: RoStatus) {
  const labels: Record<RoStatus, string> = {
    not_started: "Not started",
    inspecting: "Inspecting",
    requires_auth: "Requires authorization",
    pending_auth: "Pending authorization",
    in_progress: "In progress",
    waiting_parts: "Waiting on parts",
    qc: "Quality check",
    ready: "Ready for pickup",
    posted: "Posted",
  };
  return labels[status];
}

export function vehicleTitle(year: number, make: string, model: string) {
  return `${year} ${make} ${model}`;
}

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function hoursFromSeconds(seconds: number) {
  return seconds / 3600;
}

export function clockedSeconds(startedAt: string | null, billedSeconds: number, now = Date.now()) {
  if (!startedAt) return billedSeconds;
  return billedSeconds + Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function inspectionCounts(ro: RepairOrder) {
  let ok = 0;
  let recommend = 0;
  let urgent = 0;
  let done = 0;
  for (const item of ro.inspection.items) {
    if (item.rating) done += 1;
    if (item.rating === "ok") ok += 1;
    if (item.rating === "recommend") recommend += 1;
    if (item.rating === "urgent") urgent += 1;
  }
  return { ok, recommend, urgent, done, total: ro.inspection.items.length };
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function punchSeconds(punches: { kind: ClockKind; at: string }[], now = Date.now()) {
  const sorted = [...punches].sort((a, b) => a.at.localeCompare(b.at));
  let total = 0;
  let start: number | null = null;
  for (const punch of sorted) {
    if (punch.kind === "in" || punch.kind === "break_end") start = new Date(punch.at).getTime();
    if ((punch.kind === "out" || punch.kind === "break_start") && start) {
      total += new Date(punch.at).getTime() - start;
      start = null;
    }
  }
  if (start) total += now - start;
  return Math.floor(total / 1000);
}
