import { supabase } from "./supabase";

export interface SheetTransactionPayload {
  spreadsheetId: string;
  account: string;
  date: string;
  time?: string;
  type: string;
  vendor: string;
  category?: string;
  amount: number;
  note?: string;
  receiptUrl?: string;
  imageBase64?: string;
  splits?: Array<{ category: string; amount: number }>;
}

export async function appendTransactionToSheet(
  payload: SheetTransactionPayload
): Promise<{ success: boolean; updatedRows?: number; data?: any }> {
  if (!payload.spreadsheetId) {
    throw new Error("Spreadsheet ID is missing.");
  }

  if (!payload.account) {
    throw new Error("Target account tab name is missing.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  // Invokes the 'sheets-proxy' Edge Function
  const { data, error } = await supabase.functions.invoke("sheets-proxy", {
    body: payload,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (error) {
    throw new Error(error.message || "Failed to send a request to the Edge Function");
  }

  if (data?.status === "error" || data?.error) {
    throw new Error(data.message || data.error || "Apps Script processing error.");
  }

  return {
    success: true,
    updatedRows: data?.rowsAdded || (payload.splits?.length ? payload.splits.length : 1),
    data,
  };
}