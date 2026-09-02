import React, { useState } from "react";
import {
  CreditCard,
  FileSpreadsheet,
  Shield,
  Layers,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Smartphone,
  Wallet,
  CheckCircle,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { CardAndPaymentSettings, DashboardSecurityConfig, SubscriptionState } from "../types";
import { HelpModal } from "./HelpModal";

interface SettingsSectionProps {
  spreadsheetId: string;
  setSpreadsheetId: (id: string) => void;
  cardPaymentSettings: CardAndPaymentSettings;
  setCardPaymentSettings: React.Dispatch<React.SetStateAction<CardAndPaymentSettings>>;
  accounts: string[];
  onOpenHelp: () => void;
  onOpenManageLists: () => void;
  securityConfig: DashboardSecurityConfig;
  setSecurityConfig: React.Dispatch<React.SetStateAction<DashboardSecurityConfig>>;
  onLockDashboard: () => void;
  subscriptionState: SubscriptionState;
  onOpenSubscriptionModal: (tab?: "plans" | "profiles") => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  spreadsheetId,
  setSpreadsheetId,
  cardPaymentSettings,
  setCardPaymentSettings,
  accounts,
  onOpenHelp,
  onOpenManageLists,
  securityConfig,
  setSecurityConfig,
  onLockDashboard,
  subscriptionState,
  onOpenSubscriptionModal,
}) => {
  // New Card Form State
  const [newLast4, setNewLast4] = useState("");
  const [newAccount, setNewAccount] = useState(accounts[0] || "Cash");
  const [newLabel, setNewLabel] = useState("");

  // Local Security State for editing
  const [secEnabled, setSecEnabled] = useState(securityConfig.enabled);
  const [secMethod, setSecMethod] = useState<DashboardSecurityConfig["lockMethod"]>(
    securityConfig.lockMethod || "pin"
  );
  const [requireBiometricsOnEntry, setRequireBiometricsOnEntry] = useState(false);

  // Status message for feedback
  const [copied, setCopied] = useState(false);

  // Modal State for Setup Guide
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleAddCardMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLast4.trim()) return;

    setCardPaymentSettings((prev) => ({
      ...prev,
      cardMappings: [
        ...prev.cardMappings,
        {
          id: `card-${Date.now()}`,
          last4: newLast4.trim(),
          account: newAccount,
          label: newLabel.trim() || undefined,
        },
      ],
    }));

    setNewLast4("");
    setNewLabel("");
  };

  const handleRemoveCardMapping = (id: string) => {
    setCardPaymentSettings((prev) => ({
      ...prev,
      cardMappings: prev.cardMappings.filter((c) => c.id !== id),
    }));
  };

  const handleSaveSecurity = () => {
    setSecurityConfig({
      enabled: secEnabled,
      lockMethod: secMethod,
    });
  };

  const handleCopySpreadsheetId = () => {
    if (!spreadsheetId) return;
    navigator.clipboard.writeText(spreadsheetId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeProfileName = subscriptionState.activeProfileId
    ? subscriptionState.profiles.find((p) => p.id === subscriptionState.activeProfileId)?.name || "Main Personal Profile"
    : "Main Personal Profile";

  const cardRulesCount = cardPaymentSettings.cardMappings.length;

  // Dynamically resolve target Google Sheet URL or fallback template
  const linkedDocumentUrl = spreadsheetId.trim()
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId.trim()}`
    : "https://docs.google.com/spreadsheets/d/1_Cx8QNh0MRtvZHfHM7mtMV0b7Z6hhPmzkf3Q8";

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-slate-800">
      
      {/* ----------------- TOP STATUS BADGES & PROFILE SELECTOR ----------------- */}
      <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
        {/* Profile Dropdown */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-cyan-600" />
            <span>Profile:</span>
            <span className="text-slate-900 font-bold text-sm tracking-normal capitalize">
              {activeProfileName}
            </span>
          </div>
          <button
            onClick={() => onOpenSubscriptionModal("profiles")}
            className="text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer"
          >
            ▼
          </button>
        </div>

        {/* Status Pill Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
          {/* GSheets Status */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50/80 border border-cyan-100 text-cyan-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
            <span>Sheets: <strong className="text-cyan-900">Connected</strong></span>
          </div>

          {/* AI Vision Key Status */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>AI Vision: <strong className="text-slate-900">Active Key</strong></span>
          </div>

          {/* Card Rules Count Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50/80 border border-cyan-100 text-cyan-800">
            <CreditCard className="w-3.5 h-3.5 text-cyan-600" />
            <span><strong>{cardRulesCount}</strong> Card Rules</span>
          </div>
        </div>
      </div>

      {/* ----------------- SECURITY GATE BANNER ----------------- */}
      <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Settings Security Gate is Active</span>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={requireBiometricsOnEntry}
              onChange={(e) => setRequireBiometricsOnEntry(e.target.checked)}
              className="w-4 h-4 rounded-md text-cyan-600 border-slate-300 focus:ring-cyan-500"
            />
            <span>Require Biometrics on Entry</span>
          </label>
        </div>

        <button
          onClick={onLockDashboard}
          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-2xs border border-emerald-200/50 self-start sm:self-center cursor-pointer"
        >
          Lock Settings
        </button>
      </div>

      {/* ----------------- CURRENT SUBSCRIPTION CARD ----------------- */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 text-white rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-teal-300 font-bold">
            Current Subscription
          </p>
          <h3 className="text-xl font-black tracking-tight">
            {subscriptionState.tier === "elite"
              ? "Elite Plan"
              : subscriptionState.tier === "pro"
              ? "Pro Plan"
              : "Free Starter Plan"}
          </h3>
          <p className="text-xs text-slate-300 font-medium">
            AI Scans Used: <span className="font-bold text-white">{subscriptionState.scansThisMonth}</span>
          </p>
        </div>

        <button
          onClick={() => onOpenSubscriptionModal("plans")}
          className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          Manage Plan
        </button>
      </div>

      {/* ----------------- CARD & PAYMENT ACCOUNT MATCHER SECTION ----------------- */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Card & Payment Account Matcher
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
              Link last 4 digits of payment cards or Cash receipts to automatically pre-select target account
            </p>
          </div>
        </div>

        {/* Auto-Select Checkbox */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center gap-2.5">
          <input
            type="checkbox"
            id="autoSelectAccount"
            checked={cardPaymentSettings.autoSelectAccount}
            onChange={(e) =>
              setCardPaymentSettings((prev) => ({
                ...prev,
                autoSelectAccount: e.target.checked,
              }))
            }
            className="w-4 h-4 rounded-md text-cyan-600 border-slate-300 focus:ring-cyan-500"
          />
          <label htmlFor="autoSelectAccount" className="text-xs font-bold text-slate-800 cursor-pointer">
            Auto-Select Account
          </label>
        </div>

        {/* Cash Payment Auto-Match Card */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-100/60 text-cyan-700">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                Cash Payment Auto-Match Rule
              </h4>
              <p className="text-[11px] text-slate-500">
                When OCR detects receipt was paid in Cash / Hotovost
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-bold text-slate-700 w-20">Assign to:</span>
            <select
              value={cardPaymentSettings.cashAccount}
              onChange={(e) =>
                setCardPaymentSettings((prev) => ({
                  ...prev,
                  cashAccount: e.target.value,
                }))
              }
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {accounts.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form: Add Card Rule */}
        <div className="bg-slate-50/30 border border-slate-100 rounded-2xl p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">
              Last 4 Digits <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 1234"
              maxLength={4}
              value={newLast4}
              onChange={(e) => setNewLast4(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">
              Linked Account <span className="text-rose-500">*</span>
            </label>
            <select
              value={newAccount}
              onChange={(e) => setNewAccount(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {accounts.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">
              Card Label (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Visa Debit"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            onClick={handleAddCardMapping}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Card Rule</span>
          </button>
        </div>

        {/* Existing Card Rule Mappings List */}
        {cardPaymentSettings.cardMappings.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <Layers className="w-3.5 h-3.5 text-cyan-600" />
              <span>Card Last 4 Digits Mappings</span>
            </div>

            <div className="space-y-2.5">
              {cardPaymentSettings.cardMappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-xs text-cyan-700 bg-cyan-50 border border-cyan-100 px-2.5 py-1 rounded-lg">
                      *{mapping.last4}
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        → Account: <span className="text-cyan-700">{mapping.account}</span>
                      </p>
                      {mapping.label && (
                        <p className="text-[11px] text-slate-400 font-medium">
                          {mapping.label}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveCardMapping(mapping.id)}
                    className="text-slate-300 hover:text-rose-600 p-1.5 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ----------------- GOOGLE SPREADSHEET ID SECTION ----------------- */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Google Spreadsheet ID
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Found in cell H1 of your Summary sheet
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Open Linked Document & Setup Guide */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={linkedDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Linked Document</span>
          </a>

          <button
            type="button"
            onClick={() => {
              if (onOpenHelp) {
                onOpenHelp();
              }
              setIsHelpOpen(true);
            }}
            className="flex-1 bg-cyan-50/80 hover:bg-cyan-100/80 text-cyan-800 border border-cyan-200/60 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
            <span>Setup Guide</span>
          </button>
        </div>

        {/* Input Field */}
        <div className="relative">
          <input
            type="text"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
            placeholder="Sheet ID"
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
          />
          <button
            onClick={handleCopySpreadsheetId}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
            title="Copy ID"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ----------------- DASHBOARD PRIVACY & SECURITY SECTION ----------------- */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Dashboard Privacy & Security Protection
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Require authentication to view balances and metrics
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => setSecEnabled(!secEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
              secEnabled ? "bg-cyan-600" : "bg-slate-200"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                secEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Authentication Methods Selection */}
        <div className="space-y-2.5 pt-1">
          <p className="text-xs font-extrabold text-slate-900">
            Select Authentication Method
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* PIN / Passcode */}
            <button
              type="button"
              onClick={() => setSecMethod("pin")}
              className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                secMethod === "pin"
                  ? "border-cyan-500 bg-cyan-50/40 text-slate-900 ring-1 ring-cyan-500"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
              }`}
            >
              <p className="text-xs font-extrabold">PIN / Passcode</p>
              <p className="text-[11px] text-slate-400">4 or 6-digit PIN</p>
            </button>

            {/* Password */}
            <button
              type="button"
              onClick={() => setSecMethod("password")}
              className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                secMethod === "password"
                  ? "border-cyan-500 bg-cyan-50/40 text-slate-900 ring-1 ring-cyan-500"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
              }`}
            >
              <p className="text-xs font-extrabold">Password</p>
              <p className="text-[11px] text-slate-400">Text Password</p>
            </button>

            {/* Pattern Grid */}
            <button
              type="button"
              onClick={() => setSecMethod("pattern")}
              className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                secMethod === "pattern"
                  ? "border-cyan-500 bg-cyan-50/40 text-slate-900 ring-1 ring-cyan-500"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
              }`}
            >
              <p className="text-xs font-extrabold">Pattern Grid</p>
              <p className="text-[11px] text-slate-400">Dot matrix code</p>
            </button>

            {/* Biometrics */}
            <button
              type="button"
              onClick={() => setSecMethod("biometrics")}
              className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                secMethod === "biometrics"
                  ? "border-cyan-500 bg-cyan-50/40 text-slate-900 ring-1 ring-cyan-500"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
              }`}
            >
              <p className="text-xs font-extrabold">Biometrics</p>
              <p className="text-[11px] text-slate-400">Touch / Face ID</p>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSaveSecurity}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Save Security Configuration</span>
          </button>

          <button
            onClick={onLockDashboard}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl transition-all text-center leading-tight min-w-[120px] cursor-pointer"
          >
            Lock Dashboard<br />Now
          </button>
        </div>
      </div>

      {/* ----------------- CATEGORIES & ACCOUNTS LIST MANAGEMENT ----------------- */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Categories & Accounts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize dropdown options for income and expense logs
            </p>
          </div>
        </div>

        <button
          onClick={onOpenManageLists}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 shadow-2xs cursor-pointer"
        >
          Manage Lists
        </button>
      </div>

      {/* Embedded Help Modal fallback so it opens independently even if parent handler is missing */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

    </div>
  );
};