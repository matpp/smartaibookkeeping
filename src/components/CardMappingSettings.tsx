import React, { useState } from "react";
import { CreditCard, Wallet, Plus, Trash2, Sliders, CheckCircle2 } from "lucide-react";
import { CardMapping, CardAndPaymentSettings } from "../types";

interface CardMappingSettingsProps {
  settings: CardAndPaymentSettings;
  setSettings: React.Dispatch<React.SetStateAction<CardAndPaymentSettings>>;
  accounts: string[];
}

export const CardMappingSettings: React.FC<CardMappingSettingsProps> = ({
  settings,
  setSettings,
  accounts
}) => {
  const [newLast4, setNewLast4] = useState("");
  const [newAccount, setNewAccount] = useState(accounts[0] || "Account 1");
  const [newLabel, setNewLabel] = useState("");
  const [formError, setFormError] = useState("");

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const clean4 = newLast4.trim();
    if (!/^\d{4}$/.test(clean4)) {
      setFormError("Please enter exactly 4 digits (e.g. 1234)");
      return;
    }

    if (!newAccount) {
      setFormError("Please select an account for this card.");
      return;
    }

    if (settings.cardMappings.some((m) => m.last4 === clean4)) {
      setFormError(`A rule for card ending in *${clean4} already exists.`);
      return;
    }

    const newRule: CardMapping = {
      id: `card-${Date.now()}`,
      last4: clean4,
      account: newAccount,
      label: newLabel.trim() || undefined
    };

    setSettings((prev) => ({
      ...prev,
      cardMappings: [...prev.cardMappings, newRule]
    }));

    setNewLast4("");
    setNewLabel("");
  };

  const handleRemoveRule = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      cardMappings: prev.cardMappings.filter((m) => m.id !== id)
    }));
  };

  const handleCashAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({
      ...prev,
      cashAccount: e.target.value
    }));
  };

  const handleToggleAutoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({
      ...prev,
      autoSelectAccount: e.target.checked
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-[#121F3E] flex items-center gap-2 font-['Montserrat']">
            <div className="p-1.5 rounded-xl bg-[#008FA5]/15 text-[#008FA5]">
              <CreditCard className="w-4 h-4" />
            </div>
            Card & Payment Account Matcher
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Link last 4 digits of payment cards or Cash receipts to automatically pre-select target account
          </p>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer bg-[#F4F8F8] hover:bg-[#008FA5]/10 px-3.5 py-2 rounded-xl border border-slate-200/80 transition-all shadow-2xs font-['Montserrat']">
          <input
            type="checkbox"
            checked={settings.autoSelectAccount}
            onChange={handleToggleAutoSelect}
            className="w-4 h-4 rounded-md text-[#008FA5] focus:ring-[#008FA5] border-slate-300"
          />
          <span className="text-xs font-extrabold text-[#121F3E]">Auto-Select Account</span>
        </label>
      </div>

      {/* Cash Payment Mapping Rule */}
      <div className="mb-6 bg-[#F4F8F8] p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#008FA5]/15 text-[#008FA5] flex items-center justify-center shrink-0 shadow-2xs">
              <Wallet className="w-5 h-5 text-[#008FA5]" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-[#121F3E] font-['Montserrat']">Cash Payment Auto-Match Rule</h3>
              <p className="text-xs text-slate-500 font-medium">When OCR detects receipt was paid in Cash / Hotovosť</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#121F3E] font-bold font-['Montserrat']">Assign to:</span>
            <select
              value={settings.cashAccount}
              onChange={handleCashAccountChange}
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#121F3E] focus:outline-none focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 shadow-2xs font-['Montserrat']"
            >
              {accounts.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Card Last 4 Digits Mapping Section */}
      <div>
        <h3 className="text-xs font-extrabold text-[#121F3E] uppercase tracking-wider mb-3 flex items-center gap-1.5 font-['Montserrat']">
          <Sliders className="w-4 h-4 text-[#008FA5]" />
          Card Last 4 Digits Mappings
        </h3>

        {/* Existing Card Rules List */}
        {settings.cardMappings.length === 0 ? (
          <div className="text-xs text-slate-500 font-medium bg-[#F4F8F8] p-4 rounded-2xl border border-dashed border-slate-200 text-center mb-4">
            No card mapping rules added yet. Add your card's last 4 digits below to automatically select accounts like Account 1, Account 2, or Account 3!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {settings.cardMappings.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-[#008FA5]/40 transition-all shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#008FA5]/10 text-[#008FA5] flex items-center justify-center font-mono text-xs font-black shrink-0 border border-[#008FA5]/20 shadow-2xs">
                    *{rule.last4}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#121F3E] flex items-center gap-1 font-['Montserrat']">
                      ➔ Account: <span className="text-[#008FA5]">{rule.account}</span>
                    </div>
                    {rule.label && <p className="text-[11px] text-slate-500 font-medium">{rule.label}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveRule(rule.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Card Rule Form */}
        <form onSubmit={handleAddRule} className="bg-[#F4F8F8] p-4 sm:p-5 rounded-2xl border border-slate-200/90">
          <h4 className="text-xs font-extrabold text-[#121F3E] mb-3 font-['Montserrat']">Add New Card Mapping Rule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-bold text-[#121F3E] mb-1 font-['Montserrat']">
                Last 4 Digits <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={4}
                value={newLast4}
                onChange={(e) => setNewLast4(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 1234"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#121F3E] focus:outline-none focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 placeholder:font-sans placeholder:font-normal"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#121F3E] mb-1 font-['Montserrat']">
                Linked Account <span className="text-rose-500">*</span>
              </label>
              <select
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#121F3E] focus:outline-none focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 font-['Montserrat']"
              >
                {accounts.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#121F3E] mb-1 font-['Montserrat']">
                Card Label (Optional)
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Visa Debit"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-[#121F3E] focus:outline-none focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20"
              />
            </div>
          </div>

          {formError && <p className="text-xs text-rose-600 font-bold mb-3">{formError}</p>}

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#121F3E] hover:bg-[#008FA5] text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm font-['Montserrat']"
          >
            <Plus className="w-4 h-4 text-[#00D2A0]" />
            Add Card Rule
          </button>
        </form>
      </div>
    </div>
  );
};
