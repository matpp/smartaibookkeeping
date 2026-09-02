import React, { useState } from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtext?: boolean;
  lightMode?: boolean;
  shape?: "rounded" | "round" | "square";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showSubtext = true,
  lightMode = false,
  shape = "rounded",
}) => {
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const shapeClasses = {
    rounded: "rounded-2xl",
    round: "rounded-full",
    square: "rounded-lg",
  };

  const titleSizes = {
    sm: "text-base tracking-tight",
    md: "text-xl tracking-tight",
    lg: "text-2xl tracking-tight",
  };

  const subtextSizes = {
    sm: "text-[9px] tracking-[0.2em]",
    md: "text-[10px] tracking-[0.22em]",
    lg: "text-xs tracking-[0.25em]",
  };

  return (
    <div className="flex items-center gap-2.5 select-none group cursor-pointer">
      {/* Official SmartAI App Icon with Full-Bleed Gradient */}
      <div
        className={`${iconSizes[size]} ${shapeClasses[shape]} shrink-0 relative overflow-hidden shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md border border-[#008FA5]/30 bg-gradient-to-br from-[#121F3E] via-[#0B3549] to-[#004F5E] flex items-center justify-center`}
      >
        {!imageError ? (
          <img
            src="/app-logo.png"
            alt="SmartAI Bookkeeping Logo"
            className={`w-full h-full object-cover ${shapeClasses[shape]}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-Fidelity Circuit Monogram with Gradient Fill */
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#121F3E] via-[#0B3549] to-[#004F5E] ${shapeClasses[shape]}`}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-4/5 h-4/5 text-white relative z-10 p-1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Circuit Outer Arcs */}
              <path
                d="M 68 24 C 68 15 56 12 44 12 C 28 12 18 22 18 36 C 18 52 34 56 50 62 C 68 68 80 74 80 88 C 80 102 66 110 44 110"
                stroke="#FFFFFF"
                strokeWidth="7"
                strokeLinecap="round"
                transform="scale(0.78) translate(14, -4)"
              />
              {/* Parallel Circuit Loop */}
              <path
                d="M 60 22 C 60 16 50 14 42 14 C 28 14 20 22 20 32 C 20 44 32 48 44 52"
                stroke="#00D2A0"
                strokeWidth="5"
                strokeLinecap="round"
                transform="scale(0.78) translate(14, -4)"
              />
              {/* Circuit Nodes */}
              <circle cx="70" cy="18" r="4.5" fill="#FFFFFF" />
              <circle cx="28" cy="80" r="4.5" fill="#00D2A0" />
              {/* Central Integrated Checkmark */}
              <path
                d="M 38 48 L 47 57 L 64 38"
                stroke="#FFFFFF"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col">
        <span
          className={`font-black font-['Montserrat'] leading-none ${titleSizes[size]} ${
            lightMode ? "text-white" : "text-[#121F3E]"
          }`}
        >
          SMART<span className="text-[#008FA5]">AI</span>
        </span>
        {showSubtext && (
          <span
            className={`font-extrabold font-['Montserrat'] ${subtextSizes[size]} uppercase mt-0.5 ${
              lightMode ? "text-[#00D2A0]" : "text-[#008FA5]"
            }`}
          >
            BOOKKEEPING APP
          </span>
        )}
      </div>
    </div>
  );
};
