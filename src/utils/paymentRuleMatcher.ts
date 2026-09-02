import { CardAndPaymentSettings } from "../types";

export interface AccountMatchResult {
  account: string;
  matchedBy: string; // e.g. "Card *1234 (mBank)", "Cash Payment"
}

export function matchAccountFromPayment(
  paymentData: { paymentMethod?: string; cardLast4?: string; rawText?: string },
  settings: CardAndPaymentSettings,
  availableAccounts: string[]
): AccountMatchResult | null {
  if (!settings.autoSelectAccount) return null;

  const method = (paymentData.paymentMethod || "").toLowerCase().trim();
  const cardLast4 = (paymentData.cardLast4 || "").trim();
  const text = (paymentData.rawText || "").toLowerCase();

  // 1. Check direct match for Card Last 4 Digits
  if (cardLast4 && cardLast4.length === 4) {
    const matchedRule = settings.cardMappings.find(
      (rule) => rule.last4.trim() === cardLast4
    );
    if (matchedRule && availableAccounts.includes(matchedRule.account)) {
      return {
        account: matchedRule.account,
        matchedBy: `Card *${cardLast4}${matchedRule.label ? ` (${matchedRule.label})` : ""}`
      };
    }
  }

  // 2. Scan raw text if cardLast4 wasn't explicitly isolated by Gemini
  if (settings.cardMappings.length > 0) {
    for (const rule of settings.cardMappings) {
      const cleanLast4 = rule.last4.trim();
      if (cleanLast4 && cleanLast4.length === 4) {
        // Pattern: card numbers ending in 4 digits or preceded by *, x, #
        const regex = new RegExp(`(?:\\*|x|card|karta|#|\\b)${cleanLast4}\\b`, "i");
        if (regex.test(text) && availableAccounts.includes(rule.account)) {
          return {
            account: rule.account,
            matchedBy: `Card *${cleanLast4}${rule.label ? ` (${rule.label})` : ""}`
          };
        }
      }
    }
  }

  // 3. Check for Cash payment
  const isCash =
    method === "cash" ||
    text.includes("hotovos") ||
    text.includes("cash") ||
    text.includes("bargeld") ||
    text.includes("gotowka");

  if (isCash && settings.cashAccount && availableAccounts.includes(settings.cashAccount)) {
    return {
      account: settings.cashAccount,
      matchedBy: `Cash Payment (${settings.cashAccount})`
    };
  }

  return null;
}
