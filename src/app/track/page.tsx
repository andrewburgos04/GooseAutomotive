import type { Metadata } from "next";
import { TrackForm } from "@/components/TrackForm";

export const metadata: Metadata = {
  title: "Track a ticket",
};

export default function TrackPage() {
  return (
    <div className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Client portal</p>
        <h1>Track a ticket</h1>
        <p>
          Enter the ticket ID from your confirmation and the email address used
          when the ticket was opened.
        </p>
      </div>
      <div className="panel" style={{ maxWidth: 560 }}>
        <TrackForm />
      </div>
    </div>
  );
}
