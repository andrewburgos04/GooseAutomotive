"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitTicketAction, type ActionResult } from "@/lib/actions";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/lib/types";

const initial: ActionResult | null = null;

export function TicketForm() {
  const [state, formAction, pending] = useActionState(
    submitTicketAction,
    initial,
  );

  if (state?.ok && state.ticketId) {
    return (
      <div className="success-panel" role="status">
        <p className="eyebrow">Ticket created</p>
        <h2>We&apos;re on it.</h2>
        <p>
          Your reference ID is <strong>{state.ticketId}</strong>. Save it —
          you&apos;ll need it (plus your email) to track progress.
        </p>
        <div className="cta-row">
          <Link
            className="btn btn--primary"
            href={`/track/${state.ticketId}`}
          >
            View ticket
          </Link>
          <Link className="btn btn--ghost" href="/submit">
            Submit another
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="ticket-form">
      <div className="form-grid">
        <label>
          <span>Full name</span>
          <input name="requesterName" required autoComplete="name" />
        </label>
        <label>
          <span>Work email</span>
          <input
            name="requesterEmail"
            type="email"
            required
            autoComplete="email"
          />
        </label>
        <label className="span-2">
          <span>Company</span>
          <input name="company" required autoComplete="organization" />
        </label>
        <label>
          <span>Category</span>
          <select name="category" defaultValue="technical" required>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Priority</span>
          <select name="priority" defaultValue="medium" required>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="span-2">
          <span>Subject</span>
          <input
            name="subject"
            required
            maxLength={140}
            placeholder="Short summary of the issue"
          />
        </label>
        <label className="span-2">
          <span>Description</span>
          <textarea
            name="description"
            required
            rows={7}
            placeholder="What happened, when it started, and any error messages or systems involved."
          />
        </label>
      </div>

      {state?.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit ticket"}
      </button>
    </form>
  );
}
