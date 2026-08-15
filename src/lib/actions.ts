"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  getAdminPassword,
  isAdminAuthenticated,
  setAdminSession,
} from "./auth";
import { createTicket, getTicketForRequester, updateTicket } from "./tickets";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "./types";

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export type ActionResult = {
  ok: boolean;
  error?: string;
  ticketId?: string;
};

export async function submitTicketAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const subject = asString(formData.get("subject"));
  const description = asString(formData.get("description"));
  const requesterName = asString(formData.get("requesterName"));
  const requesterEmail = asString(formData.get("requesterEmail"));
  const company = asString(formData.get("company"));
  const priority = asString(formData.get("priority")) as TicketPriority;
  const category = asString(formData.get("category")) as TicketCategory;

  if (
    !subject ||
    !description ||
    !requesterName ||
    !requesterEmail ||
    !company
  ) {
    return { ok: false, error: "Please complete all required fields." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const validPriorities = ["low", "medium", "high", "urgent"];
  const validCategories = [
    "general",
    "technical",
    "billing",
    "access",
    "feature",
    "incident",
  ];

  if (!validPriorities.includes(priority)) {
    return { ok: false, error: "Select a valid priority." };
  }
  if (!validCategories.includes(category)) {
    return { ok: false, error: "Select a valid category." };
  }

  const ticket = await createTicket({
    subject,
    description,
    requesterName,
    requesterEmail,
    company,
    priority,
    category,
  });

  revalidatePath("/admin");
  revalidatePath("/track");
  return { ok: true, ticketId: ticket.id };
}

export async function trackTicketAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ticketId = asString(formData.get("ticketId")).trim().toUpperCase();
  const email = asString(formData.get("email")).trim();

  if (!ticketId || !email) {
    return { ok: false, error: "Ticket ID and email are required." };
  }

  const ticket = await getTicketForRequester(ticketId, email);
  if (!ticket) {
    return {
      ok: false,
      error: "No ticket found for that ID and email combination.",
    };
  }

  redirect(`/track/${ticket.id}?email=${encodeURIComponent(email)}`);
}

export async function adminLoginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const password = asString(formData.get("password"));
  if (password !== getAdminPassword()) {
    return { ok: false, error: "Incorrect password." };
  }
  await setAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateTicketAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "Unauthorized." };
  }

  const id = asString(formData.get("ticketId"));
  const status = asString(formData.get("status")) as TicketStatus;
  const priority = asString(formData.get("priority")) as TicketPriority;
  const assignedTo = asString(formData.get("assignedTo"));
  const updateMessage = asString(formData.get("updateMessage"));
  const updateAuthor = asString(formData.get("updateAuthor")) || "TechSync Support";
  const isInternal = asString(formData.get("isInternal")) === "on";

  if (!id) return { ok: false, error: "Missing ticket ID." };

  const updated = await updateTicket(id, {
    status: status || undefined,
    priority: priority || undefined,
    assignedTo,
    updateMessage: updateMessage || undefined,
    updateAuthor,
    isInternal,
  });

  if (!updated) return { ok: false, error: "Ticket not found." };

  revalidatePath("/admin");
  revalidatePath(`/track/${id}`);
  return { ok: true, ticketId: updated.id };
}
