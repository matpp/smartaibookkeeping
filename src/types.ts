export const DEFAULT_CATEGORIES = [
  "Alcohol",
  "Eating-out/Pubs/Coffees",
  "TV/Phone/Broadband",
  "Toiletries/Cosmetics",
  "Transfer",
  "Groceries",
  "Gifts/Presents",
  "Home",
  "Lunch at Work",
  "Pharmacy",
  "Insurance",
  "Entertainment",
  "Nails",
  "Wages",
  "Transport",
  "Clothes",
  "Other",
  "Rent", 
  "Holiday/Trips"
];

export const CATEGORIES = DEFAULT_CATEGORIES;
export type Category = string;

export const DEFAULT_ACCOUNTS = ["Cash", "Account 1", "Account 2", "Account 3"];
export const ACCOUNTS = DEFAULT_ACCOUNTS;
export type Account = string;

// Define allowed transaction categories and derive the TypeScript type union
export const TRANSACTION_TYPES = ["Income", "Recurring Cost", "Variable Cost"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

// Recurrence options supported by the auto-scheduler
export type RecurrenceFrequency = 
  | "daily" 
  | "weekly" 
  | "biweekly" 
  | "monthly" 
  | "bimonthly" 
  | "quarterly" 
  | "annually";

// Rule configuration structure for automated payments
export interface RecurringRule {
  id: string;
  name: string; // e.g. "Apartment Rent", "Employer Direct Deposit"
  account: Account;
  vendor: string;
  amount: number;
  type: "Recurring Cost" | "Income";
  category: Category;
  frequency: RecurrenceFrequency;
  
  // Timing choices
  dayOfWeek?: number;  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayOfMonth?: number; // 1 to 31
  
  nextRunDate: string; // "YYYY-MM-DD"
  active: boolean;
  createdDate?: string;
  lastRunDate?: string; // Tracks the last date a transaction was successfully posted to prevent loops
}

export interface SplitRow {
  id: string;
  category: Category | "";
  amount: string; // Keep as string in form for input handling
}

export interface TransactionSplit {
  category: string;
  amount: number;
}

export interface TransactionPayload {
  date: string;
  time?: string; // HH:MM:SS format
  account: Account | "";
  type: TransactionType | "";
  vendor: string;
  splits: TransactionSplit[];
  note?: string;
  imageBase64?: string;
  imageMimeType?: string;
  imageFileName?: string;
}

export interface SavedTransaction extends TransactionPayload {
  id: string;
  timestamp: string; // upload/entry timestamp
  totalSignedAmount: number;
  status: "submitted" | "local_only" | "failed";
  receiptUrl?: string; // Link to Google Drive image
  recurringRuleId?: string; // Optional link to origin recurring rule
}

export interface CardMapping {
  id: string;
  last4: string; // e.g. "1234"
  account: string; // e.g. "BOFI"
  label?: string; // e.g. "My BOFI Visa"
}

export interface CardAndPaymentSettings {
  cardMappings: CardMapping[];
  cashAccount: string; // default "Cash"
  autoSelectAccount: boolean; // default true
}

export interface ExtractedReceiptData {
  vendor?: string;
  date?: string;
  time?: string;
  paymentMethod?: "cash" | "card" | "unknown" | string;
  cardLast4?: string;
  splits: Array<{ category: string; amount: number }>;
  rawText?: string;
  imageBase64?: string;
  imageMimeType?: string;
  imageFileName?: string;
}

export type LockMethod = "pin" | "pattern" | "password" | "biometrics";

export interface DashboardSecurityConfig {
  enabled: boolean;
  lockMethod: LockMethod;
  secretHash?: string;
  patternSequence?: number[];
  biometricsEnabled?: boolean;
  autoLockOnLeave?: boolean;
}

export type SubscriptionTier = "free" | "basic" | "pro" | "elite";

export interface UserProfile {
  id: string;
  name: string;
  isDefault?: boolean;
  createdDate: string;
}

export interface SubscriptionLimits {
  scansLimit: number; // e.g., 15 for Free, 100 for Basic, Infinity for Pro/Elite
  entriesLimit: number; // e.g., 25 for Free, Infinity for Basic/Pro/Elite
  allowGeminiVision: boolean; // false for Free (Local OCR only), true for Basic/Pro/Elite
  allowMultiProfiles: boolean; // true for Elite only
}

export interface SubscriptionState {
  tier: SubscriptionTier;
  scansThisMonth: number;
  entriesThisMonth: number;
  currentMonthKey: string; // e.g. "2026-08"
  activeProfileId: string;
  profiles: UserProfile[];
}