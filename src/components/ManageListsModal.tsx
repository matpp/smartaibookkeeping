import React, { useState } from "react";
import { X, Plus, Edit2, Trash2, RotateCcw, Check, Tag, CreditCard, Search, AlertCircle } from "lucide-react";
import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS } from "../types";

interface ManageListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  accounts: string[];
  setAccounts: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ManageListsModal: React.FC<ManageListsModalProps> = ({
  isOpen,
  onClose,
  categories,
  setCategories,
  accounts,
  setAccounts
}) => {
  const [activeTab, setActiveTab] = useState<"categories" | "accounts">("categories");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newAccountInput, setNewAccountInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit states
  const [editingItem, setEditingItem] = useState<{ index: number; value: string } | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const showTempNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 2500);
  };

  // Category handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCategoryInput.trim();
    if (!val) return;
    if (categories.some((c) => c.toLowerCase() === val.toLowerCase())) {
      showTempNotice(`Category "${val}" already exists.`);
      return;
    }
    setCategories((prev) => [...prev, val]);
    setNewCategoryInput("");
    showTempNotice(`Added category "${val}"`);
  };

  const handleSaveEditCategory = (index: number) => {
    if (!editingItem) return;
    const val = editingItem.value.trim();
    if (!val) return;
    setCategories((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
    setEditingItem(null);
    showTempNotice(`Updated category to "${val}"`);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) {
      alert("You must keep at least one category.");
      return;
    }
    if (confirm(`Are you sure you want to delete category "${catToDelete}"?`)) {
      setCategories((prev) => prev.filter((c) => c !== catToDelete));
      showTempNotice(`Removed category "${catToDelete}"`);
    }
  };

  const handleResetCategories = () => {
    if (confirm("Reset all categories to the default list? Custom categories will be overwritten.")) {
      setCategories([...DEFAULT_CATEGORIES]);
      showTempNotice("Reset categories to defaults.");
    }
  };

  // Account handlers
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newAccountInput.trim();
    if (!val) return;
    if (accounts.some((a) => a.toLowerCase() === val.toLowerCase())) {
      showTempNotice(`Account "${val}" already exists.`);
      return;
    }
    setAccounts((prev) => [...prev, val]);
    setNewAccountInput("");
    showTempNotice(`Added account "${val}"`);
  };

  const handleSaveEditAccount = (index: number) => {
    if (!editingItem) return;
    const val = editingItem.value.trim();
    if (!val) return;
    setAccounts((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
    setEditingItem(null);
    showTempNotice(`Updated account to "${val}"`);
  };

  const handleDeleteAccount = (accToDelete: string) => {
    if (accounts.length <= 1) {
      alert("You must keep at least one account.");
      return;
    }
    if (confirm(`Are you sure you want to delete account "${accToDelete}"?`)) {
      setAccounts((prev) => prev.filter((a) => a !== accToDelete));
      showTempNotice(`Removed account "${accToDelete}"`);
    }
  };

  const handleResetAccounts = () => {
    if (confirm("Reset all accounts to default list (Cash, Account 1, Account 2, Account 3)?")) {
      setAccounts([...DEFAULT_ACCOUNTS]);
      showTempNotice("Reset accounts to defaults.");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAccounts = accounts.filter((a) =>
    a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Manage Categories & Accounts</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Customize dropdowns for entries & AI Vision OCR matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab("categories");
              setEditingItem(null);
              setSearchQuery("");
            }}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "categories"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("accounts");
              setEditingItem(null);
              setSearchQuery("");
            }}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "accounts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Accounts ({accounts.length})
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium transition-all"
            />
          </div>

          <button
            type="button"
            onClick={activeTab === "categories" ? handleResetCategories : handleResetAccounts}
            className="text-xs text-slate-600 hover:text-rose-600 font-bold flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 transition-all cursor-pointer shrink-0 shadow-2xs"
            title="Restore original defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>

        {/* Add Item Form */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 shrink-0">
          <form
            onSubmit={activeTab === "categories" ? handleAddCategory : handleAddAccount}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              required
              placeholder={
                activeTab === "categories"
                  ? "New category name (e.g. Gym, Subscriptions, Pet Care)"
                  : "New account name (e.g. Revolut, Wise, PayPal)"
              }
              value={activeTab === "categories" ? newCategoryInput : newAccountInput}
              onChange={(e) =>
                activeTab === "categories"
                  ? setNewCategoryInput(e.target.value)
                  : setNewAccountInput(e.target.value)
              }
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          {statusNotice && (
            <p className="text-[11px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {statusNotice}
            </p>
          )}
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[360px]">
          {activeTab === "categories" ? (
            filteredCategories.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No categories match "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredCategories.map((cat) => {
                  const actualIdx = categories.indexOf(cat);
                  const isEditing = editingItem?.index === actualIdx;

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200/90 bg-white hover:border-blue-200 transition-all shadow-2xs"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            autoFocus
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEditCategory(actualIdx);
                              if (e.key === "Escape") setEditingItem(null);
                            }}
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-blue-500 outline-none font-bold"
                          />
                          <button
                            onClick={() => handleSaveEditCategory(actualIdx)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            {cat}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingItem({ index: actualIdx, value: cat })}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit name"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : filteredAccounts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No accounts match "{searchQuery}"
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredAccounts.map((acc) => {
                const actualIdx = accounts.indexOf(acc);
                const isEditing = editingItem?.index === actualIdx;

                return (
                  <div
                    key={acc}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/90 bg-white hover:border-blue-200 transition-all shadow-2xs"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          autoFocus
                          value={editingItem.value}
                          onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEditAccount(actualIdx);
                            if (e.key === "Escape") setEditingItem(null);
                          }}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-blue-500 outline-none font-bold"
                        />
                        <button
                          onClick={() => handleSaveEditAccount(actualIdx)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-2 truncate">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          {acc}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingItem({ index: actualIdx, value: acc })}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit account name"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(acc)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            Changes apply immediately to form dropdowns & OCR auto-matching.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
