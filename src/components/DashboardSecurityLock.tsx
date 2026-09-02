import React, { useState, useEffect } from "react";
import { DashboardSecurityConfig } from "../types";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { Lock, Unlock, Fingerprint, ShieldAlert, KeyRound, Eye, EyeOff } from "lucide-react";

interface DashboardSecurityLockProps {
  config: DashboardSecurityConfig;
  onSaveConfig: (newConfig: DashboardSecurityConfig) => void;
  securityConfig?: DashboardSecurityConfig;
  setSecurityConfig?: React.Dispatch<React.SetStateAction<DashboardSecurityConfig>>;
  isUnlocked: boolean;
  onUnlocked: () => void;
  onLockNow: () => void;
}

export const DashboardSecurityLock: React.FC<DashboardSecurityLockProps> = ({
  config,
  isUnlocked,
  onUnlocked,
  onLockNow
}) => {
  const [inputSecret, setInputSecret] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // Authenticate using Native Device Biometrics / System PIN
  const authenticateBiometrics = async () => {
    setErrorMsg("");
    try {
      const available = await NativeBiometric.isAvailable();
      
      if (available.isAvailable) {
        await NativeBiometric.verifyIdentity({
          reason: "Authenticate to access financial records",
          title: "App Lock",
          subtitle: "Verify Identity",
          description: "Use Fingerprint, Face ID, or Device PIN to unlock."
        });
        onUnlocked();
      } else {
        // Fallback: If biometrics aren't configured on device, try standard unlock
        onUnlocked();
      }
    } catch (err: any) {
      console.warn("Biometric verification canceled or failed:", err);
      setErrorMsg("Device authentication failed or canceled. Please enter your passcode.");
    }
  };

  useEffect(() => {
    if (config.enabled && !isUnlocked && config.lockMethod === "biometric") {
      authenticateBiometrics();
    }
  }, [config.enabled, isUnlocked, config.lockMethod]);

  if (!config.enabled) {
    return null;
  }

  if (isUnlocked) {
    return (
      <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between font-['Montserrat']">
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-extrabold">
          <Unlock className="w-4 h-4 text-emerald-600" />
          <span>Protected Content Unlocked</span>
        </div>
        <button
          type="button"
          onClick={onLockNow}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          Lock Now
        </button>
      </div>
    );
  }

  const handleVerifySecret = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (inputSecret.trim() === config.secret) {
      setInputSecret("");
      onUnlocked();
    } else {
      setErrorMsg("Invalid secret passcode. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-md mx-auto my-6 text-center font-['Montserrat']">
      <div className="w-14 h-14 bg-[#008FA5]/10 text-[#008FA5] rounded-2xl flex items-center justify-center mx-auto mb-4">
        {config.lockMethod === "biometric" ? (
          <Fingerprint className="w-8 h-8" />
        ) : (
          <Lock className="w-8 h-8" />
        )}
      </div>

      <h3 className="text-base font-extrabold text-[#121F3E]">
        Security Lock Active
      </h3>
      <p className="text-xs text-slate-500 font-medium mt-1 mb-5">
        Authentication required to view sensitive balance information and transaction logs.
      </p>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl mb-4 flex items-center gap-2 justify-center">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {config.lockMethod === "biometric" ? (
        <button
          type="button"
          onClick={authenticateBiometrics}
          className="w-full py-3 bg-[#008FA5] hover:bg-[#121F3E] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Fingerprint className="w-4 h-4" />
          <span>Unlock with Biometrics / Phone PIN</span>
        </button>
      ) : (
        <form onSubmit={handleVerifySecret} className="space-y-4">
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={inputSecret}
              onChange={(e) => setInputSecret(e.target.value)}
              placeholder={`Enter your ${config.lockMethod.toUpperCase()}`}
              className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 outline-none transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#008FA5] hover:bg-[#121F3E] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Screen</span>
          </button>
        </form>
      )}
    </div>
  );
};