"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTicketAction, type ActionResult } from "@/lib/actions";
import type { Ticket } from "@/lib/types";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/types";
import { PriorityBadge, StatusBadge } from "./StatusBadge";

const initial: ActionResult | null = null;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AdminDashboard({ tickets }: { tickets: Ticket[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    tickets[0]?.id ?? null,
  );
  const [state, formAction, pending] = useActionState(
    updateTicketAction,
    initial,
  );

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  const filtered = useMemo(() => {
    if (filter === "all") return tickets;
    return tickets.filter((t) => t.status === filter);
  }, [tickets, filter]);

  const selected =
    filtered.find((t) => t.id === selectedId) ??
    tickets.find((t) => t.id === selectedId) ??
    filtered[0] ??
    null;

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: tickets.length };
    for (const key of Object.keys(STATUS_LABELS)) {
      base[key] = tickets.filter((t) => t.status === key).length;
    }
    return base;
  }, [tickets]);

  return (
    <div className="admin-shell">
      <aside className="admin-filters" aria-label="Filter tickets">
        <button
          type="button"
          className={filter === "all" ? "is-active" : undefined}
          onClick={() => setFilter("all")}
        >
          All <span>{counts.all}</span>
        </button>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={filter === value ? "is-active" : undefined}
            onClick={() => setFilter(value)}
          >
            {label} <span>{counts[value] ?? 0}</span>
          </button>
        ))}
      </aside>

      <section className="admin-list" aria-label="Ticket inbox">
        {filtered.length === 0 ? (
          <p className="empty-state">No tickets in this view.</p>
        ) : (
          <ul>
            {filtered.map((ticket) => (
              <li key={ticket.id}>
                <button
                  type="button"
                  className={
                    selected?.id === ticket.id
                      ? "ticket-row is-selected"
                      : "ticket-row"
                  }
                  onClick={() => setSelectedId(ticket.id)}
                >
                  <div className="ticket-row__top">
                    <span className="mono">{ticket.id}</span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <strong>{ticket.subject}</strong>
                  <div className="ticket-row__meta">
                    <span>{ticket.company}</span>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-detail" aria-live="polite">
        {!selected ? (
          <p className="empty-state">Select a ticket to manage it.</p>
        ) : (
          <>
            <header className="admin-detail__header">
              <p className="mono">{selected.id}</p>
              <h2>{selected.subject}</h2>
              <p>
                {selected.requesterName} · {selected.requesterEmail} ·{" "}
                {selected.company}
              </p>
              <div className="badge-row">
                <StatusBadge status={selected.status} />
                <PriorityBadge priority={selected.priority} />
                <span className="badge">
                  {CATEGORY_LABELS[selected.category]}
                </span>
              </div>
            </header>

            <div className="admin-detail__body">
              <h3>Description</h3>
              <p className="preserve-breaks">{selected.description}</p>

              <h3>Timeline</h3>
              {selected.updates.length === 0 ? (
                <p className="muted">No updates yet.</p>
              ) : (
                <ol className="timeline">
                  {selected.updates
                    .slice()
                    .reverse()
                    .map((update) => (
                      <li key={update.id}>
                        <div>
                          <strong>{update.author}</strong>
                          {update.isInternal ? (
                            <span className="badge badge--internal">
                              Internal
                            </span>
                          ) : null}
                          <time dateTime={update.createdAt}>
                            {formatDate(update.createdAt)}
                          </time>
                        </div>
                        <p className="preserve-breaks">{update.message}</p>
                      </li>
                    ))}
                </ol>
              )}
            </div>

            <form action={formAction} className="admin-update-form">
              <input type="hidden" name="ticketId" value={selected.id} />
              <div className="form-grid form-grid--3">
                <label>
                  <span>Status</span>
                  <select name="status" defaultValue={selected.status} key={`s-${selected.id}-${selected.status}`}>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Priority</span>
                  <select
                    name="priority"
                    defaultValue={selected.priority}
                    key={`p-${selected.id}-${selected.priority}`}
                  >
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Assignee</span>
                  <input
                    name="assignedTo"
                    defaultValue={selected.assignedTo ?? ""}
                    placeholder="Unassigned"
                    key={`a-${selected.id}-${selected.assignedTo}`}
                  />
                </label>
                <label>
                  <span>Update author</span>
                  <input name="updateAuthor" defaultValue="TechSync Support" />
                </label>
                <label className="span-2 checkbox-label">
                  <input type="checkbox" name="isInternal" />
                  <span>Internal note (hidden from client)</span>
                </label>
                <label className="span-3">
                  <span>Add update</span>
                  <textarea
                    name="updateMessage"
                    rows={4}
                    placeholder="Status note for the client, or an internal note."
                  />
                </label>
              </div>

              {state?.error ? (
                <p className="form-error" role="alert">
                  {state.error}
                </p>
              ) : null}
              {state?.ok ? (
                <p className="form-success" role="status">
                  Ticket updated.
                </p>
              ) : null}

              <button
                className="btn btn--primary"
                type="submit"
                disabled={pending}
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
