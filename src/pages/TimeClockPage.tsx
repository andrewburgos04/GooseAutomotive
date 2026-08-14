import { useEffect, useMemo, useState } from "react";
import { formatDuration, formatWhen, punchSeconds } from "../lib/format";
import { useCurrentUser, useShop } from "../store";
import type { ClockKind } from "../types";

export function TimeClockPage() {
  const user = useCurrentUser();
  const punches = useShop((s) => s.timePunches);
  const punch = useShop((s) => s.punch);
  const users = useShop((s) => s.users);
  const locationId = useShop((s) => s.currentLocationId);
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const mine = useMemo(() => punches.filter((p) => p.userId === user?.id).sort((a, b) => a.at.localeCompare(b.at)), [punches, user]);
  const last = mine[mine.length - 1];
  const onClock = last && (last.kind === "in" || last.kind === "break_end");
  const onBreak = last?.kind === "break_start";
  const today = mine.filter((p) => new Date(p.at).toDateString() === new Date().toDateString());
  const secondsToday = punchSeconds(today);

  const action = (kind: ClockKind) => punch(kind);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-accent text-xs font-bold uppercase tracking-wider text-goose">Employee time clock</p>
      <h1 className="text-4xl font-extrabold">Not the job clock. Payroll hours.</h1>
      <p className="mt-2 text-muted">{user?.name} · today {formatDuration(secondsToday)} {onBreak ? "· on break" : onClock ? "· clocked in" : "· clocked out"}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button className="rounded-xl bg-ok py-4 font-bold text-white disabled:opacity-40" disabled={!!onClock} type="button" onClick={() => action("in")}>Clock in</button>
        <button className="rounded-xl bg-warn py-4 font-bold text-navy disabled:opacity-40" disabled={!onClock} type="button" onClick={() => action("break_start")}>Break</button>
        <button className="rounded-xl bg-navy py-4 font-bold text-white disabled:opacity-40" disabled={!onBreak} type="button" onClick={() => action("break_end")}>End break</button>
        <button className="rounded-xl bg-goose py-4 font-bold text-white disabled:opacity-40" disabled={!onClock && !onBreak} type="button" onClick={() => action("out")}>Clock out</button>
      </div>
      <section className="mt-8 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="mb-3 text-xl font-extrabold">Today at this shop</h2>
        {users.filter((u) => u.locationId === locationId).map((u) => {
          const lastPunch = [...punches].reverse().find((p) => p.userId === u.id);
          return (
            <p key={u.id} className="flex justify-between border-b border-navy/5 py-2 text-sm">
              <span>{u.name}</span>
              <span className="text-muted">{lastPunch ? `${lastPunch.kind.replace("_", " ")} · ${formatWhen(lastPunch.at)}` : "No punches"}</span>
            </p>
          );
        })}
      </section>
    </div>
  );
}
