import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PriorityBadge, StatusBadge } from "@/components/StatusBadge";
import { TrackForm } from "@/components/TrackForm";
import { getTicketById, getTicketForRequester } from "@/lib/tickets";
import { CATEGORY_LABELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ticket details",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function TicketTrackPage({
  params,
  searchParams,
}: PageProps<"/track/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const emailParam = query.email;
  const email = Array.isArray(emailParam) ? emailParam[0] : emailParam;

  const exists = await getTicketById(id);
  if (!exists) notFound();

  if (!email) {
    return (
      <div className="page-shell">
        <div className="page-intro">
          <p className="eyebrow">Verify access</p>
          <h1>Confirm your email for {exists.id}</h1>
          <p>
            For privacy, ticket details are only shown when the email matches
            the requester on file.
          </p>
        </div>
        <div className="panel" style={{ maxWidth: 560 }}>
          <TrackForm defaultTicketId={exists.id} />
        </div>
      </div>
    );
  }

  const ticket = await getTicketForRequester(id, email);
  if (!ticket) {
    return (
      <div className="page-shell">
        <div className="page-intro">
          <p className="eyebrow">Access denied</p>
          <h1>That email does not match this ticket</h1>
          <p>Try again with the email used when the ticket was submitted.</p>
        </div>
        <div className="panel" style={{ maxWidth: 560 }}>
          <TrackForm defaultTicketId={id} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Ticket {ticket.id}</p>
        <h1>{ticket.subject}</h1>
        <p>
          Opened {formatDate(ticket.createdAt)} · Last updated{" "}
          {formatDate(ticket.updatedAt)}
        </p>
      </div>

      <div className="panel ticket-detail">
        <div className="ticket-detail__meta">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="badge">{CATEGORY_LABELS[ticket.category]}</span>
          {ticket.assignedTo ? (
            <span className="badge">Assigned to {ticket.assignedTo}</span>
          ) : (
            <span className="badge">Awaiting assignment</span>
          )}
        </div>

        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}>
            Description
          </h2>
          <p className="preserve-breaks">{ticket.description}</p>
        </div>

        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}>
            Updates
          </h2>
          {ticket.updates.length === 0 ? (
            <p className="muted">No public updates yet. We will post here as work progresses.</p>
          ) : (
            <ol className="timeline">
              {ticket.updates
                .slice()
                .reverse()
                .map((update) => (
                  <li key={update.id}>
                    <div>
                      <strong>{update.author}</strong>
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

        <div className="cta-row">
          <Link className="btn btn--ghost" href="/track">
            Track another ticket
          </Link>
          <Link className="btn btn--primary" href="/submit">
            Submit a new ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
