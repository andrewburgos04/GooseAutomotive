import type { AppointmentStatus } from "@/data/types";

function slug(status: string): string {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status status-${slug(status)}`}>{status}</span>;
}

export function appointmentStatusClass(status: AppointmentStatus): string {
  return `status status-${slug(status)}`;
}
