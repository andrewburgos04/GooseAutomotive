"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  appointments,
  getPatient,
  patientName,
} from "@/data/store";
import type { AppointmentStatus } from "@/data/types";

const FILTERS: Array<"All" | AppointmentStatus> = [
  "All",
  "Scheduled",
  "Checked In",
  "With Provider",
  "Completed",
];

export default function SchedulePage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const rows = useMemo(() => {
    return appointments.filter((a) =>
      filter === "All" ? a.status !== "Cancelled" : a.status === filter
    );
  }, [filter]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Schedule</h1>
          <p>
            Day board for Aug 15, 2026 — track rooming status from arrival
            through checkout.
          </p>
        </div>
        <button className="btn btn-primary" type="button">
          + New appointment
        </button>
      </div>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Harbor Family Medicine · Main Clinic</h2>
          <span className="muted">{rows.length} visits</span>
        </div>
        <div className="panel-body">
          <div className="schedule-board">
            {rows.map((appt, i) => {
              const patient = getPatient(appt.patientId);
              if (!patient) return null;
              return (
                <Link
                  key={appt.id}
                  href={`/patients/${patient.id}`}
                  className="appt"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="appt-time">{appt.time}</div>
                  <div>
                    <div className="appt-title">{patientName(patient)}</div>
                    <div className="appt-meta">
                      {appt.type} · {appt.reason} · {appt.durationMin} min ·{" "}
                      {appt.provider}
                      {appt.room ? ` · ${appt.room}` : ""}
                    </div>
                  </div>
                  <StatusBadge status={appt.status} />
                </Link>
              );
            })}
            {rows.length === 0 && (
              <div className="empty">No appointments in this view.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
