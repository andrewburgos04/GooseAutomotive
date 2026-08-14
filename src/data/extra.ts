import type {
  Appointment,
  Campaign,
  FinancingApp,
  FleetAccount,
  InventoryItem,
  LaborGuideRow,
  Message,
  PartsOrder,
  Payment,
  TimePunch,
} from "../types";

const ago = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();
const ahead = (h: number) => new Date(Date.now() + h * 3600 * 1000).toISOString();

export const fleetAccounts: FleetAccount[] = [
  {
    id: "fa-hcp",
    company: "Hill Country Plumbing",
    accountNumber: "GSA-HCP-4410",
    billingEmail: "ap@hcplumbing.com",
    gsa: true,
    phone: "210-555-0170",
  },
];

export const timePunches: TimePunch[] = [
  { id: "tp1", userId: "u-marco", locationId: "bandera", kind: "in", at: ago(5.2) },
  { id: "tp2", userId: "u-sofia", locationId: "bandera", kind: "in", at: ago(5) },
  { id: "tp3", userId: "u-luis", locationId: "bandera", kind: "in", at: ago(4.8) },
  { id: "tp4", userId: "u-andi", locationId: "bandera", kind: "in", at: ago(5.5) },
];

export const appointments: Appointment[] = [
  { id: "ap1", locationId: "bandera", customerId: "c-tom", vehicleId: "v-tacoma", advisorId: "u-andi", start: ahead(1.5), durationMin: 60, concern: "A/C not cold", status: "booked", source: "online" },
  { id: "ap2", locationId: "bandera", customerId: "c-maria", vehicleId: "v-camry", advisorId: "u-andi", start: ago(2), durationMin: 90, concern: "Check engine + oil", status: "converted", source: "phone" },
  { id: "ap3", locationId: "bandera", customerId: "c-james", vehicleId: "v-crv", advisorId: "u-andi", start: ago(4), durationMin: 120, concern: "Brake grind", status: "converted", source: "walkin" },
  { id: "ap4", locationId: "west-ave", customerId: "c-priya", vehicleId: "v-bmw", advisorId: "u-arturo", start: ahead(3), durationMin: 90, concern: "Euro inspection", status: "booked", source: "online" },
  { id: "ap5", locationId: "bandera", customerId: "c-owen", vehicleId: "v-rav4", advisorId: "u-andi", start: ahead(24), durationMin: 45, concern: "First service follow-up", status: "booked", source: "phone" },
];

export const inventory: InventoryItem[] = [
  { id: "inv1", locationId: "bandera", sku: "OIL-5W30", name: "5W-30 synthetic (5 qt)", qty: 18, minQty: 8, cost: 22, price: 48, vendorId: "napa" },
  { id: "inv2", locationId: "bandera", sku: "PAD-F-CER", name: "Front ceramic pads", qty: 6, minQty: 4, cost: 38, price: 96, vendorId: "partstech" },
  { id: "inv3", locationId: "bandera", sku: "ROT-F-PR", name: "Front rotors (pair)", qty: 3, minQty: 2, cost: 72, price: 178, vendorId: "napa" },
  { id: "inv4", locationId: "bandera", sku: "BAT-51R", name: "Group 51R AGM battery", qty: 2, minQty: 2, cost: 118, price: 229, vendorId: "nexpart" },
  { id: "inv5", locationId: "bandera", sku: "CAB-TOY", name: "Cabin filter", qty: 11, minQty: 6, cost: 8, price: 32, vendorId: "local" },
  { id: "inv6", locationId: "bandera", sku: "ARM-LF-BMW", name: "Lemförder control arm", qty: 0, minQty: 1, cost: 164, price: 328, vendorId: "partstech" },
];

export const partsOrders: PartsOrder[] = [
  {
    id: "po1",
    roId: "ro-4824",
    vendorId: "napa",
    status: "submitted",
    createdAt: ago(1.2),
    confirmation: "NAPA-10441",
    lines: [{ sku: "ARM-LF-BMW", name: "Lemförder control arm", qty: 1, cost: 164 }],
  },
];

export const payments: Payment[] = [
  { id: "pay1", roId: "ro-4827", method: "card", amount: 136.5, status: "paid", at: ago(2.2), note: "Visa ending 4242" },
];

export const messages: Message[] = [
  { id: "m1", customerId: "c-james", roId: "ro-4822", channel: "sms", direction: "out", body: "James — Goose Bandera here. Front brakes are metal-to-metal. Estimate: https://shop.gooseautomotive.com/approve/ro-4822", at: ago(0.6) },
  { id: "m2", customerId: "c-james", roId: "ro-4822", channel: "sms", direction: "in", body: "On my way in 20. Do the fronts for sure.", at: ago(0.4) },
  { id: "m3", customerId: "c-fleet", roId: "ro-4823", channel: "email", direction: "out", body: "Fleet A-service + alignment authorized by phone. Unit HCP-14.", at: ago(4) },
];

export const financing: FinancingApp[] = [
  { id: "fn1", roId: "ro-4822", provider: "synchrony", amount: 938, status: "pending", at: ago(0.3) },
];

export const campaigns: Campaign[] = [
  { id: "camp1", type: "review", customerId: "c-owen", roId: "ro-4827", sentAt: ago(1.5), status: "opened" },
  { id: "camp2", type: "reminder", customerId: "c-renee", sentAt: ago(20), status: "sent" },
  { id: "camp3", type: "declined_followup", customerId: "c-james", roId: "ro-4822", sentAt: ago(0.2), status: "sent" },
];

export const laborGuide: LaborGuideRow[] = [
  { id: "lg-oil", name: "Synthetic oil change", cannedId: "oil", domesticHours: 0.5, importHours: 0.6, euroHours: 0.8 },
  { id: "lg-bf", name: "Front brake pads & rotors", cannedId: "brakes-f", domesticHours: 1.8, importHours: 2.0, euroHours: 2.4 },
  { id: "lg-br", name: "Rear brake pads", cannedId: "brakes-r", domesticHours: 1.2, importHours: 1.4, euroHours: 1.6 },
  { id: "lg-al", name: "Four-wheel alignment", cannedId: "align", domesticHours: 1.0, importHours: 1.0, euroHours: 1.2 },
  { id: "lg-bat", name: "Battery replacement", cannedId: "battery", domesticHours: 0.5, importHours: 0.5, euroHours: 0.7 },
  { id: "lg-ac", name: "A/C performance test", cannedId: "ac", domesticHours: 1.2, importHours: 1.3, euroHours: 1.5 },
  { id: "lg-diag", name: "Check engine diagnosis", cannedId: "diag", domesticHours: 1.0, importHours: 1.0, euroHours: 1.2 },
];
