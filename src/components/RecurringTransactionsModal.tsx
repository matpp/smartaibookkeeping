import React, { useState } from "react";
import { X, Plus, Trash2, Repeat, Calendar, Check, AlertCircle, Edit2 } from "lucide-react";
import { RecurringRule, RecurrenceInterval, TransactionType } from "../types";
import { calculateNextRunDate } from "../utils/recurrence";

interface RecurringTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: RecurringRule[];
  setRules: React.Dispatch<React.SetStateAction<RecurringRule[]>>;
  accounts: string[];
  categories: string[];
}

export const RecurringTransactionsModal: React.FC<RecurringTransactionsModalProps> = ({
  isOpen,
  onClose,
  rules,
  setRules,
  accounts,
  categories
}) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("Recurring Cost");
  const [account, setAccount] = useState(accounts[0] || "Cash");
  const [category, setCategory] = useState(categories[0] || "Groceries");
  const [vendor, setVendor] = useState("");
  const [interval, setInterval] = useState<RecurrenceInterval>("monthly");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  
  const [recurrenceMode, setRecurrenceMode] = useState<"date" | "dayOfWeek">("date");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Track the rule being edited (null if creating a new rule)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddOrUpdateRule = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    if (!name.trim()) {
      setError("Please provide a rule name.");
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    const tempRule: Omit<RecurringRule, "id" | "nextRunDate"> = {
      name: name.trim(),
      amount: numericAmount,
      type,
      account,
      category,
      vendor: vendor.trim() || name.trim(),
      interval,
      startDate,
      dayOfWeek: recurrenceMode === "dayOfWeek" ? dayOfWeek : undefined,
      dayOfMonth: recurrenceMode === "date" ? dayOfMonth : undefined,
      active: true
    };

    if (editingRuleId) {
      // Update existing rule
      setRules((prev) =>
        prev.map((r) => {
          if (r.id === editingRuleId) {
            const nextRunDate = calculateNextRunDate(tempRule, startDate);
            return { ...r, ...tempRule, nextRunDate };
          }
          return r;
        })
      );
      setEditingRuleId(null);
    } else {
      // Create new rule
      const nextRunDate = calculateNextRunDate(tempRule, startDate);
      const newRule: RecurringRule = {
        ...tempRule,
        id: `rule-${Date.now()}`,
        nextRunDate
      };
      setRules((prev) => [...prev, newRule]);
    }

    // Reset Form
    setName("");
    setAmount("");
    setVendor("");
    setStartDate(new Date().toISOString().split("T")[0]);
  };

  const handleEditClick = (rule: RecurringRule) => {
    setEditingRuleId(rule.id);
    setName(rule.name);
    setAmount(rule.amount.toString());
    setType(rule.type);
    setAccount(rule.account);
    setCategory(rule.category);
    setVendor(rule.vendor || "");
    setInterval(rule.interval);
    setStartDate(rule.startDate || new Date().toISOString().split("T")[0]);

    if (rule.dayOfWeek !== undefined) {
      setRecurrenceMode("dayOfWeek");
      setDayOfWeek(rule.dayOfWeek);
    } else if (rule.dayOfMonth !== undefined) {
      setRecurrenceMode("date");
      setDayOfMonth(rule.dayOfMonth);
    }
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setName("");
    setAmount("");
    setVendor("");
    setStartDate(new Date().toISOString().split("T")[0]);
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    if (editingRuleId === id) {
      handleCancelEdit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#121F3E] text-[#00D2A0] rounded-xl">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#121F3E] font-['Montserrat']">
                Recurring Transactions
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Automate regular bills, subscriptions, or repeating income.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add / Edit Rule Form */}
          <form onSubmit={handleAddOrUpdateRule} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#121F3E] uppercase tracking-wider font-['Montserrat']">
                {editingRuleId ? "Edit Automation Rule" : "Create Automation Rule"}
              </h3>
              {editingRuleId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Netflix Subscription"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008FA5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. Netflix"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008FA5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008FA5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TransactionType)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008FA5]"
                >
                  <option value="Recurring Cost">Recurring Cost</option>
                  <option value="Variable Cost">Variable Cost</option>
                  <option value="Income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Account</label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008FA5]"
                >
                  {accounts.map((acc) => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008FA5]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Frequency</label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value as RecurrenceInterval)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008FA5]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly (Every 2 Weeks)</option>
                  <option value="monthly">Monthly</option>
                  <option value="bimonthly">Bi-monthly (Every 2 Months)</option>
                  <option value="quarterly">Quarterly (Every 3 Months)</option>
                  <option value="biyearly">Bi-yearly (Every 6 Months)</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008FA5]"
                />
              </div>

              <div className="col-span-1 sm:col-span-2 mt-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Schedule By Preference</label>
                <div className="flex bg-slate-200/70 p-1 rounded-lg w-full max-w-xs mb-3">
                  <button
                    type="button"
                    onClick={() => setRecurrenceMode("date")}
                    className={`flex-1 text-[11px] py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                      recurrenceMode === "date" ? "bg-white text-[#121F3E] shadow-xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Specific Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurrenceMode("dayOfWeek")}
                    className={`flex-1 text-[11px] py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                      recurrenceMode === "dayOfWeek" ? "bg-white text-[#121F3E] shadow-xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Day of Week
                  </button>
                </div>
              </div>

              {recurrenceMode === "dayOfWeek" ? (
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008FA5]"
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                </div>
              ) : (
                <div className="col-span-1 sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600">Target Day of Month</label>
                    <span className="text-[10px] font-semibold text-[#008FA5] bg-teal-50 px-2 py-0.5 rounded-full">
                      Day {dayOfMonth} {dayOfMonth === 1 ? "st" : dayOfMonth === 2 ? "nd" : dayOfMonth === 3 ? "rd" : "th"}
                    </span>
                  </div>
                  
                  {/* Horizontal Carousel Container */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const isSelected = dayOfMonth === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setDayOfMonth(day)}
                          className={`min-w-[34px] h-[36px] rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "bg-[#121F3E] text-[#00D2A0] shadow-sm scale-105"
                              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#121F3E] text-white hover:bg-[#008FA5] transition-colors rounded-xl text-xs font-bold flex items-center justify-center gap-2 font-['Montserrat'] cursor-pointer shadow-xs mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>{editingRuleId ? "Save Changes" : "Add Recurring Rule"}</span>
            </button>
          </form>

          {/* Active Rules List */}
          <div>
            <h3 className="text-xs font-bold text-[#121F3E] uppercase tracking-wider mb-3 font-['Montserrat']">
              Active Recurring Schedule ({rules.length})
            </h3>

            {rules.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">No recurring rules configured.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-3 bg-white border rounded-xl flex items-center justify-between transition-colors shadow-2xs ${
                      editingRuleId === rule.id ? "border-[#008FA5] ring-1 ring-[#008FA5]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          rule.active
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                        title={rule.active ? "Active (Click to pause)" : "Paused (Click to activate)"}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 font-['Montserrat']">
                            {rule.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                            {rule.interval}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>${rule.amount.toFixed(2)}</span>
                          <span>•</span>
                          <span>{rule.account}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#008FA5]" />
                            Next: {rule.nextRunDate || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditClick(rule)}
                        className="p-1.5 text-slate-400 hover:text-[#008FA5] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};