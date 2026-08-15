import { promises as fs } from "fs";
import path from "path";
import type {
  CreateTicketInput,
  Ticket,
  TicketUpdate,
  UpdateTicketInput,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tickets.json");

function generateTicketId(): string {
  const segment = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TS-${segment}`;
}

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    const seed = createSeedTickets();
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
}

function createSeedTickets(): Ticket[] {
  const now = Date.now();
  return [
    {
      id: "TS-A1B2C3",
      subject: "VPN connection drops during peak hours",
      description:
        "Our remote team loses VPN connectivity between 9–11 AM. Reconnecting works for a few minutes, then drops again.",
      status: "in_progress",
      priority: "high",
      category: "technical",
      requesterName: "Jordan Lee",
      requesterEmail: "jordan.lee@northline.io",
      company: "Northline Logistics",
      assignedTo: "Alex Rivera",
      updates: [
        {
          id: "upd-1",
          message:
            "Investigating gateway load balancer health checks. Will follow up within 4 hours.",
          author: "Alex Rivera",
          isInternal: false,
          createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
        },
      ],
      createdAt: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "TS-D4E5F6",
      subject: "Need billing contact updated for Q3",
      description:
        "Please update our invoice recipient to finance@harborcraft.com effective immediately.",
      status: "open",
      priority: "medium",
      category: "billing",
      requesterName: "Sam Okonkwo",
      requesterEmail: "sam.o@harborcraft.com",
      company: "Harborcraft Studios",
      assignedTo: null,
      updates: [],
      createdAt: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
    },
    {
      id: "TS-G7H8I9",
      subject: "SSO login fails for new hires",
      description:
        "Three new employees cannot complete SSO enrollment. Error code: AUTH_SYNC_TIMEOUT.",
      status: "waiting",
      priority: "urgent",
      category: "access",
      requesterName: "Priya Shah",
      requesterEmail: "priya.shah@vertexlabs.co",
      company: "Vertex Labs",
      assignedTo: "Morgan Chen",
      updates: [
        {
          id: "upd-2",
          message:
            "Please confirm whether the users were provisioned in your IdP before TechSync sync ran.",
          author: "Morgan Chen",
          isInternal: false,
          createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
        },
      ],
      createdAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    },
  ];
}

async function readTickets(): Promise<Ticket[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as Ticket[];
}

async function writeTickets(tickets: Ticket[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(tickets, null, 2), "utf8");
}

export async function listTickets(): Promise<Ticket[]> {
  const tickets = await readTickets();
  return tickets.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const tickets = await readTickets();
  return tickets.find((t) => t.id.toUpperCase() === id.toUpperCase()) ?? null;
}

export async function getTicketForRequester(
  id: string,
  email: string,
): Promise<Ticket | null> {
  const ticket = await getTicketById(id);
  if (!ticket) return null;
  if (ticket.requesterEmail.toLowerCase() !== email.toLowerCase()) return null;
  return {
    ...ticket,
    updates: ticket.updates.filter((u) => !u.isInternal),
  };
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const tickets = await readTickets();
  let id = generateTicketId();
  while (tickets.some((t) => t.id === id)) {
    id = generateTicketId();
  }

  const now = new Date().toISOString();
  const ticket: Ticket = {
    id,
    subject: input.subject.trim(),
    description: input.description.trim(),
    status: "open",
    priority: input.priority,
    category: input.category,
    requesterName: input.requesterName.trim(),
    requesterEmail: input.requesterEmail.trim().toLowerCase(),
    company: input.company.trim(),
    assignedTo: null,
    updates: [],
    createdAt: now,
    updatedAt: now,
  };

  tickets.push(ticket);
  await writeTickets(tickets);
  return ticket;
}

export async function updateTicket(
  id: string,
  input: UpdateTicketInput,
): Promise<Ticket | null> {
  const tickets = await readTickets();
  const index = tickets.findIndex(
    (t) => t.id.toUpperCase() === id.toUpperCase(),
  );
  if (index === -1) return null;

  const ticket = tickets[index];
  const now = new Date().toISOString();

  if (input.status) ticket.status = input.status;
  if (input.priority) ticket.priority = input.priority;
  if (input.assignedTo !== undefined) {
    ticket.assignedTo = input.assignedTo?.trim() || null;
  }

  if (input.updateMessage?.trim()) {
    const update: TicketUpdate = {
      id: `upd-${crypto.randomUUID().slice(0, 8)}`,
      message: input.updateMessage.trim(),
      author: input.updateAuthor?.trim() || "TechSync Support",
      isInternal: Boolean(input.isInternal),
      createdAt: now,
    };
    ticket.updates.push(update);
  }

  ticket.updatedAt = now;
  tickets[index] = ticket;
  await writeTickets(tickets);
  return ticket;
}

export function publicTicketView(ticket: Ticket): Ticket {
  return {
    ...ticket,
    updates: ticket.updates.filter((u) => !u.isInternal),
  };
}
