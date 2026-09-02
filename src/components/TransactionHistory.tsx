import React, { useState, useRef } from "react";
import { SavedTransaction, DashboardSecurityConfig, Category, Account, TransactionType } from "../types";
import { History, Download, Trash2, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Image as ImageIcon, Lock, Upload, AlertTriangle, Edit3, X, AlertOctagon } from "lucide-react";
import { DashboardSecurityLock } from "./DashboardSecurityLock";

interface TransactionHistoryProps {
  history: SavedTransaction[];
  setHistory?: React.Dispatch<React.SetStateAction<SavedTransaction[]>>;
  onClearHistory: () => void;
  onResend: (item: SavedTransaction) => void;
  onEditTransaction?: (item: SavedTransaction) => void;
  securityConfig?: DashboardSecurityConfig;
  setSecurityConfig?: (cfg: DashboardSecurityConfig) => void;
  isUnlocked?: boolean;
  onUnlocked?: () => void;
  onLockNow?: () => void;
  categories?: Category[];
  accounts?: Account[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  history,
  setHistory,
  onClearHistory,
  onResend,
  onEditTransaction,
  securityConfig,
  setSecurityConfig,
  isUnlocked = false,
  onUnlocked = () => {},
  onLockNow = () => {},
  categories = [],
  accounts = []
}) => {
  // Modal State Controls
  const [entryToDelete, setEntryToDelete] = useState<SavedTransaction | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<SavedTransaction | null>(null);
  const [entryToResend, setEntryToResend] = useState<SavedTransaction | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (history.length === 0) return null;

  // Check if security is enabled and currently locked
  const isSecurityProtected = Boolean(securityConfig?.enabled);

  if (isSecurityProtected && !isUnlocked && securityConfig) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-[#008FA5]/15 text-[#008FA5]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#121F3E] font-['Montserrat']">Recent Entry Activity Log (Protected)</h2>
            <p className="text-xs text-slate-500 font-medium">
              {history.length} logged transaction{history.length === 1 ? "" : "s"} hidden for privacy protection
            </p>
          </div>
        </div>

        <DashboardSecurityLock
          config={securityConfig}
          onSaveConfig={setSecurityConfig || (() => {})}
          isUnlocked={isUnlocked}
          onUnlocked={onUnlocked}
          onLockNow={onLockNow}
          title="Protected Activity Log"
          description="Enter your PIN, password, pattern, or biometrics to view entries & export CSV"
        />
      </div>
    );
  }

  // 1. Confirm and Delete Individual Entry
  const handleDeleteSingle = () => {
    if (!entryToDelete || !setHistory) return;
    setHistory((prev) => prev.filter((tx) => tx.id !== entryToDelete.id));
    setEntryToDelete(null);
  };

  // 2. Confirm Edit Action
  const handleConfirmEdit = () => {
    if (!entryToEdit) return;
    if (onEditTransaction) {
      onEditTransaction(entryToEdit);
    }
    setEntryToEdit(null);
  };

  // 3. Confirm Resubmission Action
  const handleConfirmResend = () => {
    if (!entryToResend) return;
    onResend(entryToResend);
    setEntryToResend(null);
  };

  // 4. Handle CSV File Upload & Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !setHistory) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) parseAndImportCsv(text);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const parseAndImportCsv = (rawData: string) => {
    try {
      const lines = rawData.split(/\r?\n/).filter((line) => line.trim() !== "");
      if (lines.length < 2) return;

      const newTransactions: SavedTransaction[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (cols.length >= 6) {
          const [date, vendor, typeStr, accountStr, categoryStr, amountStr] = cols;
          const parsedAmount = parseFloat(amountStr);

          if (!isNaN(parsedAmount)) {
            newTransactions.push({
              id: `csv-imported-${Date.now()}-${i}`,
              date: date || new Date().toISOString().split("T")[0],
              timestamp: new Date().toISOString(),
              time: "00:00:00",
              vendor: vendor || "Imported Vendor",
              type: (["Income", "Recurring Cost", "Variable Cost"].includes(typeStr) ? typeStr : "Variable Cost") as TransactionType,
              account: (accounts.includes(accountStr) ? accountStr : accounts[0] || "Cash") as Account,
              splits: [
                {
                  category: categories.includes(categoryStr) ? categoryStr : categories[0] || "Other",
                  amount: Math.abs(parsedAmount)
                }
              ],
              totalSignedAmount: parsedAmount,
              status: "local_only",
              note: "Imported via CSV log"
            });
          }
        }
      }

      if (newTransactions.length > 0 && setHistory) {
        setHistory((prev) => [...newTransactions, ...prev]);
      }
    } catch (err) {
      console.error("Failed to parse CSV log file", err);
    }
  };

  // 5. Export CSV Function with Android Native Permissions & Share Support
  const exportCSV = async () => {
    const headers = ["ID", "Timestamp", "Date", "Time", "Account", "Type", "Vendor", "Note", "TotalSignedAmount", "ReceiptUrl", "SplitsJSON"];
    const rows = history.map((h) => [
      h.id,
      h.timestamp,
      h.date,
      h.time || "",
      h.account,
      h.type,
      `"${h.vendor.replace(/"/g, '""')}"`,
      `"${(h.note || "").replace(/"/g, '""')}"`,
      h.totalSignedAmount,
      `"${h.receiptUrl || ""}"`,
      `"${JSON.stringify(h.splits).replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const fileName = `bookkeeping_export_${new Date().toISOString().split("T")[0]}.csv`;

    let isNativeMobile = false;
    try {
      const capacitorRef = (window as any).Capacitor;
      if (capacitorRef && typeof capacitorRef.isNativePlatform === "function") {
        isNativeMobile = capacitorRef.isNativePlatform();
      }
    } catch {
      isNativeMobile = false;
    }

    if (isNativeMobile) {
      try {
        const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
        const { Share } = await import("@capacitor/share");

        try {
          await Filesystem.requestPermissions();
        } catch (permErr) {
          console.warn("Permission request failed or not required:", permErr);
        }

        const writeFileResult = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        await Share.share({
          title: "Export CSV",
          text: "Here is your bookkeeping data export.",
          url: writeFileResult.uri,
          dialogTitle: "Export CSV Log"
        });
        return;
      } catch (nativeErr) {
        console.error("Native filesystem/share error:", nativeErr);
        alert("Native export failed. Check console for details.");
      }
    }

    // Standard web browser fallback download mechanism
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (webError) {
      console.error("Web export failed:", webError);
      alert("Could not export file automatically.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#008FA5]/15 text-[#008FA5]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#121F3E] font-['Montserrat']">Recent Entry Activity Log</h2>
            <p className="text-xs text-slate-500 font-medium">
              {history.length} logged transaction{history.length === 1 ? "" : "s"} submitted this session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-[#008FA5]/10 hover:bg-[#008FA5]/20 text-[#008FA5] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-['Montserrat']"
            title="Upload CSV log"
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>

          {isSecurityProtected && (
            <button
              type="button"
              onClick={onLockNow}
              className="px-3 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-['Montserrat']"
              title="Lock log & dashboard"
            >
              <Lock className="w-3.5 h-3.5" /> Lock Log
            </button>
          )}

          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-1.5 bg-[#F4F8F8] hover:bg-[#008FA5]/10 text-[#121F3E] hover:text-[#008FA5] text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs font-['Montserrat']"
          >
            <Download className="w-3.5 h-3.5 text-[#008FA5]" /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowClearAllModal(true)}
            className="px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-['Montserrat']"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Log
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/70">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-[#F4F8F8] text-[#121F3E] font-extrabold font-['Montserrat']">
              <th className="py-3 px-3.5 text-center">Status</th>
              <th className="py-3 px-3.5 text-center">Actions</th>
              <th className="py-3 px-3.5">Date & Time</th>
              <th className="py-3 px-3.5">Vendor / Payee</th>
              <th className="py-3 px-3.5">Account</th>
              <th className="py-3 px-3.5">Type</th>
              <th className="py-3 px-3.5">Category Splits</th>
              <th className="py-3 px-3.5 text-right">Signed Total</th>
              <th className="py-3 px-3.5 text-center">Receipt Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-800 bg-white">
            {history.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#F4F8F8]/60 transition-colors">
                <td className="py-3 px-3.5 text-center whitespace-nowrap">
                  {tx.status === "submitted" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#008FA5]/15 text-[#008FA5] font-bold border border-[#008FA5]/20 shadow-2xs font-['Montserrat']">
                      <CheckCircle2 className="w-3 h-3 text-[#00D2A0]" /> Sent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 shadow-2xs font-['Montserrat']">
                      <AlertCircle className="w-3 h-3 text-amber-600" /> Local
                    </span>
                  )}
                </td>
                <td className="py-3 px-3.5 text-center whitespace-nowrap space-x-1">
                  <button
                    type="button"
                    onClick={() => setEntryToResend(tx)}
                    className="p-1.5 text-slate-500 hover:text-[#008FA5] hover:bg-[#008FA5]/10 rounded-lg transition-colors cursor-pointer"
                    title="Resend to Google Sheets"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryToEdit(tx)}
                    className="p-1.5 text-slate-500 hover:text-[#008FA5] hover:bg-[#008FA5]/10 rounded-lg transition-colors cursor-pointer"
                    title="Edit transaction details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryToDelete(tx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete individual entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
                <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-600">
                  <div className="font-bold text-[#121F3E]">{tx.date}</div>
                  <div className="text-[10px] text-slate-400">{tx.time || "--:--:--"}</div>
                </td>
                <td className="py-3 px-3.5 font-bold text-[#121F3E]">
                  <div>{tx.vendor}</div>
                  {tx.note && <div className="text-[11px] text-slate-500 font-normal italic">{tx.note}</div>}
                </td>
                <td className="py-3 px-3.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#F4F8F8] border border-slate-200 text-[#121F3E] font-mono text-[11px] font-bold shadow-2xs">
                    {tx.account}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-slate-600 font-medium">{tx.type}</td>
                <td className="py-3 px-3.5 max-w-xs">
                  <div className="flex flex-wrap gap-1">
                    {tx.splits.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-[#008FA5]/10 text-[#121F3E] border border-[#008FA5]/20 font-medium"
                      >
                        <span className="font-bold">{s.category}:</span>
                        <span className="font-mono font-bold text-[#008FA5]">{s.amount.toFixed(2)}</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td
                  className={`py-3 px-3.5 text-right font-mono font-extrabold text-sm whitespace-nowrap ${
                    tx.totalSignedAmount < 0 ? "text-rose-600" : "text-[#008FA5]"
                  }`}
                >
                  {tx.totalSignedAmount >= 0 ? `+${tx.totalSignedAmount.toFixed(2)}` : tx.totalSignedAmount.toFixed(2)}
                </td>
                <td className="py-3 px-3.5 text-center whitespace-nowrap">
                  {tx.receiptUrl ? (
                    <a
                      href={tx.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-[#008FA5] hover:text-[#121F3E] bg-[#008FA5]/10 hover:bg-[#008FA5]/20 px-2.5 py-1 rounded-lg border border-[#008FA5]/20 font-bold transition-all shadow-2xs font-['Montserrat']"
                    >
                      <ImageIcon className="w-3 h-3 text-[#008FA5]" /> Proof <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal: Duplicate Entry Warning for Resubmission */}
      {entryToResend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-md w-full p-6 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#121F3E] font-['Montserrat']">
                    Duplicate Entry Warning
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Resubmitting: <span className="font-bold text-slate-700">{entryToResend.vendor}</span> ({entryToResend.date})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEntryToResend(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2 text-xs leading-relaxed text-amber-900">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Proceeding may result in duplicate entries!
              </p>
              <p className="text-amber-800/90 font-medium">
                Please double-check your Google Spreadsheet to ensure data accuracy and make sure this item hasn't already been logged before proceeding.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEntryToResend(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResend}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-md shadow-amber-600/20 transition-all cursor-pointer font-['Montserrat']"
              >
                Yes, Resend Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Edit Warning */}
      {entryToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-[#121F3E]">Edit Transaction Log?</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Loading <strong>{entryToEdit.vendor}</strong> into the form will let you modify details without re-scanning. Note that the previous entry must be <strong>deleted manually from your Google Sheets</strong>, and the updated record must be resubmitted. Attached receipt images/links will be preserved automatically.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEntryToEdit(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEdit}
                className="py-2.5 bg-[#008FA5] hover:bg-[#007385] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Proceed to Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Entry Warning */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-[#121F3E]">Delete Log Entry?</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Removing <strong>{entryToDelete.vendor}</strong> will directly affect your dashboard statistics, performance metrics, and sheet records.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSingle}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear Entire Log Warning */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-[#121F3E]">Clear Entire Activity Log?</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              This action will completely wipe your recent history list and reset summary metrics shown on your dashboard layout.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setShowClearAllModal(false);
                }}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};