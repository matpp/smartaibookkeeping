import React, { useState } from "react";
import {
  FileSpreadsheet,
  Bot,
  LayoutDashboard,
  Settings,
  Info,
  CreditCard,
  Lock,
  Unlock,
  ScanLine,
  Zap,
  Menu,
  X,
  Repeat,
  LogIn,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { SubscriptionState } from "../types";
import { TIER_CONFIGS } from "../utils/subscription";
import { supabase, signInWithGoogle } from "../utils/supabase";

export type TabType = "scanner" | "dashboard" | "settings" | "info";

interface HeaderProps {
  hasWebhook: boolean;
  hasGeminiKey: boolean;
  ruleCount: number;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDashboardLocked?: boolean;
  isSecurityEnabled?: boolean;
  subscriptionState: SubscriptionState;
  onOpenSubscriptionModal: (tab?: "plans" | "profiles") => void;
  onSwitchProfile?: (profileId: string) => void;
  onOpenRecurringModal?: () => void;
  user: any;
  setIsAuthOpen: (open: boolean) => void;
  refreshQuotaKey: number;
}

export const Header: React.FC<HeaderProps> = ({
  hasWebhook,
  hasGeminiKey,
  ruleCount,
  activeTab,
  setActiveTab,
  isDashboardLocked,
  isSecurityEnabled,
  subscriptionState,
  onOpenSubscriptionModal,
  onOpenRecurringModal,
  user
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentTier = subscriptionState?.tier || "free";
  const currentConfig = TIER_CONFIGS[currentTier] || TIER_CONFIGS.free;

  const navItems: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: "scanner", label: "Receipt Scanner & Entry", icon: ScanLine },
    { id: "dashboard", label: "Financial Dashboard", icon: LayoutDashboard },
    { id: "settings", label: "Settings & Rules", icon: Settings },
    { id: "info", label: "Setup Guide", icon: Info }
  ];

  return (
    <header className="mb-6 border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 pt-3.5 pb-2.5 relative">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <BrandLogo size="md" showSubtext={true} />
            <button
              type="button"
              onClick={() => onOpenSubscriptionModal("plans")}
              className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#121F3E] text-white hover:bg-[#008FA5] transition-all cursor-pointer font-['Montserrat'] shadow-2xs"
              title="Click to upgrade or manage subscription"
            >
              <Zap className="w-3 h-3 text-[#00D2A0]" />
              <span className="uppercase">{currentConfig.name} PLAN</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-2 text-[#121F3E] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Status Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-2 mb-1">
          <div className="flex items-center gap-2 text-xs flex-wrap font-['Montserrat']">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200/90 bg-[#F4F8F8] text-slate-700 shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${hasWebhook ? "bg-[#00D2A0] shadow-xs" : "bg-amber-500"}`} />
              <FileSpreadsheet className={`w-3.5 h-3.5 ${hasWebhook ? "text-[#008FA5]" : "text-amber-500"}`} />
              <span className="font-semibold text-slate-500 text-[11px]">Sheets:</span>
              <span className={`font-bold text-[11px] ${hasWebhook ? "text-[#008FA5]" : "text-amber-700"}`}>
                {hasWebhook ? "Connected" : "Setup Needed"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200/90 bg-[#F4F8F8] text-slate-700 shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? "bg-[#008FA5] shadow-xs" : "bg-slate-400"}`} />
              <Bot className={`w-3.5 h-3.5 ${hasGeminiKey ? "text-[#008FA5]" : "text-slate-400"}`} />
              <span className="font-semibold text-slate-500 text-[11px]">AI Vision:</span>
              <span className={`font-bold text-[11px] ${currentTier === "free" ? "text-slate-700" : "text-[#121F3E]"}`}>
                {currentTier === "free" ? "Local OCR (Free)" : hasGeminiKey ? "Active Key" : "Server Ready"}
              </span>
            </div>

            {ruleCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[#008FA5]/20 bg-[#008FA5]/10 text-[#121F3E] font-bold text-[11px] shadow-2xs">
                <CreditCard className="w-3.5 h-3.5 text-[#008FA5]" />
                <span>{ruleCount} Card {ruleCount === 1 ? "Rule" : "Rules"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Navigation Menu */}
        {isMenuOpen && (
          <div className="absolute right-4 top-14 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-3 px-3 animate-in fade-in slide-in-from-top-2 flex flex-col gap-2">
            <div className="border-b border-slate-100 pb-3 px-1">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600 truncate">
                    <UserIcon className="w-4 h-4 text-[#008FA5] shrink-0" />
                    <span className="truncate font-semibold text-slate-800">{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      supabase.auth.signOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 w-full bg-rose-50 text-rose-600 hover:bg-rose-100 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    setIsMenuOpen(false);
                    try {
                      await signInWithGoogle();
                    } catch (err: any) {
                      console.error("Sign-in error:", err.message);
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 w-full bg-[#121F3E] text-white hover:bg-[#008FA5] py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer font-['Montserrat']"
                >
                  <LogIn className="w-4 h-4 text-[#00D2A0]" /> Sign In with Google
                </button>
              )}
            </div>

            <div className="my-0.5 border-t border-slate-100" />

            {/* Navigation Options */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDashboard = item.id === "dashboard";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-colors font-[#Montserrat] cursor-pointer ${
                    isActive
                      ? "bg-[#121F3E] text-white"
                      : "text-slate-700 hover:bg-[#F4F8F8] hover:text-[#121F3E]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#00D2A0]" : "text-[#008FA5]"}`} />
                    <span>{item.label}</span>
                  </div>

                  {isDashboard && isSecurityEnabled && (
                    <span className={`p-0.5 rounded-md ${isDashboardLocked ? "bg-amber-100 text-amber-900" : "bg-[#00D2A0]/20 text-[#00D2A0]"}`}>
                      {isDashboardLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="my-0.5 border-t border-slate-100" />

            {/* Recurring Transactions Trigger */}
            <button
              type="button"
              onClick={() => {
                if (onOpenRecurringModal) onOpenRecurringModal();
                setIsMenuOpen(false);
              }}
              className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold text-slate-700 hover:bg-[#F4F8F8] hover:text-[#121F3E] transition-colors font-['Montserrat'] cursor-pointer text-left"
            >
              <Repeat className="w-4 h-4 text-[#008FA5]" />
              <span>Manage Recurring Payments</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};