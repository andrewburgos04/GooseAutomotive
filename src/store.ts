import { create } from "zustand";
import { persist } from "zustand/middleware";
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
import { columnFor, uid } from "./lib/format";
import type {
  AuthMethod,
  Job,
  LocationId,
  Rating,
  RepairOrder,
  RoStatus,
  ShopState,
} from "./types";

interface Actions {
  login: (userId: string) => void;
  logout: () => void;
  setLocation: (id: LocationId) => void;
  resetDemo: () => void;
  setStatus: (roId: string, status: RoStatus) => void;
  setRating: (roId: string, itemId: string, rating: Rating, notes?: string) => void;
  startInspection: (roId: string, techId: string) => void;
  completeInspection: (roId: string) => void;
  toggleClock: (roId: string, laborId: string) => void;
  authorizeJobs: (roId: string, jobIds: string[], method: AuthMethod) => void;
  declineJob: (roId: string, jobId: string) => void;
  sendEstimate: (roId: string) => void;
  addNote: (roId: string, userId: string, body: string) => void;
  assignLaborTech: (roId: string, laborId: string, techId: string | null) => void;
  addCannedJob: (roId: string, job: Job) => void;
  createRO: (input: {
    customerId: string;
    vehicleId: string;
    advisorId: string;
    locationId: LocationId;
    concern: string;
    promiseTime: string;
  }) => string;
}

type Store = ShopState & Actions;

const seed = (): ShopState => ({
  version: STORE_VERSION,
  currentUserId: null,
  currentLocationId: defaultLocationId,
  locations,
  users,
  customers,
  vehicles,
  repairOrders: structuredClone(repairOrders),
});

export const useShop = create<Store>()(
  persist(
    (set, get) => ({
      ...seed(),
      login: (userId) => {
        const user = get().users.find((item) => item.id === userId);
        if (!user) return;
        set({ currentUserId: user.id, currentLocationId: user.locationId });
      },
      logout: () => set({ currentUserId: null }),
      setLocation: (id) => set({ currentLocationId: id }),
      resetDemo: () => set(seed()),
      setStatus: (roId, status) =>
        set({
          repairOrders: get().repairOrders.map((ro) => (ro.id === roId ? { ...ro, status } : ro)),
        }),
      setRating: (roId, itemId, rating, notes) =>
        set({
          repairOrders: get().repairOrders.map((ro) => {
            if (ro.id !== roId) return ro;
            return {
              ...ro,
              inspection: {
                ...ro.inspection,
                items: ro.inspection.items.map((item) =>
                  item.id === itemId ? { ...item, rating, notes: notes ?? item.notes } : item,
                ),
              },
            };
          }),
        }),
      startInspection: (roId, techId) =>
        set({
          repairOrders: get().repairOrders.map((ro) => {
            if (ro.id !== roId) return ro;
            return {
              ...ro,
              status: ro.status === "not_started" ? "inspecting" : ro.status,
              inspection: {
                ...ro.inspection,
                techId,
                startedAt: ro.inspection.startedAt ?? new Date().toISOString(),
              },
            };
          }),
        }),
      completeInspection: (roId) =>
        set({
          repairOrders: get().repairOrders.map((ro) => {
            if (ro.id !== roId) return ro;
            const nextStatus: RoStatus =
              columnFor(ro.status) === "estimates" && ro.jobs.length > 0 ? "requires_auth" : ro.status;
            return {
              ...ro,
              status: nextStatus === "inspecting" ? "requires_auth" : nextStatus,
              inspection: { ...ro.inspection, completedAt: new Date().toISOString() },
            };
          }),
        }),
      toggleClock: (roId, laborId) =>
        set({
          repairOrders: get().repairOrders.map((ro) => {
            if (ro.id !== roId) return ro;
            return {
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
            };
          }),
        }),
      authorizeJobs: (roId, jobIds, method) =>
        set({
          repairOrders: get().repairOrders.map((ro) => {
            if (ro.id !== roId) return ro;
            const jobs = ro.jobs.map((job) =>
              jobIds.includes(job.id) ? { ...job, authorized: true } : job.authorized ? job : { ...job, authorized: job.authorized },
            );
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
          repairOrders: get().repairOrders.map((ro) => {
            if (ro.id !== roId) return ro;
            return {
              ...ro,
              jobs: ro.jobs.map((job) => (job.id === jobId ? { ...job, authorized: false } : job)),
            };
          }),
        }),
      sendEstimate: (roId) =>
        set({
          repairOrders: get().repairOrders.map((ro) =>
            ro.id === roId ? { ...ro, estimateSentAt: new Date().toISOString(), status: "pending_auth" } : ro,
          ),
        }),
      addNote: (roId, userId, body) =>
        set({
          repairOrders: get().repairOrders.map((ro) =>
            ro.id === roId
              ? { ...ro, notes: [...ro.notes, { id: uid("n"), at: new Date().toISOString(), userId, body }] }
              : ro,
          ),
        }),
      assignLaborTech: (roId, laborId, techId) =>
        set({
          repairOrders: get().repairOrders.map((ro) => {
            if (ro.id !== roId) return ro;
            return {
              ...ro,
              jobs: ro.jobs.map((job) => ({
                ...job,
                labor: job.labor.map((line) => (line.id === laborId ? { ...line, techId } : line)),
              })),
            };
          }),
        }),
      addCannedJob: (roId, job) =>
        set({
          repairOrders: get().repairOrders.map((ro) => (ro.id === roId ? { ...ro, jobs: [...ro.jobs, job] } : ro)),
        }),
      createRO: ({ customerId, vehicleId, advisorId, locationId, concern, promiseTime }) => {
        const id = uid("ro");
        const number = `GO-${4800 + get().repairOrders.length + 1}`;
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
          inspection: {
            roId: id,
            techId: null,
            startedAt: null,
            completedAt: null,
            items: makeInspectionItems(),
          },
          notes: [],
        };
        set({ repairOrders: [ro, ...get().repairOrders] });
        return id;
      },
    }),
    {
      name: "goose-shop",
      version: STORE_VERSION,
      migrate: () => seed(),
    },
  ),
);

export function useCurrentUser() {
  return useShop((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);
}
