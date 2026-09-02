import React, { useRef, useState, useEffect } from "react";
import { Upload, Sparkles, FileText, Image as ImageIcon, RotateCw, Trash2, Loader2, Camera } from "lucide-react";
import { supabase } from "../utils/supabase";
import { SubscriptionState } from "../types";
import { TIER_CONFIGS } from "../utils/subscription";

interface ReceiptUploaderProps {
  customCategories?: string[];
  subscriptionState: SubscriptionState;
  onScanCompleted: () => void;
  onTriggerUpgrade: (reason: "scan_limit" | "entry_limit" | "gemini_vision" | "multi_profile") => void;
  onExtractionSuccess: (
    data: {
      vendor?: string;
      date?: string;
      time?: string;
      paymentMethod?: string;
      cardLast4?: string;
      rawText?: string;
      splits?: Array<{ category: string; amount: number }>;
      imageBase64?: string;
      imageMimeType?: string;
      imageFileName?: string;
    },
    source: "ai"
  ) => void;
  onStatusChange: (msg: string, type: "info" | "success" | "error") => void;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  customCategories,
  subscriptionState,
  onScanCompleted,
  onTriggerUpgrade,
  onExtractionSuccess,
  onStatusChange
}) => {
  const currentTier = subscriptionState.tier;
  const tierConfig = TIER_CONFIGS[currentTier];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (file.type === "application/pdf" || file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const MAX_DIMENSION = 1280;
          if (width > height && width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.82
          );
        };
      };
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFileSelect(blob);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileSelect = async (rawFile: File) => {
    if (!rawFile.type.startsWith("image/") && rawFile.type !== "application/pdf") {
      onStatusChange("Please select a valid image file (JPG, PNG, WebP) or PDF.", "error");
      return;
    }

    if (
      tierConfig.limits.scansLimit !== 999999 &&
      subscriptionState.scansThisMonth >= tierConfig.limits.scansLimit
    ) {
      onTriggerUpgrade("scan_limit");
      onStatusChange(
        `Monthly scan limit reached (${subscriptionState.scansThisMonth}/${tierConfig.limits.scansLimit}). Please upgrade your plan to scan more receipts.`,
        "error"
      );
      return;
    }

    const file = await compressImage(rawFile);

    setSelectedFile(file);
    setRotation(0);
    const url = URL.createObjectURL(file);
    setImagePreview(url);

    triggerScan(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const triggerScan = async (file: File) => {
    if (
      tierConfig.limits.scansLimit !== 999999 &&
      subscriptionState.scansThisMonth >= tierConfig.limits.scansLimit
    ) {
      onTriggerUpgrade("scan_limit");
      onStatusChange(
        `Monthly scan limit reached (${subscriptionState.scansThisMonth}/${tierConfig.limits.scansLimit}). Upgrade plan to process.`,
        "error"
      );
      return;
    }

    if (!tierConfig.limits.allowGeminiVision) {
      onTriggerUpgrade("gemini_vision");
      onStatusChange("AI Vision requires Basic, Pro, or Elite plan.", "error");
      return;
    }

    setIsProcessing(true);
    onStatusChange("🤖 AI Vision is analyzing receipt layout & itemized categories...", "info");

    try {
      const fullBase64Data = await fileToBase64(file);
      
      const prompt = `Analyze this receipt image and extract structured JSON with keys: vendor (string), date (YYYY-MM-DD), time (HH:MM), paymentMethod (string), cardLast4 (string), rawText (string), and splits (array of objects containing category (string) and amount (number)). Ensure valid JSON only. Categories to choose from if applicable: ${JSON.stringify(customCategories || [])}`;

      const { data: responseData, error: functionError } = await supabase.functions.invoke('gemini-vision', {
        body: {
          prompt,
          imageBase64: fullBase64Data,
          imageMimeType: file.type
        }
      });

      if (functionError) throw functionError;

      const rawGeminiText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawGeminiText) {
        throw new Error("No valid response text received from Gemini model.");
      }

      const cleanJsonText = rawGeminiText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleanJsonText);

      if (parsedData && parsedData.splits) {
        onExtractionSuccess(
          {
            ...parsedData,
            imageBase64: fullBase64Data,
            imageMimeType: file.type,
            imageFileName: file.name
          },
          "ai"
        );
        onScanCompleted();
        onStatusChange("✨ AI vision extraction complete! Values imported into Section 2 below.", "success");
      } else {
        throw new Error("Could not map receipt splits from AI response.");
      }
    } catch (err: any) {
      console.error("AI Vision failed details:", err);
      
      let detailedMsg = err.message || "Unknown error";
      if (err.context && typeof err.context.json === 'function') {
        try {
          const errBody = await err.context.json();
          detailedMsg = errBody.error || detailedMsg;
        } catch (e) {
          // Fallback if parsing fails
        }
      }

      onStatusChange(`⚠️ AI parsing failed: ${detailedMsg}.`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setRotation(0);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-extrabold text-[#121F3E] flex items-center gap-2 font-['Montserrat']">
            <span className="w-5 h-5 rounded-md bg-[#008FA5]/15 text-[#008FA5] flex items-center justify-center text-xs font-mono font-extrabold">1</span>
            Upload Receipt or Invoice
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Auto-extract store name, item splits, totals, and payment method via Google Gemini AI Vision
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#121F3E] text-[#00D2A0] uppercase flex items-center gap-1.5 shadow-2xs font-['Montserrat']">
            <Sparkles className="w-3 h-3 text-[#00D2A0]" /> Gemini AI Vision Active
          </span>
        </div>
      </div>

      {!imagePreview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragOver
              ? "border-[#008FA5] bg-[#008FA5]/10 scale-[0.99]"
              : "border-slate-300 bg-[#F4F8F8]/60"
          }`}
        >
          <input
            type="file"
            ref={galleryInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <input
            type="file"
            ref={cameraInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <p className="text-xs font-bold text-[#121F3E] mb-3 font-['Montserrat']">
            Choose how to add your receipt:
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto mb-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-4 py-3 bg-[#121F3E] hover:bg-[#1c2e5c] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer font-['Montserrat']"
            >
              <Camera className="w-4 h-4 text-[#00D2A0]" /> Take Photo
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-[#121F3E] border border-slate-300 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer font-['Montserrat']"
            >
              <ImageIcon className="w-4 h-4 text-[#008FA5]" /> From Gallery
            </button>
          </div>

          <p className="text-[11px] text-slate-500 max-w-md mx-auto font-medium">
            Or drag & drop an image or PDF directly. Supports JPEG, PNG, WebP, PDF.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-[#121F3E] rounded-2xl overflow-hidden min-h-[240px] max-h-[380px] flex items-center justify-center border border-slate-800 shadow-inner">
            <img
              src={imagePreview}
              alt="Receipt Preview"
              style={{ transform: `rotate(${rotation}deg)` }}
              className="max-h-[360px] w-auto object-contain transition-transform duration-300"
            />

            {isProcessing && (
              <>
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00D2A0] to-transparent shadow-[0_0_20px_#00D2A0] animate-scan z-10" />
                <div className="absolute inset-0 bg-[#121F3E]/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 z-20">
                  <div className="p-3 bg-[#008FA5]/30 rounded-2xl border border-[#00D2A0]/40 mb-3 shadow-lg">
                    <Loader2 className="w-7 h-7 animate-spin text-[#00D2A0]" />
                  </div>
                  <p className="text-xs font-extrabold text-[#00D2A0] tracking-wide font-['Montserrat']">
                    🤖 Analyzing receipt via Gemini AI Vision...
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 font-medium">Itemizing category splits & amounts...</p>
                </div>
              </>
            )}

            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#121F3E]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-md">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 bg-[#F4F8F8] p-3 rounded-xl border border-slate-200">
            <span className="truncate max-w-[280px] font-medium text-slate-800">
              📎 <strong>{selectedFile?.name}</strong> ({(selectedFile?.size ? selectedFile.size / 1024 : 0).toFixed(1)} KB)
            </span>
            <button
              type="button"
              onClick={() => selectedFile && triggerScan(selectedFile)}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#121F3E] hover:bg-[#1c2e5c] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs transition-colors text-xs font-['Montserrat']"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00D2A0]" /> Re-scan Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};