import React, { useState, useEffect } from "react";
import { Header, TabType } from "./components/Header";
import { DashboardMetrics } from "./components/DashboardMetrics";
import { DashboardSecurityLock } from "./components/DashboardSecurityLock";
import { ReceiptUploader } from "./components/ReceiptUploader";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionHistory } from "./components/TransactionHistory";
import { SettingsSection } from "./components/SettingsSection";
import { AppInfoSection } from "./components/AppInfoSection";
import { ManageListsModal } from "./components/ManageListsModal";
import { SubscriptionModal } from "./components/SubscriptionModal";
import { RecurringTransactionsModal } from "./components/RecurringTransactionsModal";
import { AuthModal } from "./components/AuthModal";
import LandingPage from "./LandingPage"; //[cite: 2]
import { matchAccountFromPayment } from "./utils/paymentRuleMatcher";
import { calculateNextRunDate } from "./utils/recurrence";
import { supabase, signInWithGoogle } from "./utils/supabase";
import { appendTransactionToSheet } from "./utils/googleSheetsService";
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import {
  Account,
  TransactionType,
  SplitRow,
  SavedTransaction,
  Category,
  DEFAULT_CATEGORIES,
  DEFAULT_ACCOUNTS,
  CardAndPaymentSettings,
  ExtractedReceiptData,
  DashboardSecurityConfig,
  SubscriptionState,
  SubscriptionTier,
  UserProfile,
  RecurringRule
} from "./types";
import { loadSubscriptionState, saveSubscriptionState, TIER_CONFIGS } from "./utils/subscription";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

