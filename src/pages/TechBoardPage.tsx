import { Link } from "react-router-dom";
import { clockedSeconds, formatDuration, hoursFromSeconds, money, vehicleTitle } from "../lib/format";
import { useCurrentUser, useShop } from "../store";
import { useEffect, useMemo, useState } from "react";

export function TechBoardPage() {
  const locationId = useShop((s) => s.currentLocationId);
  const allUsers = useShop((s) => s.users);
  const repairOrders = useShop((s) => s.repairOrders);
  const vehicles = useShop((s) => s.vehicles);
  const me = useCurrentUser();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const users = useMemo(
    () => allUsers.filter((u) => u.locationId === locationId && u.role === "tech"),
    [allUsers, locationId],
  );
  const ros = useMemo(
    () => repairOrders.filter((ro) => ro.locationId === locationId),
    [repairOrders, locationId],
  );

  const techs = me?.role === "tech" ? users.filter((u) => u.id === me.id) : users;

  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-[0.18em] text-goose">Tech board</p>
      <h1 className="mb-5 text-4xl font-extrabold text-navy">{me?.role === "tech" ? "My jobs" : "Who’s on what"}</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        {techs.map((tech) => {
          const lines = ros.flatMap((ro) =>
            ro.jobs.flatMap((job) =>
              job.labor
                .filter((line) => line.techId === tech.id)
                .map((line) => ({ ro, job, line })),
            ),
          );
          const billed = lines.reduce((sum, item) => sum + item.line.hours, 0);
          const clocked = lines.reduce((sum, item) => sum + hoursFromSeconds(clockedSeconds(item.line.clockStartedAt, item.line.billedSeconds)), 0);
          const efficiency = clocked > 0 ? Math.round((billed / clocked) * 100) : 0;
          return (
            <section key={tech.id} className="rounded-2xl border border-navy/10 bg-white p-4 shadow-card">
              <header className="mb-3">
                <h2 className="text-2xl font-extrabold text-navy">{tech.name}</h2>
                <p className="text-sm text-muted">
                  {tech.title} · {billed.toFixed(1)} billed hrs · {efficiency || "—"}% efficiency
                </p>
              </header>
              <div className="grid gap-2">
                {lines.length === 0 && <p className="text-sm text-muted">No labor assigned.</p>}
                {lines.map(({ ro, job, line }) => {
                  const vehicle = vehicles.find((v) => v.id === ro.vehicleId);
                  const running = Boolean(line.clockStartedAt);
                  return (
                    <Link key={line.id} to={`/ro/${ro.id}`} className={`rounded-xl border p-3 ${running ? "border-goose bg-goose/10" : "border-navy/10"}`}>
                      <p className="text-xs text-muted">{ro.number}</p>
                      <p className="font-semibold text-navy">
                        {vehicle ? vehicleTitle(vehicle.year, vehicle.make, vehicle.model) : job.title}
                      </p>
                      <p className="text-sm text-muted">{job.title}</p>
                      <p className="mt-1 text-xs font-semibold text-goose">
                        {running ? "Clocked in · " : ""}
                        {formatDuration(clockedSeconds(line.clockStartedAt, line.billedSeconds))} / {line.hours}h billed · {money(line.hours * line.rate)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
