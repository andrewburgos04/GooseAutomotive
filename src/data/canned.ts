import { SHOP_RATE } from "./seed";
import type { Job } from "../types";
import { uid } from "../lib/format";

export interface CannedJob {
  id: string;
  title: string;
  hours: number;
  parts: { name: string; qty: number; cost: number; price: number }[];
}

export const cannedJobs: CannedJob[] = [
  { id: "oil", title: "Synthetic oil change & filter", hours: 0.5, parts: [{ name: "Oil & filter kit", qty: 1, cost: 24, price: 58 }] },
  { id: "brakes-f", title: "Front brake pads & rotors", hours: 1.8, parts: [{ name: "Front pads & rotors", qty: 1, cost: 110, price: 268 }] },
  { id: "brakes-r", title: "Rear brake pads", hours: 1.2, parts: [{ name: "Rear pads", qty: 1, cost: 32, price: 84 }] },
  { id: "align", title: "Four-wheel alignment", hours: 1.0, parts: [] },
  { id: "battery", title: "Battery replacement", hours: 0.5, parts: [{ name: "AGM battery", qty: 1, cost: 118, price: 229 }] },
  { id: "cabin", title: "Cabin filter", hours: 0.3, parts: [{ name: "Cabin filter", qty: 1, cost: 8, price: 32 }] },
  { id: "diag", title: "Check engine diagnosis", hours: 1.0, parts: [] },
  { id: "ac", title: "A/C performance test & recharge", hours: 1.2, parts: [{ name: "Refrigerant", qty: 1, cost: 28, price: 89 }] },
];

export function cannedToJob(canned: CannedJob): Job {
  return {
    id: uid("job"),
    title: canned.title,
    concern: canned.title,
    authorized: null,
    labor: [
      {
        id: uid("lab"),
        description: canned.title,
        hours: canned.hours,
        rate: SHOP_RATE,
        techId: null,
        clockStartedAt: null,
        billedSeconds: 0,
      },
    ],
    parts: canned.parts.map((part) => ({
      id: uid("part"),
      name: part.name,
      qty: part.qty,
      cost: part.cost,
      price: part.price,
      status: "needed",
    })),
  };
}
