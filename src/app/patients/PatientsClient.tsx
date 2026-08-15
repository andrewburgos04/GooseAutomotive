"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ageFromDob,
  formatDate,
  patients,
  patientName,
} from "@/data/store";

export default function PatientsClient() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const hay = `${p.firstName} ${p.lastName} ${p.mrn} ${p.insurance}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Patient registry</h1>
          <p>
            Look up charts by name or MRN. Open a record for problems, meds,
            allergies, vitals, and notes.
          </p>
        </div>
        <button className="btn btn-primary" type="button">
          + Register patient
        </button>
      </div>

      <div className="search" style={{ maxWidth: 520, marginBottom: "1rem" }}>
        <span aria-hidden>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name, MRN, or payer…"
          aria-label="Filter patients"
        />
      </div>

      <div className="patient-grid">
        {filtered.map((p) => (
          <Link key={p.id} href={`/patients/${p.id}`} className="patient-card">
            <div>
              <h3>{patientName(p)}</h3>
              <div className="muted" style={{ marginTop: 4, fontSize: "0.88rem" }}>
                {p.mrn} · {ageFromDob(p.dob)} y/o {p.sex}
              </div>
            </div>
            <div className="muted" style={{ fontSize: "0.88rem" }}>
              Last visit {formatDate(p.lastVisit)}
              {p.nextVisit ? ` · Next ${formatDate(p.nextVisit)}` : ""}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {p.flags.length === 0 && (
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  No active flags
                </span>
              )}
              {p.flags.map((f) => (
                <span key={f} className="flag">
                  {f}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="panel">
          <div className="empty">No patients match “{query}”.</div>
        </div>
      )}
    </>
  );
}
