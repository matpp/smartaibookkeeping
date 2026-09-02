import { triggerGoogleSheetSync } from './services/googleWebhook';

// Call this after saving a transaction or updating sheet settings
const handleSync = async () => {
  const webhookUrl = userSettings.googleWebhookUrl; // From Supabase or local state
  const spreadsheetId = userSettings.spreadsheetId;

  await triggerGoogleSheetSync(webhookUrl, spreadsheetId, { action: "syncData" });
};