import React from "react";
import { Building, ChevronDown, Plus, Users, Sparkles } from "lucide-react";
import { SubscriptionState, UserProfile } from "../types";

interface ProfileSwitcherProps {
  subscriptionState: SubscriptionState;
  onSwitchProfile: (id: string) => void;
  onOpenProfileManager: () => void;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  subscriptionState,
  onSwitchProfile,
  onOpenProfileManager
}) => {
  const isElite = subscriptionState.tier === "elite";
  const activeProfile =
    subscriptionState.profiles.find((p) => p.id === subscriptionState.activeProfileId) ||
    subscriptionState.profiles[0] ||
    { id: "default", name: "Main Profile" };

  if (!isElite) {
    return (
      <div className="inline-flex items-center gap-2 bg-[#F4F8F8] px-3 py-1.5 rounded-xl border border-slate-200/90 text-xs font-['Montserrat']">
        <Building className="w-3.5 h-3.5 text-[#008FA5]" />
        <span className="font-extrabold text-[#121F3E] truncate max-w-[140px]">{activeProfile.name}</span>
        <button
          type="button"
          onClick={onOpenProfileManager}
          className="ml-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#008FA5]/15 text-[#008FA5] hover:bg-[#008FA5] hover:text-white transition-all cursor-pointer flex items-center gap-1"
          title="Upgrade to Elite for multi-client profiles"
        >
          <Sparkles className="w-3 h-3 text-[#00D2A0]" /> Multi-Client
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#008FA5]/30 text-xs shadow-2xs font-['Montserrat']">
      <div className="flex items-center gap-1.5 text-[#121F3E]">
        <Building className="w-3.5 h-3.5 text-[#008FA5]" />
        <span className="text-[10px] font-bold text-slate-400 uppercase">Profile:</span>
        <select
          value={subscriptionState.activeProfileId}
          onChange={(e) => {
            if (e.target.value === "__new_profile__") {
              onOpenProfileManager();
            } else {
              onSwitchProfile(e.target.value);
            }
          }}
          className="bg-transparent font-extrabold text-[#121F3E] focus:outline-none cursor-pointer text-xs pr-1"
        >
          {subscriptionState.profiles.map((profile) => (
            <option key={profile.id} value={profile.id} className="text-[#121F3E]">
              {profile.name}
            </option>
          ))}
          <option value="__new_profile__" className="text-[#008FA5] font-bold">
            + Manage / Add Client Profiles...
          </option>
        </select>
      </div>
    </div>
  );
};
