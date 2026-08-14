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
  { id: "wipers", title: "Wiper blade replacement", hours: 0.2, parts: [{ name: "Wiper blades (pair)", qty: 1, cost: 12, price: 38 }] },
  { id: "brake-fluid", title: "Brake fluid flush", hours: 0.8, parts: [{ name: "DOT 4 fluid", qty: 1, cost: 9, price: 29 }] },
  { id: "coolant", title: "Coolant service", hours: 1.0, parts: [{ name: "Coolant", qty: 1, cost: 18, price: 54 }] },
];

export const FINDING_TO_CANNED: Record<string, string> = {
  "Front brake pads / rotors": "brakes-f",
  "Rear brake pads / rotors": "brakes-r",
  "Engine oil level / condition": "oil",
  "Battery & cables": "battery",
  "Cabin filter": "cabin",
  "Left front tire": "align",
  "Right front tire": "align",
  "Wiper blades": "wipers",
  "Brake fluid": "brake-fluid",
  "Coolant": "coolant",
  "Battery charging output": "battery",
  "Visible engine leaks": "diag",
  "Test drive notes": "diag",
  "Front suspension": "align",
};

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
