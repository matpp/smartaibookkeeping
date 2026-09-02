import { supabase } from "./supabase";

export interface UserCloudData {
  customCategories?: string[];
  cardRules?: any[];
  recurringPayments?: any[];
  profiles?: any[];
  subscriptionState?: any;
  transactionLog?: SavedTransaction[];
  accountStartingBalance?: Record<string, number>;
  spreadsheetId?: string;
}

/**
 * Load all user settings, rules, categories, and profiles from Supabase.
 */
export async function loadUserDataFromSupabase(userId: string): Promise<UserCloudData | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("settings_json")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading cloud profile settings:", error);
      return null;
    }

    return data?.settings_json || {};
  } catch (err) {
    console.error("Failed to fetch cloud data:", err);
    return null;
  }
}

/**
 * Save all app state settings to Supabase cloud profile json column.
 */
export async function saveUserDataToSupabase(userId: string, payload: UserCloudData) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        settings_json: payload,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (error) {
      console.error("Error saving cloud settings:", error);
    }
  } catch (err) {
    console.error("Failed to push cloud data:", err);
  }
}