import type { PersistStorage, StorageValue } from "zustand/middleware";

const KEY = "goose-shop";

export const apiStorage: PersistStorage<unknown> = {
  getItem: async (name) => {
    try {
      const res = await fetch(`/api/state?k=${encodeURIComponent(name)}`);
      if (res.ok) {
        const json = (await res.json()) as StorageValue<unknown> | null;
        if (json) return json;
      }
    } catch {
      /* fall through to localStorage */
    }
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      return JSON.parse(raw) as StorageValue<unknown>;
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    const body = JSON.stringify(value);
    try {
      localStorage.setItem(name, body);
    } catch {
      /* quota */
    }
    try {
      await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k: name, value }),
      });
    } catch {
      /* offline — localStorage already saved */
    }
  },
  removeItem: async (name) => {
    localStorage.removeItem(name);
    try {
      await fetch(`/api/state?k=${encodeURIComponent(name)}`, { method: "DELETE" });
    } catch {
      /* ignore */
    }
  },
};

export { KEY };
