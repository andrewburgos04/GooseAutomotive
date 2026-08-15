export type Sex = "Female" | "Male" | "Other" | "Unknown";

export type AppointmentStatus =
  | "Scheduled"
  | "Checked In"
  | "With Provider"
  | "Ready for Checkout"
  | "Completed"
  | "No Show"
  | "Cancelled";

export type Severity = "low" | "moderate" | "high" | "critical";

export interface Allergy {
  id: string;
  substance: string;
  reaction: string;
  severity: Severity;
  onset?: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  status: "Active" | "Discontinued" | "On Hold";
  prescribedBy: string;
  startDate: string;
}

export interface Problem {
  id: string;
  name: string;
  icd10: string;
  status: "Active" | "Resolved" | "Chronic";
  onset: string;
  notedBy: string;
}

export interface VitalReading {
  id: string;
  recordedAt: string;
  bpSystolic: number;
  bpDiastolic: number;
  hr: number;
  tempF: number;
  spo2: number;
  weightLbs: number;
  heightIn: number;
  pain: number;
}

export interface ProgressNote {
  id: string;
  date: string;
  author: string;
  visitType: string;
  chiefComplaint: string;
  assessment: string;
  plan: string;
  signed: boolean;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dob: string;
  sex: Sex;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  insurance: string;
  memberId: string;
  pcp: string;
  lastVisit: string;
  nextVisit?: string;
  allergies: Allergy[];
  medications: Medication[];
  problems: Problem[];
  vitals: VitalReading[];
  notes: ProgressNote[];
  flags: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  time: string;
  durationMin: number;
  provider: string;
  reason: string;
  type: string;
  status: AppointmentStatus;
  room?: string;
}

export interface InboxMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  receivedAt: string;
  priority: "Normal" | "High" | "Urgent";
  unread: boolean;
  category: "Clinical" | "Refill" | "Referral" | "Admin" | "Patient";
  patientId?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  orderedBy: string;
  collectedAt: string;
  status: "Pending" | "Preliminary" | "Final" | "Critical";
  resultSummary: string;
  flagged: boolean;
}

export interface Claim {
  id: string;
  patientId: string;
  dos: string;
  cpt: string;
  diagnosis: string;
  amount: number;
  status: "Draft" | "Submitted" | "Accepted" | "Denied" | "Paid";
  payer: string;
}

export interface DashboardAlert {
  id: string;
  label: string;
  count: number;
  tone: "teal" | "amber" | "rose" | "slate" | "forest";
  href: string;
}
