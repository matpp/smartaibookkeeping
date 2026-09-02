import { RecurringRule } from "../types";

/**
 * Calculates the next execution date for a given recurring rule based on its current run date.
 * Supports daily, weekly, biweekly, monthly, bimonthly, quarterly, biyearly, and yearly intervals.
 */
export const calculateNextRunDate = (
  rule: Omit<RecurringRule, "id" | "nextRunDate"> | RecurringRule,
  fromDate?: string
): string => {
  const baseDate = fromDate ? new Date(`${fromDate}T00:00:00`) : new Date();
  const nextDate = new Date(baseDate);

  switch (rule.interval) {
    case "daily": {
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    }

    case "weekly": {
      nextDate.setDate(nextDate.getDate() + 7);
      adjustToDayOfWeek(nextDate, rule.dayOfWeek);
      break;
    }

    case "biweekly": {
      nextDate.setDate(nextDate.getDate() + 14);
      adjustToDayOfWeek(nextDate, rule.dayOfWeek);
      break;
    }

    case "monthly": {
      const targetDay = rule.dayOfMonth || baseDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + 1);
      clampDayOfMonth(nextDate, targetDay);
      break;
    }

    case "bimonthly": {
      const targetDay = rule.dayOfMonth || baseDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + 2);
      clampDayOfMonth(nextDate, targetDay);
      break;
    }

    case "quarterly": {
      const targetDay = rule.dayOfMonth || baseDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + 3);
      clampDayOfMonth(nextDate, targetDay);
      break;
    }

    case "biyearly": {
      const targetDay = rule.dayOfMonth || baseDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + 6);
      clampDayOfMonth(nextDate, targetDay);
      break;
    }

    case "yearly": {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    }

    default: {
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    }
  }

  return nextDate.toISOString().split("T")[0];
};

/**
 * Helper to adjust date to match a specific day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
const adjustToDayOfWeek = (date: Date, dayOfWeek?: number) => {
  if (typeof dayOfWeek === "number" && dayOfWeek >= 0 && dayOfWeek <= 6) {
    const currentDay = date.getDay();
    let diff = dayOfWeek - currentDay;
    if (diff !== 0) {
      date.setDate(date.getDate() + diff);
    }
  }
};

/**
 * Helper to clamp day of month to avoid invalid dates (e.g. Feb 31 -> Feb 28/29)
 */
const clampDayOfMonth = (date: Date, targetDay: number) => {
  const maxDaysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();
  date.setDate(Math.min(targetDay, maxDaysInMonth));
};