const compressBase64Image = (base64Str: string, maxWidth = 1024, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith("data:image")) {
      return resolve(base64Str);
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const contrastFactor = 1.2;

        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const adjusted = Math.min(255, Math.max(0, (gray - 128) * contrastFactor + 128));
          data[i] = adjusted;
          data[i + 1] = adjusted;
          data[i + 2] = adjusted;
        }
        ctx.putImageData(imageData, 0, 0);

        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [refreshQuotaKey, setRefreshQuotaKey] = useState(0);

  const [activeTab, setActiveTab] = useState<TabType>("scanner");
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [isManageListsOpen, setIsManageListsOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(loadSubscriptionState);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionModalTab, setSubscriptionModalTab] = useState<"plans" | "profiles">("plans");
  const [upgradeReason, setUpgradeReason] = useState<"scan_limit" | "entry_limit" | "gemini_vision" | "multi_profile" | null>(null);

  useEffect(() => {
    saveSubscriptionState(subscriptionState);
  }, [subscriptionState]);

  const [securityConfig, setSecurityConfig] = useState<DashboardSecurityConfig>(() => {
    const saved = localStorage.getItem("bookkeeping_dashboard_security");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { enabled: false, lockMethod: "pin" };
  });

  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("bookkeeping_dashboard_security", JSON.stringify(securityConfig));
  }, [securityConfig]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const setupListener = async () => {
        const listener = await CapApp.addListener('appUrlOpen', async (event) => {
          if (event.url.includes('com.example.myapp://')) {
            try {
              await Browser.close();
            } catch (err) {}

            const rawUrl = event.url;
            
            if (rawUrl.includes('code=')) {
              const urlObj = new URL(rawUrl);
              const code = urlObj.searchParams.get('code');
              if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) console.error('Error exchanging code:', error.message);
                return;
              }
            }

            const hash = rawUrl.includes('#') ? rawUrl.split('#')[1] : (rawUrl.includes('?') ? rawUrl.split('?')[1] : null);
            if (hash) {
              const params = new URLSearchParams(hash);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');

              if (accessToken && refreshToken) {
                const { error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                if (error) console.error('Error setting session:', error.message);
              }
            }
          }
        });

        return listener;
      };

      const listenerPromise = setupListener();

      return () => {
        listenerPromise.then((l) => l.remove());
      };
    }
  }, []);

  useEffect(() => {
    const handleSessionChange = async (session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await syncCloudDataDown(session.user.id);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionChange(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else {
        await handleSessionChange(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncCloudDataDown = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("settings_json, plan, ai_scans_used")
        .eq("id", userId)
        .single();

      if (data && !error) {
        const cloudSettings = data.settings_json || {};
        
        if (cloudSettings.spreadsheetId) {
          setSpreadsheetId(cloudSettings.spreadsheetId);
          localStorage.setItem("gsheet_spreadsheet_id", cloudSettings.spreadsheetId);
        }
        if (cloudSettings.categories) {
          setCategories(cloudSettings.categories);
        }
        if (cloudSettings.accounts) {
          setAccounts(cloudSettings.accounts);
        }
        if (cloudSettings.cardPaymentSettings) {
          setCardPaymentSettings(cloudSettings.cardPaymentSettings);
        }

        if (data.plan) {
          setSubscriptionState((prev) => {
            const updated = { ...prev, tier: data.plan as SubscriptionTier, scansThisMonth: data.ai_scans_used ?? prev.scansThisMonth };
            saveSubscriptionState(updated);
            return updated;
          });
        }
        setRefreshQuotaKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error downloading cloud settings:", err);
    }
  };

  const persistCloudSettings = async (updatedFields: {
    sheetId?: string;
    cats?: string[];
    accs?: string[];
    cardSettings?: CardAndPaymentSettings;
  }) => {
    if (!user) return;

    const payload = {
      spreadsheetId: updatedFields.sheetId ?? spreadsheetId,
      categories: updatedFields.cats ?? categories,
      accounts: updatedFields.accounts ?? accounts,
      cardPaymentSettings: updatedFields.cardSettings ?? cardPaymentSettings,
    };

    try {
      await supabase
        .from("profiles")
        .update({
          settings_json: payload,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
    } catch (err) {
      console.error("Failed to sync settings up to Supabase:", err);
    }
  };

  const handleTabChange = (newTab: TabType) => {
    if (activeTab === "dashboard" && newTab !== "dashboard") {
      setIsDashboardUnlocked(false);
    }
    setActiveTab(newTab);
  };

  const handleLockDashboard = () => {
    setIsDashboardUnlocked(false);
  };

  const activeProfileKey = subscriptionState.activeProfileId || "default-profile";

  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>(() => {
    const saved = localStorage.getItem(`bookkeeping_recurring_rules_${activeProfileKey}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    const savedRules = localStorage.getItem(`bookkeeping_recurring_rules_${activeProfileKey}`);
    if (savedRules) {
      try {
        setRecurringRules(JSON.parse(savedRules));
      } catch (e) {
        setRecurringRules([]);
      }
    } else {
      setRecurringRules([]);
    }
  }, [activeProfileKey]);

  useEffect(() => {
    localStorage.setItem(`bookkeeping_recurring_rules_${activeProfileKey}`, JSON.stringify(recurringRules));
  }, [recurringRules, activeProfileKey]);

  const [history, setHistory] = useState<SavedTransaction[]>(() => {
    const saved = localStorage.getItem(`bookkeeping_history_${activeProfileKey}`) || localStorage.getItem("bookkeeping_history_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    const savedHist = localStorage.getItem(`bookkeeping_history_${activeProfileKey}`);
    if (savedHist) {
      try {
        setHistory(JSON.parse(savedHist));
      } catch (e) {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }

    const savedBal = localStorage.getItem(`bookkeeping_starting_balances_${activeProfileKey}`);
    if (savedBal) {
      try {
        setStartingBalances(JSON.parse(savedBal));
      } catch (e) {}
    } else {
      setStartingBalances({ Cash: 0, "Account 1": 0, "Account 2": 0, "Account 3": 0 });
    }
  }, [activeProfileKey]);

  useEffect(() => {
    try {
      const sanitizedHistory = history.map(({ imageBase64, ...rest }) => rest);
      localStorage.setItem(`bookkeeping_history_${activeProfileKey}`, JSON.stringify(sanitizedHistory));
    } catch (e) {
      console.error("Failed to sync history with localStorage", e);
    }
  }, [history, activeProfileKey]);

  useEffect(() => {
    setRecurringRules((prevRules) => {
      if (!prevRules || prevRules.length === 0) return prevRules;

      const todayStr = new Date().toISOString().split("T")[0];
      let rulesUpdated = false;
      let autoProcessedCount = 0;
      const newTransactions: SavedTransaction[] = [];

      const updatedRules = prevRules.map((rule) => {
        if (!rule.active || !rule.nextRunDate) return rule;

        let currentNextRun = rule.nextRunDate;
        let updatedRule = { ...rule };
        let safetyCounter = 0;

        while (currentNextRun <= todayStr && safetyCounter < 100) {
          safetyCounter++;
          rulesUpdated = true;
          autoProcessedCount++;

          const isCost = rule.type !== "Income";
          const totalSigned = isCost ? -Math.abs(rule.amount) : Math.abs(rule.amount);

          const payload = {
            spreadsheetId: spreadsheetId.trim(),
            date: currentNextRun,
            time: "08:00:00",
            account: rule.account,
            type: rule.type,
            vendor: rule.vendor,
            note: `[Auto-Recurring] ${rule.name}`,
            splits: [{ category: rule.category, amount: Math.abs(rule.amount) }]
          };

          const autoTx: SavedTransaction = {
            ...payload,
            id: `tx-recurring-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toLocaleTimeString(),
            totalSignedAmount: totalSigned,
            status: "submitted",
            recurringRuleId: rule.id
          };

          newTransactions.push(autoTx);

          const cleanSheetId = spreadsheetId.trim();
          if (cleanSheetId) {
            (async () => {
              try {
                await appendTransactionToSheet({
                  spreadsheetId: cleanSheetId,
                  account: rule.account,
                  date: currentNextRun,
                  time: "08:00:00",
                  type: rule.type as any,
                  vendor: rule.vendor,
                  note: `[Auto-Recurring] ${rule.name}`,
                  category: rule.category,
                  amount: Math.abs(rule.amount),
                  splits: payload.splits
                });
              } catch (err) {
                console.error("Failed to auto-dispatch recurring item to Web App:", err);
              }
            })();
          }

          const nextCalculated = calculateNextRunDate(updatedRule, currentNextRun);
          if (nextCalculated <= currentNextRun) break;
          currentNextRun = nextCalculated;
          updatedRule.nextRunDate = currentNextRun;
        }

        return updatedRule;
      });

      if (rulesUpdated) {
        setHistory((prev) => [...newTransactions, ...prev]);
        showStatus(`Processed ${autoProcessedCount} scheduled recurring payment(s)!`, "success");
        return updatedRules;
      }

      return prevRules;
    });
  }, [activeProfileKey, spreadsheetId]);

  const [startingBalances, setStartingBalances] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`bookkeeping_starting_balances_${activeProfileKey}`) || localStorage.getItem("bookkeeping_starting_balances");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { Cash: 0, "Account 1": 0, "Account 2": 0, "Account 3": 0 };
  });

  useEffect(() => {
    localStorage.setItem(`bookkeeping_starting_balances_${activeProfileKey}`, JSON.stringify(startingBalances));
  }, [startingBalances, activeProfileKey]);

  const [cardPaymentSettings, setCardPaymentSettings] = useState<CardAndPaymentSettings>(() => {
    const saved = localStorage.getItem("bookkeeping_card_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { cardMappings: [], cashAccount: "Cash", autoSelectAccount: true };
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("bookkeeping_categories");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [...DEFAULT_CATEGORIES];
  });

  const [accounts, setAccounts] = useState<string[]>(() => {
    const saved = localStorage.getItem("bookkeeping_accounts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [...DEFAULT_ACCOUNTS];
  });

  const [txDate, setTxDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [txTime, setTxTime] = useState(() => new Date().toTimeString().split(" ")[0]);
  const [txAccount, setTxAccount] = useState<Account | "">("Cash");
  const [autoMatchedInfo, setAutoMatchedInfo] = useState<string | null>(null);
  const [txType, setTxType] = useState<TransactionType | "">("Variable Cost");
  const [txVendor, setTxVendor] = useState("");
  const [txNote, setTxNote] = useState("");
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | undefined>(undefined);
  const [attachedImageMimeType, setAttachedImageMimeType] = useState<string | undefined>(undefined);
  const [attachedImageFileName, setAttachedImageFileName] = useState<string | undefined>(undefined);
  const [splits, setSplits] = useState<SplitRow[]>([{ id: "initial-1", category: "Groceries", amount: "" }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);

  useEffect(() => {
    const savedSheetId = localStorage.getItem("gsheet_spreadsheet_id");
    if (savedSheetId) setSpreadsheetId(savedSheetId);
  }, []);

  useEffect(() => {
    localStorage.setItem("bookkeeping_categories", JSON.stringify(categories));
    persistCloudSettings({ cats: categories });
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("bookkeeping_accounts", JSON.stringify(accounts));
    persistCloudSettings({ accs: accounts });
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("bookkeeping_card_settings", JSON.stringify(cardPaymentSettings));
    persistCloudSettings({ cardSettings: cardPaymentSettings });
  }, [cardPaymentSettings]);

  useEffect(() => {
    localStorage.setItem("bookkeeping_starting_balances", JSON.stringify(startingBalances));
  }, [startingBalances]);

  const handleUpdateStartingBalance = (account: string, amount: number) => {
    setStartingBalances((prev) => ({ ...prev, [account]: amount }));
  };

  const showStatus = (message: string, type: "info" | "success" | "error") => {
    setStatus({ message, type });
  };

  const handleExtractionSuccess = async (data: ExtractedReceiptData, source: "ai" | "ocr") => {
    if (data.vendor) setTxVendor(data.vendor);
    if (data.date) setTxDate(data.date);
    if (data.time) setTxTime(data.time);
    if (data.imageMimeType) setAttachedImageMimeType("image/jpeg");
    if (data.imageFileName) setAttachedImageFileName(data.imageFileName);

    if (data.imageBase64) {
      const compressed = await compressBase64Image(data.imageBase64);
      setAttachedImageBase64(compressed);
    }

    if (data.splits && data.splits.length > 0) {
      const newSplits: SplitRow[] = data.splits.map((item, idx) => ({
        id: `${Date.now()}-${idx}`,
        category: (item.category as Category) || "Groceries",
        amount: item.amount ? item.amount.toFixed(2) : ""
      }));
      setSplits(newSplits);
    }

    let match = matchAccountFromPayment(data, cardPaymentSettings, accounts);
    const card4 = data.cardLast4?.toString().trim();

    if (!match && card4 && card4.length === 4) {
      const directAccountMatch = accounts.find((acc) => acc.includes(card4));
      if (directAccountMatch) {
        match = { account: directAccountMatch, matchedBy: `Card Digits (*${card4})` };
      }
    }

    if (match) {
      setTxAccount(match.account);
      setAutoMatchedInfo(match.matchedBy);
      showStatus(`✨ Receipt parsed! Auto-selected account "${match.account}" via ${match.matchedBy}.`, "success");
    } else {
      setAutoMatchedInfo(null);
    }
  };

  const handleEditTransaction = (item: SavedTransaction) => {
    setTxDate(item.date);
    setTxTime(item.time || new Date().toTimeString().split(" ")[0]);
    setTxAccount(item.account);
    setTxType(item.type);
    setTxVendor(item.vendor);
    setTxNote(item.note || "");
    setAttachedImageBase64(item.imageBase64);
    setAttachedImageMimeType(item.imageMimeType);
    setAttachedImageFileName(item.imageFileName);

    if (item.splits && item.splits.length > 0) {
      setSplits(
        item.splits.map((s, idx) => ({
          id: `edit-${Date.now()}-${idx}`,
          category: s.category,
          amount: s.amount.toString()
        }))
      );
    }

    setHistory((prev) => prev.filter((tx) => tx.id !== item.id));
    setActiveTab("scanner");
    showStatus(`Loaded "${item.vendor}" into form. Modify details and submit to re-send.`, "info");
  };

  const handleOpenSubscriptionModal = (tab: "plans" | "profiles" = "plans") => {
    setSubscriptionModalTab(tab);
    setUpgradeReason(null);
    setIsSubscriptionModalOpen(true);
  };

  const handleTriggerUpgrade = (reason: "scan_limit" | "entry_limit" | "gemini_vision" | "multi_profile") => {
    setUpgradeReason(reason);
    setSubscriptionModalTab(reason === "multi_profile" ? "profiles" : "plans");
    setIsSubscriptionModalOpen(true);
  };

  const handleScanCompleted = async () => {
    const newCount = subscriptionState.scansThisMonth + 1;
    setSubscriptionState((prev) => ({ ...prev, scansThisMonth: newCount }));
    if (user) {
      await supabase.from("profiles").update({ ai_scans_used: newCount }).eq("id", user.id);
    }
  };

  const handleEntryCompleted = () => {
    setSubscriptionState((prev) => ({ ...prev, entriesThisMonth: prev.entriesThisMonth + 1 }));
  };

  const handleSelectTier = async (tier: SubscriptionTier) => {
    setSubscriptionState((prev) => ({ ...prev, tier }));
    if (user) {
      await supabase.from("profiles").update({ plan: tier }).eq("id", user.id);
    }
    showStatus(`Subscription updated to ${TIER_CONFIGS[tier].name} Plan!`, "success");
    setIsSubscriptionModalOpen(false);
  };

  const handleCreateProfile = (name: string) => {
    const newProfile: UserProfile = { id: `profile-${Date.now()}`, name, createdDate: new Date().toISOString() };
    setSubscriptionState((prev) => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      activeProfileId: prev.tier === "elite" ? newProfile.id : prev.activeProfileId
    }));
    showStatus(`Client Profile "${name}" created!`, "success");
  };

  const handleRenameProfile = (id: string, newName: string) => {
    setSubscriptionState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, name: newName } : p))
    }));
    showStatus(`Profile renamed to "${newName}".`, "info");
  };

  const handleDeleteProfile = (id: string) => {
    setSubscriptionState((prev) => {
      const filtered = prev.profiles.filter((p) => p.id !== id);
      const nextActive = prev.activeProfileId === id ? filtered[0]?.id || "default-profile" : prev.activeProfileId;
      return { ...prev, profiles: filtered, activeProfileId: nextActive };
    });
    showStatus("Profile removed.", "info");
  };

  const handleSwitchProfile = (id: string) => {
    setSubscriptionState((prev) => ({ ...prev, activeProfileId: id }));
    const targetProf = subscriptionState.profiles.find((p) => p.id === id);
    showStatus(`Switched active profile to "${targetProf?.name || "Selected Profile"}".`, "info");
  };

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSheetId = spreadsheetId.trim();

    if (!cleanSheetId) {
      showStatus("Please configure your Google Spreadsheet ID in Settings.", "error");
      setActiveTab("settings");
      return;
    }

    if (!txAccount) {
      showStatus("Please select an Account.", "error");
      return;
    }

    const validSplits = splits
      .map((s) => ({ category: s.category || "Groceries", amount: Math.abs(parseFloat(s.amount) || 0) }))
      .filter((s) => s.amount > 0);

    if (validSplits.length === 0) {
      showStatus("Please enter a valid amount for at least one category split row.", "error");
      return;
    }

    const isCost = txType === "Reocuring Cost" || txType === "Recurring Cost" || txType === "Variable Cost";
    const rawSum = validSplits.reduce((acc, curr) => acc + curr.amount, 0);
    const totalSigned = isCost ? -Math.abs(rawSum) : Math.abs(rawSum);

    let finalBase64 = attachedImageBase64;
    if (finalBase64) {
      finalBase64 = await compressBase64Image(finalBase64);
    }

    const txId = `tx-${Date.now()}`;

    const pendingLog: SavedTransaction = {
      spreadsheetId: cleanSheetId,
      date: txDate,
      time: txTime || new Date().toTimeString().split(" ")[0],
      account: txAccount,
      type: txType || "Variable Cost",
      vendor: txVendor.trim() || "Receipt Expense",
      note: txNote.trim(),
      splits: validSplits,
      imageBase64: finalBase64,
      imageMimeType: attachedImageMimeType,
      imageFileName: attachedImageFileName,
      id: txId,
      timestamp: new Date().toLocaleTimeString(),
      totalSignedAmount: totalSigned,
      status: "submitted"
    };

    setHistory((prev) => [pendingLog, ...prev]);
    setIsSubmitting(true);
    showStatus(`Sending entry directly to Google Apps Script for tab "${txAccount}"...`, "info");
    handleEntryCompleted();

    try {
      await appendTransactionToSheet({
        spreadsheetId: cleanSheetId,
        account: txAccount,
        date: txDate,
        time: txTime || new Date().toTimeString().split(" ")[0],
        type: (txType || "Variable Cost") as any,
        vendor: txVendor.trim() || "Receipt Expense",
        note: txNote.trim(),
        category: validSplits[0]?.category || "General",
        amount: Math.abs(totalSigned),
        imageBase64: finalBase64,
        splits: validSplits
      });

      showStatus(`Success! Executed script & updated Google Sheet tab "${txAccount}".`, "success");
    } catch (err: any) {
      showStatus(`Apps Script Error: ${err.message || "Failed to push entry"}.`, "error");
      setHistory((prev) => prev.map((item) => (item.id === txId ? { ...item, status: "failed" } : item)));
    } finally {
      setIsSubmitting(false);
      setTxVendor("");
      setTxNote("");
      setAttachedImageBase64(undefined);
      setAttachedImageMimeType(undefined);
      setAttachedImageFileName(undefined);
      setTxTime(new Date().toTimeString().split(" ")[0]);
      setSplits([{ id: `initial-${Date.now()}`, category: "Groceries", amount: "" }]);
      setAutoMatchedInfo(null);
    }
  };

  const handleResend = async (item: SavedTransaction) => {
    const cleanSheetId = spreadsheetId.trim();

    if (!cleanSheetId) {
      showStatus("Please enter your Spreadsheet ID first in Settings.", "error");
      setActiveTab("settings");
      return;
    }

    showStatus(`Re-sending transaction (${item.vendor}) to Google Apps Script...`, "info");
    try {
      await appendTransactionToSheet({
        spreadsheetId: cleanSheetId,
        account: item.account,
        date: item.date,
        time: item.time,
        type: item.type as any,
        vendor: item.vendor,
        note: item.note,
        category: item.splits[0]?.category || "General",
        amount: Math.abs(item.totalSignedAmount || 0),
        imageBase64: item.imageBase64,
        splits: item.splits,
        receiptUrl: item.receiptUrl
      });

      showStatus(`Re-sent transaction (${item.vendor}) successfully!`, "success");
      setHistory((prev) => prev.map((h) => (h.id === item.id ? { ...h, status: "submitted" } : h)));
    } catch (e: any) {
      showStatus(`Re-send failed: ${e.message}`, "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-between font-sans">
        <LandingPage
          onLoginClick={async () => {
            try {
              await signInWithGoogle();
            } catch (err: any) {
              console.error("Sign-in error:", err.message);
            }
          }}
          onRoadmapClick={() => {
            setIsAuthOpen(true);
          }}
        />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-12 font-sans">
      <Header
        hasWebhook={Boolean(spreadsheetId.trim())}
        hasGeminiKey={true}
        ruleCount={cardPaymentSettings.cardMappings.length}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isDashboardLocked={!isDashboardUnlocked}
        isSecurityEnabled={securityConfig.enabled}
        subscriptionState={subscriptionState}
        onOpenSubscriptionModal={handleOpenSubscriptionModal}
        onSwitchProfile={handleSwitchProfile}
        onOpenRecurringModal={() => setIsRecurringModalOpen(true)}
        user={user}
        setIsAuthOpen={setIsAuthOpen}
        refreshQuotaKey={refreshQuotaKey}
      />

      <main className="max-w-5xl mx-auto px-4">
        {activeTab === "scanner" && (
          <div>
            <ReceiptUploader
              customCategories={categories}
              subscriptionState={subscriptionState}
              onScanCompleted={handleScanCompleted}
              onTriggerUpgrade={handleTriggerUpgrade}
              onExtractionSuccess={handleExtractionSuccess}
              onStatusChange={showStatus}
            />

            {status && (
              <div
                className={`p-4 rounded-xl mb-6 flex items-start gap-3 border shadow-xs transition-all ${
                  status.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : status.type === "error"
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-blue-50 border-blue-200 text-blue-900"
                }`}
              >
                {status.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                {status.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                {status.type === "info" && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
                <div className="text-xs font-medium leading-relaxed">{status.message}</div>
              </div>
            )}

            <TransactionForm
              txDate={txDate}
              setTxDate={setTxDate}
              txTime={txTime}
              setTxTime={setTxTime}
              txAccount={txAccount}
              setTxAccount={setTxAccount}
              autoMatchedInfo={autoMatchedInfo}
              txType={txType}
              setTxType={setTxType}
              txVendor={txVendor}
              setTxVendor={setTxVendor}
              txNote={txNote}
              setTxNote={setTxNote}
              hasReceiptImage={Boolean(attachedImageBase64)}
              receiptFileName={attachedImageFileName}
              splits={splits}
              setSplits={setSplits}
              accounts={accounts}
              categories={categories}
              onOpenManageLists={() => setIsManageListsOpen(true)}
              onSubmit={submitTransaction}
              isSubmitting={isSubmitting}
              subscriptionState={subscriptionState}
              onTriggerUpgrade={handleTriggerUpgrade}
            />

            <DashboardSecurityLock
              config={securityConfig}
              onSaveConfig={(newCfg) => setSecurityConfig(newCfg)}
              securityConfig={securityConfig}
              setSecurityConfig={setSecurityConfig}
              isUnlocked={isDashboardUnlocked}
              onUnlocked={() => setIsDashboardUnlocked(true)}
              onLockNow={handleLockDashboard}
            />

            {(isDashboardUnlocked || !securityConfig.enabled) && (
              <TransactionHistory
                history={history}
                setHistory={setHistory}
                onClearHistory={() => setHistory([])}
                onResend={handleResend}
                onEditTransaction={handleEditTransaction}
                securityConfig={securityConfig}
                setSecurityConfig={setSecurityConfig}
                isUnlocked={isDashboardUnlocked}
                onUnlocked={() => setIsDashboardUnlocked(true)}
                onLockNow={handleLockDashboard}
                categories={categories}
                accounts={accounts}
              />
            )}
          </div>
        )}

        {activeTab === "dashboard" && (
          <div>
            <DashboardSecurityLock
              config={securityConfig}
              onSaveConfig={(newCfg) => setSecurityConfig(newCfg)}
              securityConfig={securityConfig}
              setSecurityConfig={setSecurityConfig}
              isUnlocked={isDashboardUnlocked}
              onUnlocked={() => setIsDashboardUnlocked(true)}
              onLockNow={handleLockDashboard}
            />

            {(isDashboardUnlocked || !securityConfig.enabled) && (
              <DashboardMetrics
                accounts={accounts}
                history={history}
                startingBalances={startingBalances}
                onUpdateStartingBalance={handleUpdateStartingBalance}
              />
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <SettingsSection
            spreadsheetId={spreadsheetId}
            setSpreadsheetId={(id) => {
              setSpreadsheetId(id);
              localStorage.setItem("gsheet_spreadsheet_id", id);
              persistCloudSettings({ sheetId: id });
            }}
            cardPaymentSettings={cardPaymentSettings}
            setCardPaymentSettings={setCardPaymentSettings}
            accounts={accounts}
            onOpenHelp={() => {}}
            onOpenManageLists={() => setIsManageListsOpen(true)}
            securityConfig={securityConfig}
            setSecurityConfig={setSecurityConfig}
            onLockDashboard={handleLockDashboard}
            subscriptionState={subscriptionState}
            onOpenSubscriptionModal={handleOpenSubscriptionModal}
          />
        )}

        {activeTab === "info" && <AppInfoSection />}
      </main>

      <ManageListsModal
        isOpen={isManageListsOpen}
        onClose={() => setIsManageListsOpen(false)}
        categories={categories}
        setCategories={setCategories}
        accounts={accounts}
        setAccounts={setAccounts}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        subscriptionState={subscriptionState}
        onSelectTier={handleSelectTier}
        onCreateProfile={handleCreateProfile}
        onRenameProfile={handleRenameProfile}
        onDeleteProfile={handleDeleteProfile}
        onSwitchProfile={handleSwitchProfile}
        initialTab={subscriptionModalTab}
        upgradeReason={upgradeReason}
      />

      <RecurringTransactionsModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        rules={recurringRules}
        setRules={setRecurringRules}
        accounts={accounts}
        categories={categories}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}