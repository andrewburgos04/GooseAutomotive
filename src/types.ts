export type Role = "manager" | "advisor" | "tech";

export type LocationId =
  | "bandera"
  | "west-ave"
  | "colorado"
  | "rigsby"
  | "rubens"
  | "hill-country"
  | "universal-city"
  | "castroville"
  | "missouri-city";

export type Rating = "ok" | "recommend" | "urgent" | "na" | null;
export type BoardColumn = "estimates" | "wip" | "completed";
export type RoStatus =
  | "not_started"
  | "inspecting"
  | "requires_auth"
  | "pending_auth"
  | "in_progress"
  | "waiting_parts"
  | "qc"
  | "ready"
  | "posted";
export type AuthMethod = "in_person" | "phone" | "text" | "email";
export type PartStatus = "needed" | "ordered" | "in_stock" | "installed";
export type RoLabel = "waiting_parts" | "customer_waiting" | "come_back" | "warranty" | "fleet" | "euro";
export type ClockKind = "in" | "out" | "break_start" | "break_end";
export type VendorId = "napa" | "partstech" | "nexpart" | "local";
export type PayMethod = "card" | "text" | "apple" | "google" | "cash" | "financing";
export type FinanceProvider = "synchrony" | "aff" | "easypay";

export interface ShopLocation {
  id: LocationId;
  name: string;
  address: string;
  city: string;
  phone: string;
  specialty?: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  locationId: LocationId;
  title: string;
  pin: string;
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  fleet?: boolean;
  company?: string;
  fleetAccountId?: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  year: number;
  make: string;
  model: string;
  vin: string;
  plate: string;
  mileage: number;
  color: string;
  unitNumber?: string;
  decoded?: { body?: string; engine?: string; drive?: string };
}

export interface InspectionItem {
  id: string;
  category: string;
  name: string;
  rating: Rating;
  notes: string;
  photos: string[];
}

export interface Inspection {
  roId: string;
  techId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  items: InspectionItem[];
}

export interface PartLine {
  id: string;
  name: string;
  qty: number;
  cost: number;
  price: number;
  status: PartStatus;
  sku?: string;
  vendorId?: VendorId;
}

export interface LaborLine {
  id: string;
  description: string;
  hours: number;
  rate: number;
  techId: string | null;
  clockStartedAt: string | null;
  billedSeconds: number;
}

export interface Job {
  id: string;
  title: string;
  concern: string;
  authorized: boolean | null;
  declinedReason?: string;
  sourceFindingId?: string;
  labor: LaborLine[];
  parts: PartLine[];
}

export interface Note {
  id: string;
  at: string;
  userId: string;
  body: string;
}

export interface Signature {
  name: string;
  dataUrl: string;
  at: string;
}

export interface RepairOrder {
  id: string;
  number: string;
  locationId: LocationId;
  customerId: string;
  vehicleId: string;
  advisorId: string;
  status: RoStatus;
  concern: string;
  promiseTime: string;
  createdAt: string;
  estimateSentAt: string | null;
  authorizedAt: string | null;
  authMethod: AuthMethod | null;
  jobs: Job[];
  inspection: Inspection;
  notes: Note[];
  labels: RoLabel[];
  signature: Signature | null;
  paidAmount: number;
}

export interface TimePunch {
  id: string;
  userId: string;
  locationId: LocationId;
  kind: ClockKind;
  at: string;
}

export interface Appointment {
  id: string;
  locationId: LocationId;
  customerId: string;
  vehicleId: string;
  advisorId: string;
  start: string;
  durationMin: number;
  concern: string;
  status: "booked" | "arrived" | "no_show" | "converted";
  source: "online" | "phone" | "walkin";
}

export interface FleetAccount {
  id: string;
  company: string;
  accountNumber: string;
  billingEmail: string;
  gsa: boolean;
  phone: string;
}

export interface InventoryItem {
  id: string;
  locationId: LocationId;
  sku: string;
  name: string;
  qty: number;
  minQty: number;
  cost: number;
  price: number;
  vendorId: VendorId;
}

export interface PartsOrder {
  id: string;
  roId: string;
  vendorId: VendorId;
  status: "draft" | "submitted" | "shipped" | "received";
  createdAt: string;
  confirmation?: string;
  lines: { sku: string; name: string; qty: number; cost: number }[];
}

export interface Payment {
  id: string;
  roId: string;
  method: PayMethod;
  amount: number;
  status: "pending" | "paid" | "failed";
  at: string;
  note?: string;
  confirmation?: string;
}

export interface Message {
  id: string;
  customerId: string;
  roId?: string;
  channel: "sms" | "email";
  direction: "out" | "in";
  body: string;
  at: string;
}

export interface FinancingApp {
  id: string;
  roId: string;
  provider: FinanceProvider;
  amount: number;
  status: "pending" | "approved" | "declined";
  at: string;
  confirmation?: string;
}

export interface Campaign {
  id: string;
  type: "reminder" | "review" | "declined_followup";
  customerId: string;
  roId?: string;
  sentAt: string;
  status: "sent" | "opened" | "replied";
}

export interface LaborGuideRow {
  id: string;
  name: string;
  cannedId: string;
  domesticHours: number;
  importHours: number;
  euroHours: number;
}

export interface QbSync {
  lastSync: string | null;
  invoicesExported: number;
  status: "idle" | "synced" | "error";
}

export interface ShopState {
  version: number;
  currentUserId: string | null;
  currentLocationId: LocationId;
  sessionToken: string | null;
  locations: ShopLocation[];
  users: User[];
  customers: Customer[];
  vehicles: Vehicle[];
  repairOrders: RepairOrder[];
  timePunches: TimePunch[];
  appointments: Appointment[];
  fleetAccounts: FleetAccount[];
  inventory: InventoryItem[];
  partsOrders: PartsOrder[];
  payments: Payment[];
  messages: Message[];
  financing: FinancingApp[];
  campaigns: Campaign[];
  laborGuide: LaborGuideRow[];
  laborMatrix: { domestic: number; import: number; euro: number; diesel: number };
  partsMatrix: { under20: number; under50: number; under150: number; over: number };
  qb: QbSync;
}
