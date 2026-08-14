import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiStorage } from "./lib/apiStorage";
import { cannedJobs, cannedToJob, FINDING_TO_CANNED } from "./data/canned";
import {
  appointments,
  campaigns,
  financing,
  fleetAccounts,
  inventory,
  laborGuide,
  messages,
  partsOrders,
  payments,
  timePunches,
} from "./data/extra";
import {
  customers,
  defaultLocationId,
  locations,
  makeInspectionItems,
  repairOrders,
  STORE_VERSION,
  users,
  vehicles,
} from "./data/seed";
import { uid } from "./lib/format";
import { chargeCard, exportQuickBooks, mintSession, placeVendorOrder, sendOutbound, submitFinancing } from "./lib/integrations";
import { partsMarkup } from "./lib/media";
import type {
  Appointment,
  AuthMethod,
  Campaign,
  ClockKind,
  FinanceProvider,
  Job,
  LocationId,
  PayMethod,
  Rating,
  RepairOrder,
  RoLabel,
  RoStatus,
  ShopState,
  Signature,
  VendorId,
} from "./types";

interface Actions {
  login: (userId: string) => void;
  loginWithPin: (pin: string) => boolean;
  logout: () => void;
  setLocation: (id: LocationId) => void;
  resetDemo: () => void;
  setStatus: (roId: string, status: RoStatus) => void;
  setRating: (roId: string, itemId: string, rating: Rating, notes?: string) => void;
  addPhoto: (roId: string, itemId: string, dataUrl: string) => void;
  addJobFromFinding: (roId: string, itemId: string) => void;
  startInspection: (roId: string, techId: string) => void;
  completeInspection: (roId: string) => void;
  toggleClock: (roId: string, laborId: string) => void;
  punch: (kind: ClockKind) => void;
  authorizeJobs: (roId: string, jobIds: string[], method: AuthMethod) => void;
  declineJob: (roId: string, jobId: string) => void;
  sendEstimate: (roId: string, channel?: "sms" | "email") => void;
  addNote: (roId: string, userId: string, body: string) => void;
  assignLaborTech: (roId: string, laborId: string, techId: string | null) => void;
  addCannedJob: (roId: string, job: Job) => void;
  toggleLabel: (roId: string, label: RoLabel) => void;
  saveSignature: (roId: string, signature: Signature) => void;
  createRO: (input: {
    customerId: string;
    vehicleId: string;
    advisorId: string;
    locationId: LocationId;
    concern: string;
    promiseTime: string;
  }) => string;
  createAppointment: (input: Omit<Appointment, "id">) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  applyVinDecode: (vehicleId: string, decoded: VehicleDecode) => void;
  updateMileage: (vehicleId: string, mileage: number) => void;
  orderParts: (roId: string, vendorId: VendorId, lines: { sku: string; name: string; qty: number; cost: number }[]) => void;
  receiveParts: (orderId: string) => void;
  adjustInventory: (id: string, qty: number) => void;
  takePayment: (roId: string, method: PayMethod, amount: number, note?: string) => void;
  sendMessage: (customerId: string, roId: string | undefined, channel: "sms" | "email", body: string) => void;
  applyFinancing: (roId: string, provider: FinanceProvider, amount: number) => void;
  sendCampaign: (type: Campaign["type"], customerId: string, roId?: string) => void;
  receiveMessage: (customerId: string, roId: string | undefined, channel: "sms" | "email", body: string) => void;
  syncQuickBooks: () => void;
  setLaborRate: (key: keyof ShopState["laborMatrix"], value: number) => void;
  setPartsMarkup: (key: keyof ShopState["partsMatrix"], value: number) => void;
}

type VehicleDecode = { year?: number; make?: string; model?: string; body?: string; engine?: string; drive?: string };

type Store = ShopState & Actions;

const seed = (): ShopState => ({
  version: STORE_VERSION,
  currentUserId: null,
  currentLocationId: defaultLocationId,
  sessionToken: null,
  locations,
  users,
  customers,
  vehicles,
  repairOrders: structuredClone(repairOrders),
  timePunches: structuredClone(timePunches),
  appointments: structuredClone(appointments),
  fleetAccounts: structuredClone(fleetAccounts),
  inventory: structuredClone(inventory),
  partsOrders: structuredClone(partsOrders),
  payments: structuredClone(payments),
  messages: structuredClone(messages),
  financing: structuredClone(financing),
  campaigns: structuredClone(campaigns),
  laborGuide: structuredClone(laborGuide),
  laborMatrix: { domestic: 145, import: 155, euro: 175, diesel: 165 },
  partsMatrix: { under20: 2.5, under50: 2, under150: 1.75, over: 1.5 },
  qb: { lastSync: null, invoicesExported: 0, status: "idle" },
});

