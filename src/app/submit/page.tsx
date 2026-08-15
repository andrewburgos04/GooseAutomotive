import type { Metadata } from "next";
import { TicketForm } from "@/components/TicketForm";

export const metadata: Metadata = {
  title: "Submit a ticket",
};

export default function SubmitPage() {
  return (
    <div className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Client portal</p>
        <h1>Submit a support ticket</h1>
        <p>
          Share enough context for us to reproduce or investigate quickly. You
          will receive a ticket ID to track progress.
        </p>
      </div>
      <div className="panel">
        <TicketForm />
      </div>
    </div>
  );
}
