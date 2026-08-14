import fs from "node:fs";
import path from "node:path";
import type { Connect, Plugin } from "vite";

const DATA_DIR = path.resolve("data");
const STATE_FILE = path.join(DATA_DIR, "shop.json");
const LOG_FILE = path.join(DATA_DIR, "integrations.jsonl");

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadStateFile(): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function saveStateFile(data: Record<string, unknown>) {
  ensureDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2));
}

function logEvent(event: Record<string, unknown>) {
  ensureDir();
  fs.appendFileSync(LOG_FILE, `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`);
}

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function send(res: Connect.ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function usersFromDisk(): Array<{ id: string; pin: string; name: string; role: string }> {
  const file = loadStateFile();
  const blob = file["goose-shop"] as { state?: { users?: Array<{ id: string; pin: string; name: string; role: string }> } } | undefined;
  return blob?.state?.users ?? [];
}

function punchesFromDisk(): Array<{ userId: string; kind: string; at: string }> {
  const file = loadStateFile();
  const blob = file["goose-shop"] as { state?: { timePunches?: Array<{ userId: string; kind: string; at: string }> } } | undefined;
  return blob?.state?.timePunches ?? [];
}

function payrollHours() {
  const punches = punchesFromDisk().slice().sort((a, b) => a.at.localeCompare(b.at));
  const byUser = new Map<string, typeof punches>();
  for (const punch of punches) {
    const list = byUser.get(punch.userId) ?? [];
    list.push(punch);
    byUser.set(punch.userId, list);
  }
  const users = usersFromDisk();
  return users.map((user) => {
    const list = byUser.get(user.id) ?? [];
    let total = 0;
    let start: number | null = null;
    for (const punch of list) {
      if (punch.kind === "in" || punch.kind === "break_end") start = new Date(punch.at).getTime();
      if ((punch.kind === "out" || punch.kind === "break_start") && start) {
        total += new Date(punch.at).getTime() - start;
        start = null;
      }
    }
    return { userId: user.id, name: user.name, role: user.role, hours: Math.round((total / 3600000) * 100) / 100 };
  });
}

function confirmation(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function attach(middlewares: Connect.Server) {
  middlewares.use(async (req, res, next) => {
    const rawUrl = req.url ?? "";
    if (!rawUrl.startsWith("/api/")) return next();
    const url = new URL(rawUrl, "http://localhost");
    const pathname = url.pathname;

    try {
      if (req.method === "GET" && pathname === "/api/health") {
        send(res, 200, { ok: true, store: fs.existsSync(STATE_FILE), integrations: "demo-adapters" });
        return;
      }

      if (req.method === "GET" && pathname === "/api/state") {
        const key = url.searchParams.get("k") ?? "goose-shop";
        const file = loadStateFile();
        send(res, 200, file[key] ?? null);
        return;
      }

      if (req.method === "PUT" && pathname === "/api/state") {
        const body = JSON.parse((await readBody(req)) || "{}") as { k?: string; value?: unknown };
        const key = body.k ?? "goose-shop";
        const file = loadStateFile();
        file[key] = body.value ?? null;
        saveStateFile(file);
        send(res, 200, { ok: true });
        return;
      }

      if (req.method === "DELETE" && pathname === "/api/state") {
        const key = url.searchParams.get("k") ?? "goose-shop";
        const file = loadStateFile();
        delete file[key];
        saveStateFile(file);
        send(res, 200, { ok: true });
        return;
      }

      if (req.method === "POST" && pathname === "/api/login") {
        const body = JSON.parse((await readBody(req)) || "{}") as { pin?: string; userId?: string };
        const users = usersFromDisk();
        const user = users.find((item) => item.pin === body.pin?.trim() || item.id === body.userId);
        if (!user) {
          send(res, 401, { ok: false, error: "Unknown PIN" });
          return;
        }
        const token = `goose.${user.id}.${Date.now()}`;
        logEvent({ kind: "login", userId: user.id });
        send(res, 200, { ok: true, userId: user.id, name: user.name, role: user.role, token });
        return;
      }

      if (req.method === "POST" && pathname.startsWith("/api/vendors/") && pathname.endsWith("/order")) {
        const vendor = pathname.split("/")[3] ?? "napa";
        const body = JSON.parse((await readBody(req)) || "{}") as { roId?: string; lines?: unknown[] };
        const conf = confirmation(vendor.slice(0, 4).toUpperCase());
        logEvent({ kind: "parts-order", vendor, roId: body.roId, lines: body.lines, confirmation: conf });
        send(res, 200, { ok: true, vendor, confirmation: conf, etaHours: vendor === "napa" ? 2 : 4 });
        return;
      }

      if (req.method === "POST" && pathname === "/api/pay") {
        const body = JSON.parse((await readBody(req)) || "{}") as { method?: string; amount?: number; roId?: string };
        const conf = confirmation("PAY");
        logEvent({ kind: "payment", ...body, confirmation: conf });
        send(res, 200, { ok: true, confirmation: conf, status: "paid" });
        return;
      }

      if (req.method === "POST" && (pathname === "/api/sms" || pathname === "/api/email")) {
        const channel = pathname.slice(5);
        const body = JSON.parse((await readBody(req)) || "{}") as { to?: string; body?: string; roId?: string };
        const conf = confirmation(channel.toUpperCase());
        logEvent({ kind: channel, ...body, confirmation: conf });
        send(res, 200, { ok: true, confirmation: conf, channel });
        return;
      }

      if (req.method === "POST" && pathname === "/api/finance") {
        const body = JSON.parse((await readBody(req)) || "{}") as { provider?: string; amount?: number; roId?: string };
        const conf = confirmation("FIN");
        logEvent({ kind: "finance", ...body, confirmation: conf });
        send(res, 200, { ok: true, confirmation: conf, status: "approved" });
        return;
      }

      if (req.method === "POST" && pathname === "/api/qb") {
        const body = JSON.parse((await readBody(req)) || "{}") as { invoices?: number };
        logEvent({ kind: "quickbooks", ...body });
        send(res, 200, { ok: true, invoicesExported: body.invoices ?? 0, lastSync: new Date().toISOString() });
        return;
      }

      if (req.method === "GET" && pathname === "/api/payroll") {
        const rows = payrollHours();
        logEvent({ kind: "payroll-export", rows: rows.length });
        send(res, 200, { ok: true, rows });
        return;
      }

      send(res, 404, { error: "Not found" });
    } catch (error) {
      send(res, 500, { error: error instanceof Error ? error.message : "API error" });
    }
  });
}

export function shopApiPlugin(): Plugin {
  return {
    name: "goose-shop-api",
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
}
