"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ageFromDob,
  formatDate,
  formatTime,
  getPatient,
  patientName,
} from "@/data/store";

const TABS = [
  "Summary",
  "Problems",
  "Medications",
  "Allergies",
  "Vitals",
  "Notes",
] as const;

type Tab = (typeof TABS)[number];

export default function PatientChartPage() {
  const params = useParams<{ id: string }>();
  const patient = getPatient(params.id);
  const [tab, setTab] = useState<Tab>("Summary");

  const bmi = useMemo(() => {
    const v = patient?.vitals[0];
    if (!v) return null;
    const kg = v.weightLbs * 0.453592;
    const m = v.heightIn * 0.0254;
    return (kg / (m * m)).toFixed(1);
  }, [patient]);

  if (!patient) {
    return (
      <div className="panel">
        <div className="panel-body" style={{ textAlign: "center", padding: "2.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", marginTop: 0 }}>
            Chart not found
          </h1>
          <p className="muted">That patient record is not in the demo dataset.</p>
          <Link className="btn btn-primary" href="/patients">
            Back to patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: "0.85rem" }}>
        <Link className="btn btn-ghost" href="/patients">
          ← Back to patients
        </Link>
      </div>

      <header className="chart-header">
        <div className="chart-title-row">
          <div>
            <h1>{patientName(patient)}</h1>
            <div className="chart-meta">
              <span>{patient.mrn}</span>
              <span>
                {ageFromDob(patient.dob)} y/o {patient.sex}
              </span>
              <span>DOB {formatDate(patient.dob)}</span>
              <span>{patient.insurance}</span>
              <span>PCP {patient.pcp}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn btn-secondary" type="button">
              Start note
            </button>
            <button className="btn btn-primary" type="button">
              Order / Prescribe
            </button>
          </div>
        </div>

        <div className="allergy-banner" aria-label="Allergies">
          {patient.allergies.map((a) => (
            <span key={a.id} className="allergy-pill">
              {a.substance}
              {a.reaction !== "—" ? ` · ${a.reaction}` : ""}
            </span>
          ))}
        </div>

        {patient.flags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {patient.flags.map((f) => (
              <span key={f} className="flag">
                {f}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="tabs" role="tablist" aria-label="Chart sections">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Summary" && (
        <div className="grid-2">
          <section className="panel">
            <div className="panel-head">
              <h2>Demographics & coverage</h2>
            </div>
            <div className="panel-body">
              <dl className="kv">
                <dt>Preferred</dt>
                <dd>{patient.preferredName ?? "—"}</dd>
                <dt>Phone</dt>
                <dd>{patient.phone}</dd>
                <dt>Email</dt>
                <dd>{patient.email}</dd>
                <dt>Address</dt>
                <dd>
                  {patient.address}, {patient.city}, {patient.state} {patient.zip}
                </dd>
                <dt>Member ID</dt>
                <dd>{patient.memberId}</dd>
                <dt>Last visit</dt>
                <dd>{formatDate(patient.lastVisit)}</dd>
                <dt>Next visit</dt>
                <dd>{patient.nextVisit ? formatDate(patient.nextVisit) : "—"}</dd>
              </dl>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Active problems</h2>
            </div>
            <div className="panel-body">
              {patient.problems
                .filter((p) => p.status !== "Resolved")
                .map((p) => (
                  <div key={p.id} className="list-row">
                    <div>
                      <div className="strong">{p.name}</div>
                      <div className="muted" style={{ fontSize: "0.86rem" }}>
                        {p.icd10} · onset {formatDate(p.onset)}
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Active medications</h2>
            </div>
            <div className="panel-body">
              {patient.medications
                .filter((m) => m.status === "Active")
                .map((m) => (
                  <div key={m.id} className="list-row">
                    <div>
                      <div className="strong">
                        {m.name} {m.dose}
                      </div>
                      <div className="muted" style={{ fontSize: "0.86rem" }}>
                        {m.frequency} · {m.prescribedBy}
                      </div>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Latest vitals</h2>
            </div>
            <div className="panel-body">
              {patient.vitals[0] ? (
                <>
                  <div className="muted" style={{ marginBottom: "0.75rem" }}>
                    Recorded {formatDate(patient.vitals[0].recordedAt)}{" "}
                    {formatTime(patient.vitals[0].recordedAt)}
                  </div>
                  <div className="stat-strip" style={{ marginBottom: 0 }}>
                    <div className="stat">
                      <div className="label">BP</div>
                      <div className="value">
                        {patient.vitals[0].bpSystolic}/
                        {patient.vitals[0].bpDiastolic}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="label">HR</div>
                      <div className="value">{patient.vitals[0].hr}</div>
                    </div>
                    <div className="stat">
                      <div className="label">SpO₂</div>
                      <div className="value">{patient.vitals[0].spo2}%</div>
                    </div>
                    <div className="stat">
                      <div className="label">BMI</div>
                      <div className="value">{bmi ?? "—"}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty">No vitals recorded.</div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === "Problems" && (
        <section className="panel">
          <div className="panel-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>ICD-10</th>
                  <th>Onset</th>
                  <th>Status</th>
                  <th>Noted by</th>
                </tr>
              </thead>
              <tbody>
                {patient.problems.map((p) => (
                  <tr key={p.id}>
                    <td className="strong">{p.name}</td>
                    <td>{p.icd10}</td>
                    <td>{formatDate(p.onset)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>{p.notedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "Medications" && (
        <section className="panel">
          <div className="panel-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dose / Sig</th>
                  <th>Start</th>
                  <th>Prescriber</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patient.medications.map((m) => (
                  <tr key={m.id}>
                    <td className="strong">{m.name}</td>
                    <td>
                      {m.dose} · {m.frequency}
                    </td>
                    <td>{formatDate(m.startDate)}</td>
                    <td>{m.prescribedBy}</td>
                    <td>
                      <StatusBadge status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "Allergies" && (
        <section className="panel">
          <div className="panel-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Substance</th>
                  <th>Reaction</th>
                  <th>Severity</th>
                  <th>Onset</th>
                </tr>
              </thead>
              <tbody>
                {patient.allergies.map((a) => (
                  <tr key={a.id}>
                    <td className="strong">{a.substance}</td>
                    <td>{a.reaction}</td>
                    <td>
                      <StatusBadge status={a.severity} />
                    </td>
                    <td>{a.onset ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "Vitals" && (
        <section className="panel">
          <div className="panel-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Recorded</th>
                  <th>BP</th>
                  <th>HR</th>
                  <th>Temp</th>
                  <th>SpO₂</th>
                  <th>Weight</th>
                  <th>Pain</th>
                </tr>
              </thead>
              <tbody>
                {patient.vitals.map((v) => (
                  <tr key={v.id}>
                    <td>
                      {formatDate(v.recordedAt)} {formatTime(v.recordedAt)}
                    </td>
                    <td>
                      {v.bpSystolic}/{v.bpDiastolic}
                    </td>
                    <td>{v.hr}</td>
                    <td>{v.tempF.toFixed(1)}°F</td>
                    <td>{v.spo2}%</td>
                    <td>{v.weightLbs} lb</td>
                    <td>{v.pain}/10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "Notes" && (
        <section className="panel">
          <div className="panel-body">
            {patient.notes.map((n) => (
              <article key={n.id} className="note">
                <h3>
                  <span className="timeline-dot" aria-hidden />
                  {n.visitType} · {formatDate(n.date)}
                </h3>
                <div className="muted" style={{ fontSize: "0.86rem" }}>
                  {n.author} · {n.signed ? "Signed" : "Unsigned draft"}
                </div>
                <p>
                  <strong>CC:</strong> {n.chiefComplaint}
                </p>
                <p>
                  <strong>Assessment:</strong> {n.assessment}
                </p>
                <p>
                  <strong>Plan:</strong> {n.plan}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
