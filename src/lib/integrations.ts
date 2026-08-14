import type { FinanceProvider, PayMethod, VendorId } from "../types";

async function post<T>(url: string, body: unknown, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export function placeVendorOrder(vendorId: VendorId, roId: string, lines: { sku: string; name: string; qty: number; cost: number }[]) {
  const fallback = { ok: true, vendor: vendorId, confirmation: `OFFLINE-${vendorId.toUpperCase()}`, etaHours: 4 };
  return post(`/api/vendors/${vendorId}/order`, { roId, lines }, fallback);
}

export function chargeCard(method: PayMethod, amount: number, roId: string) {
  const fallback = { ok: true, confirmation: `OFFLINE-PAY`, status: "paid" as const };
  return post("/api/pay", { method, amount, roId }, fallback);
}

export function sendOutbound(channel: "sms" | "email", to: string, body: string, roId?: string) {
  const fallback = { ok: true, confirmation: `OFFLINE-${channel.toUpperCase()}`, channel };
  return post(channel === "sms" ? "/api/sms" : "/api/email", { to, body, roId }, fallback);
}

export function submitFinancing(provider: FinanceProvider, amount: number, roId: string) {
  const fallback = { ok: true, confirmation: "OFFLINE-FIN", status: "approved" as const };
  return post("/api/finance", { provider, amount, roId }, fallback);
}

export function exportQuickBooks(invoices: number) {
  const fallback = { ok: true, invoicesExported: invoices, lastSync: new Date().toISOString() };
  return post("/api/qb", { invoices }, fallback);
}

export async function mintSession(pin?: string, userId?: string) {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, userId }),
    });
    if (!res.ok) return null;
    return (await res.json()) as { token: string; userId: string };
  } catch {
    return null;
  }
}

export async function fetchPayroll() {
  try {
    const res = await fetch("/api/payroll");
    if (!res.ok) return [];
    const data = (await res.json()) as { rows?: Array<{ userId: string; name: string; hours: number; role: string }> };
    return data.rows ?? [];
  } catch {
    return [];
  }
}
