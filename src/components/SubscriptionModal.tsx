import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Zap,
  Sparkles,
  Users,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Building,
  ScanLine,
  ArrowRight,
  Star
} from "lucide-react";
import { SubscriptionState, SubscriptionTier, UserProfile } from "../types";
import { TIER_CONFIGS } from "../utils/subscription";
import { supabase } from "../utils/supabase";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionState: SubscriptionState;
  onSelectTier: (tier: SubscriptionTier) => void;
  onCreateProfile: (name: string) => void;
  onRenameProfile: (id: string, newName: string) => void;
  onDeleteProfile: (id: string) => void;
  onSwitchProfile: (id: string) => void;
  initialTab?: "plans" | "profiles";
  upgradeReason?: "scan_limit" | "entry_limit" | "gemini_vision" | "multi_profile" | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscriptionState,
  onSelectTier,
  onCreateProfile,
  onRenameProfile,
  onDeleteProfile,
  onSwitchProfile,
  initialTab = "plans",
  upgradeReason = null
}) => {
  const [activeTab, setActiveTab] = useState<"plans" | "profiles">(initialTab);
  const [newProfileName, setNewProfileName] = useState("");
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  
  // Live Supabase count state
  const [supabaseScansCount, setSupabaseScansCount] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase
            .from("profiles")
            .select("ai_scans_used")
            .eq("id", session.user.id)
            .single()
            .then(({ data }) => {
              if (data) setSupabaseScansCount(data.ai_scans_used);
            });
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTier = subscriptionState.tier;
  const currentConfig = TIER_CONFIGS[currentTier];

  const handleAddProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    onCreateProfile(newProfileName.trim());
    setNewProfileName("");
  };

  const handleStartRename = (profile: UserProfile) => {
    setEditingProfileId(profile.id);
    setEditingName(profile.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      onRenameProfile(id, editingName.trim());
    }
    setEditingProfileId(null);
  };

  const currentScansUsed = supabaseScansCount ?? subscriptionState.scansThisMonth;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Subscription & Account Manager</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {currentConfig.name} Plan Active
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Choose the right tier for your scanning speed & multi-client bookkeeping needs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upgrade Reason Notice Bar */}
        {upgradeReason && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3 text-xs text-blue-900">
            <Zap className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="font-semibold">
              {upgradeReason === "scan_limit" && "You've reached your 10 free AI receipt scans limit on Supabase. Upgrade to unlock unlimited scans!"}
              {upgradeReason === "entry_limit" && "You've reached your monthly entry limit. Upgrade to Basic, Pro, or Elite for unlimited manual entries!"}
              {upgradeReason === "gemini_vision" && "Gemini AI Vision for receipts is available on Basic, Pro, and Elite plans. Upgrade now to unlock instant AI parsing!"}
              {upgradeReason === "multi_profile" && "Managing multiple client/business accounts under one login is an Elite Plan feature. Upgrade to Elite to enable multi-profiles!"}
            </p>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "plans"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${activeTab === "plans" ? "text-emerald-400" : "text-slate-500"}`} />
            Subscription Tiers
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profiles")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "profiles"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${activeTab === "profiles" ? "text-emerald-400" : "text-slate-500"}`} />
            Client Profiles {currentTier === "elite" && `(${subscriptionState.profiles.length})`}
            {currentTier !== "elite" && (
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-100 text-amber-900 border border-amber-200">
                Elite
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "plans" ? (
            <>
              {/* Current Monthly Usage Overview */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <ScanLine className="w-4 h-4 text-blue-600" />
                      Current Month Activity ({subscriptionState.currentMonthKey})
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold text-blue-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
                    Active Plan: {currentConfig.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Scan Progress */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-900 mb-1.5">
                      <span>Cloud AI Scans (Supabase Synced)</span>
                      <span>
                        {currentScansUsed} /{" "}
                        {currentConfig.limits.scansLimit === 999999 ? "∞ Unlimited" : currentConfig.limits.scansLimit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          currentConfig.limits.scansLimit !== 999999 &&
                          currentScansUsed >= currentConfig.limits.scansLimit
                            ? "bg-rose-500"
                            : "bg-blue-600"
                        }`}
                        style={{
                          width: `${
                            currentConfig.limits.scansLimit === 999999
                              ? 100
                              : Math.min(100, (currentScansUsed / currentConfig.limits.scansLimit) * 100)
                          }%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Manual Entries Progress */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-900 mb-1.5">
                      <span>Transaction Entries</span>
                      <span>
                        {subscriptionState.entriesThisMonth} /{" "}
                        {currentConfig.limits.entriesLimit === 999999 ? "∞ Unlimited" : currentConfig.limits.entriesLimit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          currentConfig.limits.entriesLimit !== 999999 &&
                          subscriptionState.entriesThisMonth >= currentConfig.limits.entriesLimit
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${
                            currentConfig.limits.entriesLimit === 999999
                              ? 100
                              : Math.min(100, (subscriptionState.entriesThisMonth / currentConfig.limits.entriesLimit) * 100)
                          }%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.keys(TIER_CONFIGS) as SubscriptionTier[]).map((tierKey) => {
                  const tier = TIER_CONFIGS[tierKey];
                  const isCurrent = currentTier === tierKey;

                  return (
                    <div
                      key={tierKey}
                      className={`relative flex flex-col justify-between rounded-2xl border transition-all p-5 ${
                        isCurrent
                          ? "bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-md"
                          : tier.isPopular
                          ? "bg-white border-amber-300 hover:border-blue-600 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {tier.isPopular && !isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-emerald-400 px-3 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                          <Star className="w-3 h-3 fill-emerald-400" /> MOST POPULAR
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              tierKey === "free"
                                ? "bg-slate-100 text-slate-700"
                                : tierKey === "basic"
                                ? "bg-blue-100 text-blue-800"
                                : tierKey === "pro"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {tier.badge}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              Active Plan
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900">{tier.name}</h3>
                        <div className="my-2">
                          <span className="text-xl font-extrabold text-slate-900">{tier.price}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mb-4 min-h-[32px]">{tier.description}</p>

                        <div className="space-y-2 border-t border-slate-100 pt-3 mb-6">
                          {tier.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <span className="font-medium leading-tight">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectTier(tierKey)}
                        disabled={isCurrent}
                        className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isCurrent
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-default"
                            : tierKey === "pro" || tierKey === "elite"
                            ? "bg-slate-900 hover:bg-blue-600 text-white shadow-xs"
                            : "bg-blue-600 hover:bg-slate-900 text-white shadow-xs"
                        }`}
                      >
                        {isCurrent ? (
                          "Current Active Plan"
                        ) : (
                          <>
                            <span>Select {tier.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Profiles Tab for Elite Tier */
            <div className="space-y-6">
              {currentTier !== "elite" ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Multi-Client Profiles (Elite Feature)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mt-1">
                      Manage separate transaction entry logs, card rules, and starting account balances for multiple clients or separate businesses under your authenticated Supabase login.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTier("elite")}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Upgrade to Elite Plan ($39.99/mo)
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <form onSubmit={handleAddProfileSubmit} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-600" />
                      Add New Client / Business Profile
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder="e.g. Client A - Acme Corp or Personal Account"
                        className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        Create Profile
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Your Client Profiles ({subscriptionState.profiles.length})
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {subscriptionState.profiles.map((profile) => {
                        const isActive = subscriptionState.activeProfileId === profile.id;
                        const isEditing = editingProfileId === profile.id;

                        return (
                          <div
                            key={profile.id}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              isActive
                                ? "bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                                isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                              }`}>
                                <Building className="w-4.5 h-4.5" />
                              </div>

                              {isEditing ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 w-full"
                                  />
                                  <button
                                    onClick={() => handleSaveRename(profile.id)}
                                    className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div className="truncate">
                                  <div className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                                    <span>{profile.name}</span>
                                    {isActive && (
                                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-600">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    Created: {new Date(profile.createdDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            {!isEditing && (
                              <div className="flex items-center gap-1 shrink-0">
                                {!isActive && (
                                  <button
                                    type="button"
                                    onClick={() => onSwitchProfile(profile.id)}
                                    className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-900 font-extrabold text-[11px] rounded-lg border border-slate-200 transition-all cursor-pointer"
                                  >
                                    Switch
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleStartRename(profile)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Rename Profile"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {!profile.isDefault && subscriptionState.profiles.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteProfile(profile.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Delete Profile"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Secure Supabase Cloud Subscription & Quota Tracking</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};