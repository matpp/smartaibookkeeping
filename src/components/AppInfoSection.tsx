import React from "react";
import {
  ExternalLink,
  FileSpreadsheet,
  Bot,
  CreditCard,
  Smartphone,
  Zap,
  Sparkles
} from "lucide-react";

export const AppInfoSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* App Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#121F3E] text-white flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5 text-[#00D2A0]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#121F3E] font-['Montserrat']">Smart AI Bookkeeping Pro</h2>
            <p className="text-xs text-slate-500 font-medium">
              Automated Receipt OCR, Gemini AI Vision, Card Account Matching & Google Sheets Integration
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F8F8] border border-slate-200/80 space-y-2 shadow-2xs">
            <div className="font-extrabold text-[#121F3E] flex items-center gap-2 text-xs font-['Montserrat']">
              <div className="p-1 rounded-lg bg-[#008FA5]/15 text-[#008FA5]">
                <Bot className="w-3.5 h-3.5" />
              </div>
              Gemini Vision AI Engine
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              Extracts line items, itemized net totals, vendor names, dates, payment method, and card last 4 digits using <strong>Gemini AI</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F4F8F8] border border-slate-200/80 space-y-2 shadow-2xs">
            <div className="font-extrabold text-[#121F3E] flex items-center gap-2 text-xs font-['Montserrat']">
              <div className="p-1 rounded-lg bg-[#008FA5]/15 text-[#008FA5]">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              Smart Account Matching
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              Define rules for card last 4 digits (e.g. *1234 ➔ Account 1) and cash payments. Target accounts are auto-matched on receipt scans!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F4F8F8] border border-slate-200/80 space-y-2 shadow-2xs">
            <div className="font-extrabold text-[#121F3E] flex items-center gap-2 text-xs font-['Montserrat']">
              <div className="p-1 rounded-lg bg-[#008FA5]/15 text-[#008FA5]">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              Standalone APK & Mobile
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              Designed with GET query parameters & image beacon fallbacks for instant data submission without CORS blocks.
            </p>
          </div>
        </div>
      </div>

      {/* Target Spreadsheet Link */}
      <div className="bg-[#008FA5]/10 border border-[#008FA5]/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#008FA5] text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-[#121F3E] font-['Montserrat']">Target Google Spreadsheet Template</span>
            <p className="text-[#008FA5] font-semibold mt-0.5">Includes built-in Apps Script code—no manual coding required!</p>
          </div>
        </div>

        <a
          href="https://docs.google.com/spreadsheets/d/1QCf5wzK-ypqsj99MaCEG32gASHMKZVX9b3eIq7jRHuc/copy"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-[#008FA5] hover:bg-[#121F3E] text-white font-extrabold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer font-['Montserrat']"
        >
          Copy Template
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      {/* Setup Guide */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-[#121F3E] flex items-center gap-2 font-['Montserrat']">
            <div className="p-1.5 rounded-lg bg-[#008FA5]/15 text-[#008FA5]">
              <Zap className="w-4 h-4" />
            </div>
            Quick Setup & Connection Guide
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Follow these steps to link your Google Spreadsheet template with your mobile app
          </p>
        </div>

        <ol className="list-decimal list-inside space-y-3 text-xs text-slate-700 font-medium leading-relaxed bg-[#F4F8F8] p-4.5 rounded-2xl border border-slate-200/90">
          <li>
            Click the <strong>Copy Template</strong> button above and make a copy of the template to your own Google Drive.
          </li>
          <li>
            In the <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-bold">Summary</code> sheet, type the year you want to log into cell <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-bold">F1</code>.
          </li>
          <li>
            Copy your unique sheet ID from cell <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-bold">H1</code> of the <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-bold">Summary</code> sheet.
          </li>
          <li>
            Paste the sheet ID into the <strong>Settings</strong> section of the app to complete the connection[cite: 3].
          </li>
        </ol>
      </div>
    </div>
  );
};