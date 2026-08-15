"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  claims,
  formatCurrency,
  formatDate,
  getPatient,
  patientName,
} from "@/data/store";

const FILTERS = ["All", "Draft", "Submitted", "Denied", "Paid"] as const;

export default function BillingPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const rows = useMemo(() => {
    return claims.filter((c) => (filter === "All" ? true : c.status === filter));
  }, [filter]);

  const totals = useMemo(() => {
    const outstanding = claims
      .filter((c) => c.status === "Draft" || c.status === "Submitted" || c.status === "Denied")
      .reduce((sum, c) => sum + c.amount, 0);
    const paid = claims
      .filter((c) => c.status === "Paid")
      .reduce((sum, c) => sum + c.amount, 0);
    const denied = claims.filter((c) => c.status === "Denied").length;
    const draft = claims.filter((c) => c.status === "Draft").length;
    return { outstanding, paid, denied, draft };
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Billing</h1>
          <p>
            Claim worklist for charge capture, payer submission, and denial
            follow-up.
          </p>
        </div>
        <button className="btn btn-primary" type="button">
          Create claim
        </button>
      </div>

      <div className="stat-strip">
        <div className="stat">
          <div className="label">Outstanding</div>
          <div className="value">{formatCurrency(totals.outstanding)}</div>
        </div>
        <div className="stat">
          <div className="label">Paid (sample)</div>
          <div className="value">{formatCurrency(totals.paid)}</div>
        </div>
        <div className="stat">
          <div className="label">Draft claims</div>
          <div className="value">{totals.draft}</div>
        </div>
        <div className="stat">
          <div className="label">Denials</div>
          <div className="value">{totals.denied}</div>
        </div>
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
                <th>Claim</th>
                <th>Patient</th>
                <th>DOS</th>
                <th>CPT / Dx</th>
                <th>Payer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((claim) => {
                const patient = getPatient(claim.patientId);
                return (
                  <tr key={claim.id}>
                    <td className="strong">{claim.id.toUpperCase()}</td>
                    <td>
                      {patient ? (
                        <Link
                          href={`/patients/${patient.id}`}
                          style={{ color: "var(--teal-deep)", fontWeight: 700 }}
                        >
                          {patientName(patient)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{formatDate(claim.dos)}</td>
                    <td>
                      {claim.cpt}
                      <div className="muted" style={{ fontSize: "0.8rem" }}>
                        {claim.diagnosis}
                      </div>
                    </td>
                    <td>{claim.payer}</td>
                    <td>{formatCurrency(claim.amount)}</td>
                    <td>
                      <StatusBadge status={claim.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty">No claims in this status.</div>
          )}
        </div>
      </section>
    </>
  );
}
