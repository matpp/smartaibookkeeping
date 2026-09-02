import React, { useState } from "react";
import { 
  Settings, 
  Key, 
  Link2, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Tag, 
  FileSpreadsheet, 
  Copy, 
  HelpCircle,
  Clock,
  Code
} from "lucide-react";

interface SetupCardProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  onOpenHelp: () => void;
  onOpenManageLists?: () => void;
}

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data.account || "Cash";
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    var date = data.date;
    var time = data.time;
    var type = data.type;
    var vendor = data.vendor;
    var note = data.note;
    
    data.splits.forEach(function(split) {
      sheet.appendRow([date, time, type, vendor, split.category, split.amount, note]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      sheet: sheetName,
      rowsAdded: data.splits.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

const TEMPLATE_COPY_URL = "https://docs.google.com/spreadsheets/d/1QCf5wzK-ypqsj99MaCEG32gASHMKZVX9b3eIq7jRHuc/copy";
const TEMPLATE_VIEW_URL = "https://docs.google.com/spreadsheets/d/1QCf5wzK-ypqsj99MaCEG32gASHMKZVX9b3eIq7jRHuc/edit?usp=sharing";

export const SetupCard: React.FC<SetupCardProps> = ({
  webhookUrl,
  setWebhookUrl,
  geminiApiKey,
  setGeminiApiKey,
  onOpenHelp,
  onOpenManageLists
}) => {
  const [isOpen, setIsOpen] = useState(!webhookUrl);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("gsheet_webhook_url", webhookUrl.trim());
    localStorage.setItem("gemini_api_key", geminiApiKey.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const copyScriptCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 transition-all">
      <div
        className="px-5 py-4 bg-slate-50/80 hover:bg-slate-100/50 border-b border-slate-200/80 flex items-center justify-between cursor-pointer select-none transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#008FA5]/15 text-[#008FA5]">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#121F3E] flex items-center gap-2 font-['Montserrat']">
              System Connections & Webhook Config
              {webhookUrl && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#008FA5] bg-[#008FA5]/10 px-2.5 py-0.5 rounded-full border border-[#008FA5]/20 shadow-2xs">
                  <Check className="w-3 h-3 text-[#00D2A0]" /> Connected
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Google Apps Script Web App URL & optional Gemini AI Vision key
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
          {/* Template Copy & Code Banner */}
          <div className="p-4 bg-[#008FA5]/10 border border-[#008FA5]/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#121F3E] shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#008FA5] text-white rounded-xl shrink-0 shadow-xs">
                <FileSpreadsheet className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#121F3E] font-['Montserrat']">Official Google Sheet Template & Script</h4>
                <p className="text-[11px] text-[#008FA5] font-semibold">
                  Includes built-in Apps Script deployment code, Summary tab, and triggers
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowCodeModal(true)}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-[#121F3E] border border-slate-300 font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all font-['Montserrat']"
              >
                <Code className="w-3.5 h-3.5 text-[#008FA5]" />
                <span>View Script Code</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#008FA5] border border-[#008FA5]/30 font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all font-['Montserrat']"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showGuide ? "Hide Setup Steps" : "Setup Instructions"}</span>
              </button>

              <a
                href={TEMPLATE_COPY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#008FA5] hover:bg-[#121F3E] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer font-['Montserrat']"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Template</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          </div>

          {/* Quick Setup Instructions Box */}
          {showGuide && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-sans text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-[#121F3E]">
                <Clock className="w-4 h-4 text-[#008FA5]" />
                <span>Step-by-Step Setup Guide:</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600">
                <li>
                  Click <strong>"Copy Template"</strong> above to copy the spreadsheet to your Google Drive[cite: 1].
                </li>
                <li>
                  Open your Google Sheet, go to the <strong>Summary</strong> tab, and set your target year in cell <strong>F1</strong>.
                </li>
                <li>
                  In the top menu, navigate to <strong>Extensions &gt; Apps Script</strong>. If it's empty, click <strong>"View Script Code"</strong> above, copy it, and paste it into the editor.
                </li>
                <li>
                  Click on the <strong>Triggers</strong> icon (clock symbol) on the left sidebar and set up the 4 automation triggers matching <code className="bg-slate-100 px-1 py-0.5 rounded">From spreadsheet - On change</code>[cite: 2]:
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 font-mono text-[10px] text-slate-800">
                    <li>SUM_BY_CATEGORY_MONTH[cite: 2]</li>
                    <li>syncAccountColumns[cite: 2]</li>
                    <li>syncCategoriesToMonthlyExpenses[cite: 2]</li>
                    <li>syncSummarySheet[cite: 2]</li>
                  </ul>
                </li>
                <li>
                  Click <strong>Deploy &gt; New deployment</strong>, select type <strong>Web app</strong>, choose <span className="italic">Me</span> for execution and <span className="italic">Anyone</span> for access, then click <strong>Deploy</strong>.
                </li>
                <li>
                  Copy the generated <strong>Web App URL</strong> and paste it into the field below[cite: 1].
                </li>
              </ol>
            </div>
          )}

          {/* Script Code Modal Viewer */}
          {showCodeModal && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden border border-slate-200">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#008FA5]" />
                    <h3 className="text-xs font-extrabold text-[#121F3E] font-['Montserrat']">Google Apps Script Deployment Code</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCodeModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 bg-slate-940 text-slate-200 font-mono text-[11px] leading-relaxed">
                  <pre className="whitespace-pre-wrap">{APPS_SCRIPT_CODE}</pre>
                </div>
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Paste this code inside Extensions &gt; Apps Script.</span>
                  <button
                    type="button"
                    onClick={copyScriptCode}
                    className="px-4 py-2 bg-[#008FA5] hover:bg-[#121F3E] text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shadow-xs font-['Montserrat']"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedCode ? "Copied Code!" : "Copy Full Code"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#121F3E] flex items-center justify-between font-['Montserrat']">
                <span className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#008FA5]" />
                  Google Apps Script Web App URL:
                </span>
                <button
                  type="button"
                  onClick={onOpenHelp}
                  className="text-xs text-[#008FA5] hover:text-[#121F3E] font-extrabold hover:underline flex items-center gap-0.5"
                >
                  Need help? <ExternalLink className="w-3 h-3" />
                </button>
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-all font-mono ${
                  webhookUrl.includes("docs.google.com/spreadsheets")
                    ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : webhookUrl.includes("script.google.com")
                    ? "border-[#008FA5]/40 bg-[#008FA5]/5 focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 font-bold"
                    : "border-slate-200 bg-[#F4F8F8]/60 focus:bg-white focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20"
                }`}
              />
              {webhookUrl.includes("docs.google.com/spreadsheets") ? (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 font-sans shadow-2xs">
                  <strong>🚨 Wrong URL Format!</strong> You entered a Google Spreadsheet link. You need your deployed Web App URL!
                </div>
              ) : webhookUrl.includes("script.google.com") ? (
                <p className="text-[11px] text-[#008FA5] font-bold mt-1 flex items-center gap-1 font-sans">
                  <Check className="w-3.5 h-3.5 text-[#00D2A0]" />
                  Valid Web App URL format detected
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                  <span>Data JSON payloads will append to your target sheet:</span>
                  <a
                    href={TEMPLATE_VIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#008FA5] hover:underline inline-flex items-center gap-0.5 font-['Montserrat']"
                  >
                    View Spreadsheet Template <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#121F3E] flex items-center gap-1.5 font-['Montserrat']">
                <Key className="w-3.5 h-3.5 text-[#D2A054]" />
                Gemini AI API Key (For Direct AI Vision):
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy... (Enter key from Google AI Studio)"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F8F8]/60 focus:bg-white focus:border-[#008FA5] focus:ring-2 focus:ring-[#008FA5]/20 outline-none transition-all font-mono"
              />
              <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#008FA5] shrink-0" />
                <span><strong>📱 Client Vision Note:</strong> Optional key allows receipt OCR scanning to run on client directly.</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {onOpenManageLists && (
                <button
                  type="button"
                  onClick={onOpenManageLists}
                  className="px-3.5 py-2 bg-[#008FA5]/10 hover:bg-[#008FA5]/20 text-[#008FA5] hover:text-[#121F3E] border border-[#008FA5]/20 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs font-['Montserrat']"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Manage Categories & Accounts
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 justify-end">
              {savedNotice && (
                <span className="text-xs font-bold text-[#008FA5] flex items-center gap-1 font-['Montserrat']">
                  <Check className="w-3.5 h-3.5 text-[#00D2A0]" /> Saved to browser storage!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#121F3E] hover:bg-[#008FA5] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm font-['Montserrat']"
              >
                Save Connection Settings
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default SetupCard;