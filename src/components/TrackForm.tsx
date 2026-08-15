"use client";

import { useActionState } from "react";
import { trackTicketAction, type ActionResult } from "@/lib/actions";

const initial: ActionResult | null = null;

export function TrackForm({
  defaultTicketId = "",
  defaultEmail = "",
}: {
  defaultTicketId?: string;
  defaultEmail?: string;
}) {
  const [state, formAction, pending] = useActionState(
    trackTicketAction,
    initial,
  );

  return (
    <form action={formAction} className="ticket-form track-form">
      <div className="form-grid">
        <label>
          <span>Ticket ID</span>
          <input
            name="ticketId"
            required
            placeholder="TS-XXXXXX"
            defaultValue={defaultTicketId}
            autoCapitalize="characters"
          />
        </label>
        <label>
          <span>Email used on the ticket</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            autoComplete="email"
          />
        </label>
      </div>

      {state?.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? "Looking up…" : "Track ticket"}
      </button>
    </form>
  );
}