function mapRO(list: RepairOrder[], id: string, fn: (ro: RepairOrder) => RepairOrder) {
  return list.map((ro) => (ro.id === id ? fn(ro) : ro));
}

export const useShop = create<Store>()(
  persist(
    (set, get) => ({
      ...seed(),
      login: (userId) => {
        const user = get().users.find((item) => item.id === userId);
        if (!user) return;
        const token = `sess-${user.id}-${Date.now()}`;
        try {
          sessionStorage.setItem("goose-user", user.id);
          sessionStorage.setItem("goose-token", token);
          sessionStorage.setItem("goose-location", user.locationId);
        } catch {
          /* private mode */
        }
        set({ currentUserId: user.id, currentLocationId: user.locationId, sessionToken: token });
        void mintSession(user.pin, user.id).then((session) => {
          if (!session?.token) return;
          try {
            sessionStorage.setItem("goose-token", session.token);
          } catch {
            /* ignore */
          }
          set({ sessionToken: session.token });
        });
      },
      loginWithPin: (pin) => {
        const user = get().users.find((item) => item.pin === pin.trim());
        if (!user) return false;
        get().login(user.id);
        return true;
      },
      logout: () => {
        try {
          sessionStorage.removeItem("goose-user");
          sessionStorage.removeItem("goose-token");
        } catch {
          /* ignore */
        }
        set({ currentUserId: null, sessionToken: null });
      },
      setLocation: (id) => {
        try {
          sessionStorage.setItem("goose-location", id);
        } catch {
          /* ignore */
        }
        set({ currentLocationId: id });
      },
      resetDemo: () => {
        const { currentUserId, currentLocationId, sessionToken } = get();
        set({ ...seed(), currentUserId, currentLocationId, sessionToken });
      },
      setStatus: (roId, status) => set({ repairOrders: mapRO(get().repairOrders, roId, (ro) => ({ ...ro, status })) }),
      setRating: (roId, itemId, rating, notes) =>
        set({
          repairOrders: mapRO(get().repairOrders, roId, (ro) => ({
            ...ro,
            inspection: {
              ...ro.inspection,
              items: ro.inspection.items.map((item) =>
                item.id === itemId ? { ...item, rating, notes: notes ?? item.notes } : item,
              ),
            },
          })),
        }),
      addPhoto: (roId, itemId, dataUrl) =>
        set({
          repairOrders: mapRO(get().repairOrders, roId, (ro) => ({
            ...ro,
            inspection: {
              ...ro.inspection,
              items: ro.inspection.items.map((item) =>
                item.id === itemId ? { ...item, photos: [...item.photos, dataUrl].slice(0, 3) } : item,
              ),
            },
          })),
        }),
      addJobFromFinding: (roId, itemId) => {
        const ro = get().repairOrders.find((item) => item.id === roId);
        const finding = ro?.inspection.items.find((item) => item.id === itemId);
        if (!ro || !finding) return;
        const cannedId = FINDING_TO_CANNED[finding.name];
        const canned = cannedJobs.find((job) => job.id === cannedId) ?? cannedJobs.find((job) => job.id === "diag") ?? cannedJobs[0];
        if (ro.jobs.some((job) => job.sourceFindingId === itemId)) return;
        const vehicle = get().vehicles.find((v) => v.id === ro.vehicleId);
        const euro = vehicle && ["BMW", "Mercedes", "Audi", "Porsche", "MINI", "Volkswagen"].includes(vehicle.make);
        const rate = euro ? get().laborMatrix.euro : get().laborMatrix.domestic;
        const guide = get().laborGuide.find((row) => row.cannedId === canned.id);
        const hours = guide ? (euro ? guide.euroHours : guide.domesticHours) : canned.hours;
        const job = cannedToJob({
          ...canned,
          hours,
          parts: canned.parts.map((part) => ({ ...part, price: Math.round(partsMarkup(part.cost, get().partsMatrix) * 100) / 100 })),
        });
        job.concern = finding.notes || finding.name;
        job.sourceFindingId = itemId;
        job.labor = job.labor.map((line) => ({ ...line, hours, rate }));
        get().addCannedJob(roId, job);
      },
      startInspection: (roId, techId) =>
        set({
          repairOrders: mapRO(get().repairOrders, roId, (ro) => ({
            ...ro,
            status: ro.status === "not_started" ? "inspecting" : ro.status,
            inspection: { ...ro.inspection, techId, startedAt: ro.inspection.startedAt ?? new Date().toISOString() },
          })),
        }),
      completeInspection: (roId) =>
        set({
          repairOrders: mapRO(get().repairOrders, roId, (ro) => ({
            ...ro,
            status: ro.status === "inspecting" || ro.status === "not_started" ? "requires_auth" : ro.status,
            inspection: { ...ro.inspection, completedAt: new Date().toISOString() },
          })),
        }),
      toggleClock: (roId, laborId) =>
        set({
          repairOrders: mapRO(get().repairOrders, roId, (ro) => ({
            ...ro,
            jobs: ro.jobs.map((job) => ({
              ...job,
              labor: job.labor.map((line) => {
                if (line.id !== laborId) {
                  if (line.clockStartedAt) {
                    const extra = Math.floor((Date.now() - new Date(line.clockStartedAt).getTime()) / 1000);
                    return { ...line, clockStartedAt: null, billedSeconds: line.billedSeconds + extra };
                  }
                  return line;
                }
                if (line.clockStartedAt) {
                  const extra = Math.floor((Date.now() - new Date(line.clockStartedAt).getTime()) / 1000);
                  return { ...line, clockStartedAt: null, billedSeconds: line.billedSeconds + extra };
                }
                return { ...line, clockStartedAt: new Date().toISOString() };
              }),
            })),
          })),
        }),
      punch: (kind) => {
        const user = get().users.find((u) => u.id === get().currentUserId);
        if (!user) return;
        set({
          timePunches: [
            ...get().timePunches,
            { id: uid("tp"), userId: user.id, locationId: get().currentLocationId, kind, at: new Date().toISOString() },
          ],
        });
      },
      authorizeJobs: (roId, jobIds, method) =>
        set({
          repairOrders: mapRO(get().repairOrders, roId, (ro) => {
            const jobs = ro.jobs.map((job) => (jobIds.includes(job.id) ? { ...job, authorized: true } : job));
            const anyAuth = jobs.some((job) => job.authorized);
            return {
              ...ro,
              jobs,
              authorizedAt: anyAuth ? new Date().toISOString() : ro.authorizedAt,
              authMethod: anyAuth ? method : ro.authMethod,
              status: anyAuth ? "in_progress" : ro.status,
            };
          }),
        }),
      declineJob: (roId, jobId) =>
        set({
          repairOrders: mapRO(get().repairOrders, roId, (ro) => ({
            ...ro,
            jobs: ro.jobs.map((job) => (job.id === jobId ? { ...job, authorized: false } : job)),
          })),
        }),
      sendEstimate: (roId, channel = "sms") => {
        const ro = get().repairOrders.find((item) => item.id === roId);
        if (!ro) return;
        const customer = get().customers.find((c) => c.id === ro.customerId);
        const shop = get().locations.find((l) => l.id === ro.locationId);
        const body = `${customer?.name?.split(" ")[0] ?? "Hi"} — Goose ${shop?.name} sent estimate ${ro.number}. Review & approve: /approve/${ro.id}`;
        set({
          repairOrders: mapRO(get().repairOrders, roId, (item) => ({
            ...item,
            estimateSentAt: new Date().toISOString(),
            status: "pending_auth",
          })),
          messages: [
            ...get().messages,
            {
              id: uid("msg"),
              customerId: ro.customerId,
              roId,
              channel,
              direction: "out",
              body,
              at: new Date().toISOString(),
            },
          ],
        });
        void sendOutbound(channel, channel === "sms" ? customer?.phone ?? "" : customer?.email ?? "", body, roId);
      },
      addNote: (roId, userId, body) =>
        set({
          repairOrders: mapRO(get().repairOrders, roId, (ro) => ({
            ...ro,
            notes: [...ro.notes, { id: uid("n"), at: new Date().toISOString(), userId, body }],
          })),
        }),
      assignLaborTech: (roId, laborId, techId) =>
        set({
          repairOrders: mapRO(get().repairOrders, roId, (ro) => ({
            ...ro,
            jobs: ro.jobs.map((job) => ({
              ...job,
              labor: job.labor.map((line) => (line.id === laborId ? { ...line, techId } : line)),
            })),
          })),
        }),
      addCannedJob: (roId, job) => set({ repairOrders: mapRO(get().repairOrders, roId, (ro) => ({ ...ro, jobs: [...ro.jobs, job] })) }),
      toggleLabel: (roId, label) =>
        set({
          repairOrders: mapRO(get().repairOrders, roId, (ro) => ({
            ...ro,
            labels: ro.labels.includes(label) ? ro.labels.filter((item) => item !== label) : [...ro.labels, label],
          })),
        }),
      saveSignature: (roId, signature) => set({ repairOrders: mapRO(get().repairOrders, roId, (ro) => ({ ...ro, signature })) }),
      createRO: ({ customerId, vehicleId, advisorId, locationId, concern, promiseTime }) => {
        const id = uid("ro");
        const number = `GO-${4800 + get().repairOrders.length + 1}`;
        const customer = get().customers.find((c) => c.id === customerId);
        const vehicle = get().vehicles.find((v) => v.id === vehicleId);
        const labels: RoLabel[] = [];
        if (customer?.fleet) labels.push("fleet");
        if (vehicle && ["BMW", "Mercedes", "Audi", "Porsche"].includes(vehicle.make)) labels.push("euro");
        const ro: RepairOrder = {
          id,
          number,
          locationId,
          customerId,
          vehicleId,
          advisorId,
          status: "not_started",
          concern,
          promiseTime,
          createdAt: new Date().toISOString(),
          estimateSentAt: null,
          authorizedAt: null,
          authMethod: null,
          jobs: [],
          inspection: { roId: id, techId: null, startedAt: null, completedAt: null, items: makeInspectionItems() },
          notes: [],
          labels,
          signature: null,
          paidAmount: 0,
        };
        set({ repairOrders: [ro, ...get().repairOrders] });
        return id;
      },
      createAppointment: (input) => set({ appointments: [...get().appointments, { ...input, id: uid("ap") }] }),
      updateAppointment: (id, patch) =>
        set({ appointments: get().appointments.map((item) => (item.id === id ? { ...item, ...patch } : item)) }),
      applyVinDecode: (vehicleId, decoded) =>
        set({
          vehicles: get().vehicles.map((vehicle) =>
            vehicle.id === vehicleId
              ? {
                  ...vehicle,
                  year: decoded.year || vehicle.year,
                  make: decoded.make || vehicle.make,
                  model: decoded.model || vehicle.model,
                  decoded: { body: decoded.body, engine: decoded.engine, drive: decoded.drive },
                }
              : vehicle,
          ),
        }),
      updateMileage: (vehicleId, mileage) =>
        set({ vehicles: get().vehicles.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, mileage } : vehicle)) }),
      orderParts: (roId, vendorId, lines) => {
        void placeVendorOrder(vendorId, roId, lines).then((result) => {
          const order = {
            id: uid("po"),
            roId,
            vendorId,
            status: "submitted" as const,
            createdAt: new Date().toISOString(),
            confirmation: result.confirmation,
            lines,
          };
          set({
            partsOrders: [...get().partsOrders, order],
            repairOrders: mapRO(get().repairOrders, roId, (ro) => ({
              ...ro,
              status: "waiting_parts",
              labels: ro.labels.includes("waiting_parts") ? ro.labels : [...ro.labels, "waiting_parts"],
              jobs: ro.jobs.map((job) => ({
                ...job,
                parts: job.parts.map((part) =>
                  lines.some((line) => line.name === part.name) ? { ...part, status: "ordered", vendorId } : part,
                ),
              })),
            })),
          });
        });
      },
      receiveParts: (orderId) => {
        const order = get().partsOrders.find((item) => item.id === orderId);
        if (!order) return;
        set({
          partsOrders: get().partsOrders.map((item) => (item.id === orderId ? { ...item, status: "received" } : item)),
          inventory: get().inventory.map((item) => {
            const line = order.lines.find((row) => row.sku === item.sku);
            return line ? { ...item, qty: item.qty + line.qty } : item;
          }),
          repairOrders: mapRO(get().repairOrders, order.roId, (ro) => ({
            ...ro,
            status: ro.status === "waiting_parts" ? "in_progress" : ro.status,
            labels: ro.labels.filter((label) => label !== "waiting_parts"),
            jobs: ro.jobs.map((job) => ({
              ...job,
              parts: job.parts.map((part) => (part.status === "ordered" ? { ...part, status: "in_stock" } : part)),
            })),
          })),
        });
      },
      adjustInventory: (id, qty) =>
        set({ inventory: get().inventory.map((item) => (item.id === id ? { ...item, qty } : item)) }),
      takePayment: (roId, method, amount, note) => {
        void chargeCard(method, amount, roId).then((result) => {
          const payment = {
            id: uid("pay"),
            roId,
            method,
            amount,
            status: "paid" as const,
            at: new Date().toISOString(),
            note,
            confirmation: result.confirmation,
          };
          const ro = get().repairOrders.find((item) => item.id === roId);
          const paid = (ro?.paidAmount ?? 0) + amount;
          set({
            payments: [...get().payments, payment],
            repairOrders: mapRO(get().repairOrders, roId, (item) => ({
              ...item,
              paidAmount: paid,
              status: "posted",
            })),
            qb: { ...get().qb, invoicesExported: get().qb.invoicesExported + 1 },
          });
        });
      },
      sendMessage: (customerId, roId, channel, body) => {
        set({
          messages: [
            ...get().messages,
            { id: uid("msg"), customerId, roId, channel, direction: "out", body, at: new Date().toISOString() },
          ],
        });
        const customer = get().customers.find((item) => item.id === customerId);
        void sendOutbound(channel, channel === "sms" ? customer?.phone ?? "" : customer?.email ?? "", body, roId);
      },
      receiveMessage: (customerId, roId, channel, body) =>
        set({
          messages: [
            ...get().messages,
            { id: uid("msg"), customerId, roId, channel, direction: "in", body, at: new Date().toISOString() },
          ],
        }),
      applyFinancing: (roId, provider, amount) => {
        void submitFinancing(provider, amount, roId).then((result) => {
          set({
            financing: [
              ...get().financing,
              {
                id: uid("fn"),
                roId,
                provider,
                amount,
                status: "approved",
                at: new Date().toISOString(),
                confirmation: result.confirmation,
              },
            ],
          });
          get().takePayment(roId, "financing", amount, `${provider} ${result.confirmation}`);
        });
      },
      sendCampaign: (type, customerId, roId) =>
        set({
          campaigns: [
            ...get().campaigns,
            { id: uid("camp"), type, customerId, roId, sentAt: new Date().toISOString(), status: "sent" },
          ],
        }),
      syncQuickBooks: () => {
        const invoices = get().repairOrders.filter((ro) => ro.status === "posted").length;
        void exportQuickBooks(invoices).then((result) => {
          set({
            qb: {
              lastSync: result.lastSync,
              invoicesExported: result.invoicesExported,
              status: "synced",
            },
          });
        });
      },
      setLaborRate: (key, value) => set({ laborMatrix: { ...get().laborMatrix, [key]: value } }),
      setPartsMarkup: (key, value) => set({ partsMatrix: { ...get().partsMatrix, [key]: value } }),
    }),
    {
      name: "goose-shop",
      version: STORE_VERSION,
      migrate: () => seed(),
      storage: apiStorage,
      partialize: (state) => ({
        version: state.version,
        locations: state.locations,
        users: state.users,
        customers: state.customers,
        vehicles: state.vehicles,
        repairOrders: state.repairOrders,
        timePunches: state.timePunches,
        appointments: state.appointments,
        fleetAccounts: state.fleetAccounts,
        inventory: state.inventory,
        partsOrders: state.partsOrders,
        payments: state.payments,
        messages: state.messages,
        financing: state.financing,
        campaigns: state.campaigns,
        laborGuide: state.laborGuide,
        laborMatrix: state.laborMatrix,
        partsMatrix: state.partsMatrix,
        qb: state.qb,
      }),
      onRehydrateStorage: () => (state) => {
        try {
          const userId = sessionStorage.getItem("goose-user");
          const token = sessionStorage.getItem("goose-token");
          const loc = sessionStorage.getItem("goose-location");
          if (state && userId) {
            state.currentUserId = userId;
            state.sessionToken = token;
            if (loc) state.currentLocationId = loc as LocationId;
          }
        } catch {
          /* private mode */
        }
      },
    },
  ),
);

export function useCurrentUser() {
  return useShop((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);
}
