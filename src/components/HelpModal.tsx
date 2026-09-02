import React from "react";
import { X, HelpCircle, CheckCircle2, ExternalLink } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-2xl border border-cyan-100">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Quick Setup & Connection Guide</h3>
            <p className="text-xs text-slate-500">Follow these steps to link your Google Spreadsheet template with your mobile app</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 border-t border-slate-100 pt-4">
          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-2.5 flex-1">
              <p className="font-bold text-slate-900">1. Click the button below to copy the template to your Google Drive.</p>
              <a
                href="https://docs.google.com/spreadsheets/d/1QCf5wzK-ypqsj99MaCEG32gASHMKZVX9b3eIq7jRHuc/copy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Copy Template to Drive</span>
              </a>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">
                2. In the <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">Summary</code> sheet, type the year you want to log into cell <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">F1</code>.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">
                3. Copy your unique sheet ID from cell <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">H1</code> of the <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">Summary</code> sheet.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">
                4. Paste the sheet ID into the <span className="text-slate-900 underline font-extrabold">Settings</span> section of the app to complete the connection.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};