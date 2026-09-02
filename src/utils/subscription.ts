import { SubscriptionTier, SubscriptionLimits, SubscriptionState, UserProfile } from "../types";

export interface TierDetail {
  id: SubscriptionTier;
  name: string;
  badge: string;
  price: string;
  description: string;
  limits: SubscriptionLimits;
  features: string[];
  isPopular?: boolean;
  accentColor: string;
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierDetail> = {
  free: {
    id: "free",
    name: "Free",
    badge: "FREE",
    price: "$0",
    description: "Essential bookkeeping tools for light individual tracking.",
    limits: {
      scansLimit: 15,
      entriesLimit: 25,
      allowGeminiVision: false,
      allowMultiProfiles: false
    },
    features: [
      "Up to 15 receipt scans / month",
      "Up to 25 transaction entries / month",
      "Local Tesseract OCR engine only",
      "Google Sheets & Webhook integration",
      "Single account profile"
    ],
    accentColor: "slate"
  },
  basic: {
    id: "basic",
    name: "Basic",
    badge: "BASIC",
    price: "$9.99 / mo",
    description: "Enhanced OCR power with AI Gemini Vision for active users.",
    limits: {
      scansLimit: 100,
      entriesLimit: 999999,
      allowGeminiVision: true,
      allowMultiProfiles: false
    },
    features: [
      "Up to 100 receipt scans / month",
      "Unlimited transaction entries",
      "Gemini AI Vision for intelligent receipts",
      "Itemized auto-category splitting",
      "Card last 4 digits auto-matching"
    ],
    accentColor: "blue"
  },
  pro: {
    id: "pro",
    name: "Pro",
    badge: "PRO",
    price: "$19.99 / mo",
    description: "Unlimited power & speed for heavy bookkeeping and business.",
    limits: {
      scansLimit: 999999,
      entriesLimit: 999999,
      allowGeminiVision: true,
      allowMultiProfiles: false
    },
    isPopular: true,
    features: [
      "Unlimited receipt scans / month",
      "Unlimited transaction entries",
      "Gemini AI Vision & High-Accuracy OCR",
      "Export logs to CSV & Google Sheets",
      "Biometrics & Security Lock",
      "Priority AI server processing"
    ],
    accentColor: "teal"
  },
  elite: {
    id: "elite",
    name: "Elite",
    badge: "ELITE",
    price: "$39.99 / mo",
    description: "Multi-client & multi-business management under one account.",
    limits: {
      scansLimit: 999999,
      entriesLimit: 999999,
      allowGeminiVision: true,
      allowMultiProfiles: true
    },
    features: [
      "Everything in Pro Plan",
      "Multiple profiles / clients under 1 account",
      "Separate books & starting balances per client",
      "Instant 1-click profile switcher",
      "Dedicated multi-account client workflows"
    ],
    accentColor: "emerald"
  }
};

export const getCurrentMonthKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: "default-profile",
    name: "Main Personal Profile",
    isDefault: true,
    createdDate: new Date().toISOString()
  }
];

export const getDefaultSubscriptionState = (): SubscriptionState => {
  return {
    tier: "free",
    scansThisMonth: 0,
    entriesThisMonth: 0,
    currentMonthKey: getCurrentMonthKey(),
    activeProfileId: "default-profile",
    profiles: DEFAULT_PROFILES
  };
};

export const loadSubscriptionState = (): SubscriptionState => {
  const saved = localStorage.getItem("bookkeeping_subscription_state");
  const currentMonth = getCurrentMonthKey();

  if (saved) {
    try {
      const parsed: SubscriptionState = JSON.parse(saved);
      // Ensure profiles exist
      if (!parsed.profiles || parsed.profiles.length === 0) {
        parsed.profiles = DEFAULT_PROFILES;
        parsed.activeProfileId = "default-profile";
      }
      // Check monthly reset
      if (parsed.currentMonthKey !== currentMonth) {
        parsed.currentMonthKey = currentMonth;
        parsed.scansThisMonth = 0;
        parsed.entriesThisMonth = 0;
      }
      return parsed;
    } catch (e) {
      console.error("Error parsing subscription state", e);
    }
  }

  return getDefaultSubscriptionState();
};

export const saveSubscriptionState = (state: SubscriptionState) => {
  localStorage.setItem("bookkeeping_subscription_state", JSON.stringify(state));
};
