"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  formatDate,
  formatTime,
  getPatient,
  labs,
  patientName,
} from "@/data/store";

const FILTERS = ["All", "Critical", "Flagged", "Pending", "Final"] as const;

export default function LabsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const rows = useMemo(() => {
    return labs.filter((lab) => {
      if (filter === "All") return true;
      if (filter === "Flagged") return lab.flagged;
      return lab.status === filter;
    });
  }, [filter]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Lab results</h1>
          <p>
            Review queue for pending, final, and critical results with one-click
            chart jump.
          </p>
        </div>
        <button className="btn btn-secondary" type="button">
          New lab order
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
        <div className="panel-body">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Collected</th>
                <th>Result</th>
                <th>Ordered by</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lab) => {
                const patient = getPatient(lab.patientId);
                return (
                  <tr key={lab.id}>
                    <td>
                      {patient ? (
                        <Link
                          href={`/patients/${patient.id}`}
                          className="strong"
                          style={{ color: "var(--teal-deep)" }}
                        >
                          {patientName(patient)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{lab.testName}</td>
                    <td>
                      {formatDate(lab.collectedAt)} {formatTime(lab.collectedAt)}
                    </td>
                    <td>{lab.resultSummary}</td>
                    <td>{lab.orderedBy}</td>
                    <td>
                      <StatusBadge status={lab.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty">No lab results in this filter.</div>
          )}
        </div>
      </section>
    </>
  );
}
