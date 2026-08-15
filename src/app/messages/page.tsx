"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  formatTime,
  getPatient,
  messages,
  patientName,
} from "@/data/store";

const CATEGORIES = ["All", "Clinical", "Refill", "Referral", "Admin", "Patient"] as const;

export default function MessagesPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [selectedId, setSelectedId] = useState(messages[0]?.id);

  const filtered = useMemo(() => {
    return messages.filter((m) =>
      category === "All" ? true : m.category === category
    );
  }, [category]);

  const selected = filtered.find((m) => m.id === selectedId) ?? filtered[0];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Messages</h1>
          <p>
            Clinical inbox for portal questions, refill requests, referrals, and
            lab alerts — ECW-style jellybean workflow.
          </p>
        </div>
        <button className="btn btn-primary" type="button">
          Compose
        </button>
      </div>

      <div className="filters">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`filter-btn${category === c ? " active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h2>Inbox</h2>
            <span className="muted">
              {messages.filter((m) => m.unread).length} unread
            </span>
          </div>
          <div className="panel-body">
            {filtered.map((msg) => (
              <button
                key={msg.id}
                type="button"
                className={`message-item${msg.unread ? " unread" : ""}`}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: 0,
                  background:
                    selected?.id === msg.id
                      ? "rgba(15, 109, 106, 0.06)"
                      : "transparent",
                }}
                onClick={() => setSelectedId(msg.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <span className="subject">{msg.subject}</span>
                  <StatusBadge status={msg.priority} />
                </div>
                <div className="muted" style={{ fontSize: "0.86rem" }}>
                  {msg.from} · {formatTime(msg.receivedAt)}
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>
                  {msg.preview}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="empty">No messages in this folder.</div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Reading pane</h2>
            {selected?.patientId && (
              <Link
                className="btn btn-ghost"
                href={`/patients/${selected.patientId}`}
              >
                Open chart
              </Link>
            )}
          </div>
          <div className="panel-body">
            {selected ? (
              <div style={{ display: "grid", gap: "0.85rem" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                    {selected.subject}
                  </h2>
                  <div className="muted" style={{ marginTop: 6 }}>
                    From {selected.from} · {formatTime(selected.receivedAt)} ·{" "}
                    {selected.category}
                  </div>
                </div>
                {selected.patientId && getPatient(selected.patientId) && (
                  <div className="chip" style={{ width: "fit-content" }}>
                    Patient {patientName(getPatient(selected.patientId)!)}
                  </div>
                )}
                <p style={{ margin: 0, lineHeight: 1.55, color: "var(--ink-soft)" }}>
                  {selected.preview} This demo message stands in for a full
                  secure clinical thread. In production, replies would route to
                  the care team pool with audit logging.
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button className="btn btn-primary" type="button">
                    Reply
                  </button>
                  <button className="btn btn-secondary" type="button">
                    Assign
                  </button>
                  <button className="btn btn-secondary" type="button">
                    Mark done
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty">Select a message to read.</div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
