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
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  fleet?: boolean;
  company?: string;
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
}

export interface InspectionItem {
  id: string;
  category: string;
  name: string;
  rating: Rating;
  notes: string;
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
  labor: LaborLine[];
  parts: PartLine[];
}

export interface Note {
  id: string;
  at: string;
  userId: string;
  body: string;
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
}

export interface ShopState {
  version: number;
  currentUserId: string | null;
  currentLocationId: LocationId;
  locations: ShopLocation[];
  users: User[];
  customers: Customer[];
  vehicles: Vehicle[];
  repairOrders: RepairOrder[];
}
