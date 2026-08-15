export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketCategory =
  | "general"
  | "technical"
  | "billing"
  | "access"
  | "feature"
  | "incident";

export interface TicketUpdate {
  id: string;
  message: string;
  author: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  requesterName: string;
  requesterEmail: string;
  company: string;
  assignedTo: string | null;
  updates: TicketUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  requesterName: string;
  requesterEmail: string;
  company: string;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string | null;
  updateMessage?: string;
  updateAuthor?: string;
  isInternal?: boolean;
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting: "Waiting on Client",
  resolved: "Resolved",
  closed: "Closed",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  general: "General Support",
  technical: "Technical Issue",
  billing: "Billing",
  access: "Access & Accounts",
  feature: "Feature Request",
  incident: "Incident",
};
