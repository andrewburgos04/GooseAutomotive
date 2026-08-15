import type { TicketPriority, TicketStatus } from "@/lib/types";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/types";

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`badge badge--status badge--${status}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`badge badge--priority badge--prio-${priority}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
