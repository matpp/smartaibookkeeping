import React from "react";
import { TRANSACTION_TYPES, Account, TransactionType, SplitRow, Category, SubscriptionState } from "../types";
import { TIER_CONFIGS } from "../utils/subscription";
import {
  Plus,
  Trash2,
  Send,
  Calendar,
  Clock,
  Building,
  CreditCard,
  Tag,
  Settings2,
  Calculator,
  FileText,
  CheckCircle2,
  Lock
} from "lucide-react";

interface TransactionFormProps {
  txDate: string;
  setTxDate: (d: string) => void;
  txTime: string;
  setTxTime: (t: string) => void;
  txAccount: Account | "";
  setTxAccount: (a: Account | "") => void;
  autoMatchedInfo?: string | null;
  txType: TransactionType | "";
  setTxType: (t: TransactionType | "") => void;
  txVendor: string;
  setTxVendor: (v: string) => void;
  txNote: string;
  setTxNote: (n: string) => void;
  hasReceiptImage?: boolean;
  receiptFileName?: string;
  splits: SplitRow[];
  setSplits: React.Dispatch<React.SetStateAction<SplitRow[]>>;
  accounts: string[];
  categories: string[];
  onOpenManageLists: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  subscriptionState?: SubscriptionState;
  onTriggerUpgrade?: (reason: "scan_limit" | "entry_limit" | "gemini_vision" | "multi_profile") => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  txDate,
  setTxDate,
  txTime,
  setTxTime,
  txAccount,
  setTxAccount,
  autoMatchedInfo,
  txType,
  setTxType,
  txVendor,
  setTxVendor,
  txNote,
  setTxNote,
  hasReceiptImage,
  receiptFileName,
  splits,
  setSplits,
  accounts,
  categories,
  onOpenManageLists,
  onSubmit,
  isSubmitting,
  subscriptionState,
  onTriggerUpgrade
}) => {
  const currentTier = subscriptionState?.tier || "free";
  const tierConfig = TIER_CONFIGS[currentTier];
  const isEntryLimitReached =
    subscriptionState &&
    tierConfig.limits.entriesLimit !== 999999 &&
    subscriptionState.entriesThisMonth >= tierConfig.limits.entriesLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEntryLimitReached && onTriggerUpgrade) {
      onTriggerUpgrade("entry_limit");
      return;
    }

    onSubmit(e);
  };

  const addSplitRow = (category: Category | "" = "", amount = "") => {
    const newRow: SplitRow = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category,
      amount
    };
    setSplits((prev) => [...prev, newRow]);
  };

  const removeSplitRow = (id: string) => {
    if (splits.length === 1) {
      alert("A transaction must have at least one category split row.");
      return;
    }
    setSplits((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSplit = (id: string, field: "category" | "amount", value: string) => {
    setSplits((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Memoized total computations to prevent input lag on keystrokes
  const { signedTotal, isCost } = React.useMemo(() => {
    const cost = txType === "Recurring Cost" || txType === "Reocuring Cost" || txType === "Variable Cost";
    let sum = 0;
    for (let i = 0; i < splits.length; i++) {
      const val = Math.abs(parseFloat(splits[i].amount) || 0);
      if (!isNaN(val)) sum += val;
    }
    const signed = cost ? -Math.abs(sum) : Math.abs(sum);
    return { rawSum: sum, signedTotal: signed, isCost: cost };
  }, [splits, txType]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="w-full">
          <h2 className="text-sm font-extrabold text-[#121F3E] flex items-center gap-2 font-['Montserrat']">
            <span className="w-5 h-5 rounded-md bg-[#008FA5]/15 text-[#008FA5] flex items-center justify-center text-xs font-mono font-extrabold">
              2
            </span>
            Transaction Details & Category Allocation
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 w-full">
            Verify AI-extracted values, set account & category allocations before logging
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onOpenManageLists}
            className="text-xs font-bold text-[#008FA5] hover:text-[#121F3E] bg-[#008FA5]/10 hover:bg-[#008FA5]/20 px-3.5 py-2 rounded-xl border border-[#008FA5]/20 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs font-['Montserrat']"
          >
            <Settings2 className="w-3.5 h-3.5" /> Manage Categories & Accounts
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#121F3E] flex items-center gap-1.5 font-['Montserrat']">
              <Calendar className="w-3.5 h-3.5 text-[#008FA5]" />
              Date (YYYY-MM-DD)
            </label>
            <input
              type="date"
              required
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F8F8]/60 focus:bg-white focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 outline-none transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#121F3E] flex items-center gap-1.5 font-['Montserrat']">
              <Clock className="w-3.5 h-3.5 text-[#008FA5]" />
              Time (HH:MM:SS)
            </label>
            <input
              type="time"
              step="1"
              required
              value={txTime}
              onChange={(e) => setTxTime(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F8F8]/60 focus:bg-white focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 outline-none transition-all font-mono font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#121F3E] flex items-center justify-between font-['Montserrat']">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#008FA5]" />
                Target Account
              </span>
            </label>
            <select
              required
              value={txAccount}
              onChange={(e) => setTxAccount(e.target.value as Account)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F8F8]/60 focus:bg-white focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 outline-none transition-all font-bold text-[#121F3E]"
            >
              <option value="">-- Select Account --</option>
              {accounts.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
            {autoMatchedInfo && (
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#008FA5] bg-[#008FA5]/10 px-2.5 py-1 rounded-lg border border-[#008FA5]/20 shadow-2xs font-['Montserrat']">
                <span>⚡ Auto-matched: {autoMatchedInfo}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#121F3E] flex items-center gap-1.5 font-['Montserrat']">
              <Tag className="w-3.5 h-3.5 text-[#008FA5]" />
              Transaction Type
            </label>
            <select
              required
              value={txType}
              onChange={(e) => setTxType(e.target.value as TransactionType)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F8F8]/60 focus:bg-white focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 outline-none transition-all font-medium text-slate-800"
            >
              <option value="">-- Select Type --</option>
              {TRANSACTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#121F3E] flex items-center gap-1.5 font-['Montserrat']">
              <Building className="w-3.5 h-3.5 text-[#008FA5]" />
              Vendor / Payee
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Lidl, Tesco, Employer"
              value={txVendor}
              onChange={(e) => setTxVendor(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F8F8]/60 focus:bg-white focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 outline-none transition-all font-medium text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#121F3E] flex items-center gap-1.5 font-['Montserrat']">
              <FileText className="w-3.5 h-3.5 text-[#008FA5]" />
              Note / Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly grocery run"
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F8F8]/60 focus:bg-white focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 outline-none transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        {hasReceiptImage && (
          <div className="bg-[#008FA5]/10 border border-[#008FA5]/20 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#008FA5] text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#00D2A0]" />
              </div>
              <div>
                <span className="font-extrabold text-[#121F3E] block font-['Montserrat']">
                  Receipt Photo Attached
                </span>
                <span className="font-mono text-[#008FA5] text-[11px] font-bold">
                  {receiptFileName || "Image ready for Google Drive"}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#121F3E] bg-white/80 px-3 py-1 rounded-xl border border-[#008FA5]/20 shadow-2xs font-['Montserrat']">
              📁 Uploads to Drive Root &gt; Year &gt; Month
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold text-[#121F3E] uppercase tracking-wider flex items-center gap-1.5 font-['Montserrat']">
              Category Allocation Splits
            </h3>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Itemize single purchase into multiple category tabs
            </span>
          </div>

          <div className="space-y-2.5 mb-3">
            {splits.map((row) => (
              <div key={row.id} className="flex items-center gap-2.5 p-2 bg-[#F4F8F8] rounded-xl border border-slate-200/80">
                <div className="flex-1">
                  <select
                    required
                    value={row.category}
                    onChange={(e) => updateSplit(row.id, "category", e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-[#008FA5] focus:ring-1 focus:ring-[#008FA5] outline-none transition-all font-semibold text-slate-800"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-36 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono font-bold">
                    {isCost ? "-" : "+"}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={row.amount}
                    onChange={(e) => updateSplit(row.id, "amount", e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-[#008FA5] focus:ring-1 focus:ring-[#008FA5] outline-none transition-all font-mono font-bold text-[#121F3E]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeSplitRow(row.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Remove split"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addSplitRow()}
            className="text-xs font-bold text-[#008FA5] hover:text-[#121F3E] bg-[#008FA5]/10 hover:bg-[#008FA5]/20 px-3.5 py-2 rounded-xl border border-[#008FA5]/20 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs font-['Montserrat']"
          >
            <Plus className="w-3.5 h-3.5" /> Add Category Split
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-[#121F3E] text-white px-4 py-3 rounded-2xl w-full sm:w-auto shadow-md">
            <div className="p-2 rounded-xl bg-[#008FA5]/30 text-[#00D2A0]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-['Montserrat']">
                Google Sheets Amount (Signed)
              </p>
              <p
                className={`text-xl font-extrabold font-mono tracking-tight ${
                  signedTotal < 0 ? "text-rose-400" : signedTotal > 0 ? "text-[#00D2A0]" : "text-white"
                }`}
              >
                {signedTotal >= 0 ? `+${signedTotal.toFixed(2)}` : signedTotal.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-7 py-3.5 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-['Montserrat'] ${
              isEntryLimitReached
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                : "bg-gradient-to-r from-[#121F3E] via-[#008FA5] to-[#007085] hover:brightness-110 shadow-[#008FA5]/20"
            }`}
          >
            {isEntryLimitReached ? (
              <>
                <Lock className="w-4 h-4 text-amber-300" />
                Entry Limit Reached ({subscriptionState?.entriesThisMonth}/25 Free) - Upgrade Plan
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#00D2A0]" />
                {isSubmitting ? "Sending to Google Sheets..." : "Send Entry to Google Sheets"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};