import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const CATEGORIES = [
  "Alcohol",
  "Eating-out/Pubs/Coffees",
  "TV/Phone/Broadband",
  "Toiletries/Cosmetics",
  "Transfere",
  "Groceries",
  "Gifts/Presents",
  "Home",
  "Lunch at Work",
  "Pharmacy",
  "Insurance",
  "Entertainment",
  "Nails",
  "Wages",
  "Transport",
  "Clothes",
  "OtherRentHoliday/Trips"
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // API endpoint for health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API endpoint for Gemini receipt vision extraction
  app.post("/api/parse-receipt", async (req, res) => {
    try {
      const { base64Data, mimeType, customApiKey, customCategories } = req.body;

      if (!base64Data) {
        return res.status(400).json({ error: "Missing receipt image data" });
      }

      const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY || "";

      if (!apiKey) {
        return res.status(400).json({
          error: "No Gemini API key available. Please configure GEMINI_API_KEY in environment or Secrets."
        });
      }

      const allowedCategories =
        Array.isArray(customCategories) && customCategories.length > 0
          ? customCategories
          : CATEGORIES;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const prompt = `
You are an expert bookkeeping AI specialized in optical character recognition (OCR) and receipt parsing.
Your task is to analyze the provided receipt image and extract exact itemized category breakdown.

ALLOWED CATEGORIES (You MUST map every item on the receipt to EXACTLY one of these categories):
${JSON.stringify(allowedCategories, null, 2)}

CATEGORIZATION RULES:
1. "Groceries": All food, vegetables, fruit, meat, dairy, bakery, snacks, soft drinks, water, condiments, and general food supermarket items.
2. "Home": Non-food household items, cookware, utensils, kitchenware, storage containers, towels, cleaning supplies, detergent, paper towels, garbage bags, hardware, home goods.
3. "Toiletries/Cosmetics": Shampoo, shower gel, soap, toothpaste, toothbrush, deodorant, body lotion, skincare, razor/shaving, feminine hygiene, cosmetics, cotton pads.
4. "Alcohol": Beer, wine, cider, spirits, liquor.
5. "Eating-out/Pubs/Coffees": Restaurant, cafe, fast food, coffee shop.
6. "Lunch at Work": Work canteen, lunch meal deals.
7. "Pharmacy": Prescription medicine, OTC drugs, vitamins, bandages.
8. "Clothes": Clothing, shoes, socks, apparel.
9. "Transport": Fuel, gas, parking, transit tickets.
10. Map any other items to the closest matching category from the ALLOWED CATEGORIES.

CRITICAL RECEIPT PARSING & MATHEMATICAL INSTRUCTIONS:
- Examine every line item printed on the receipt along with its price.
- If an item has a discount or coupon printed below or beside it (e.g., "-0.50", "Zľava", "Rabatt", "Discount", "Aktion"), subtract that discount from the item's price before adding to its category sum.
- Sum up the NET amounts (after item discounts) for each category group.
- Do NOT include receipt sub-totals, total tax/VAT lines, deposit/pfand returns (unless deducting from groceries), store barcodes, card payment authorization receipts, or transaction ID numbers as purchased amounts.
- Verify your math: The sum of all category split amounts MUST equal the net final total paid on the receipt.
- Return positive numbers for each category split amount (e.g., Groceries: 47.28, Home: 20.21, Toiletries/Cosmetics: 1.98).

EXTRACTED STRUCTURE:
- "vendor": Store or Payee name (e.g. "Lidl", "Tesco", "Aldi").
- "date": Date in YYYY-MM-DD format.
- "time": Time in HH:MM:SS format if printed on receipt (e.g. "14:30:00"). If no seconds on receipt, use "00" for seconds (e.g. "14:30:00"). If no time found, return "".
- "paymentMethod": "cash" if paid in cash, "card" if paid by debit/credit card, "unknown" if not clearly stated.
- "cardLast4": Exact 4 digits of the payment card if printed on receipt (e.g. "1234"), or empty string "" if not found.
- "splits": Array of objects containing "category" (exact string match from ALLOWED CATEGORIES) and "amount" (positive float rounded to 2 decimal places, e.g. 47.28).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: base64Data
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vendor: { type: Type.STRING, description: "Store or Payee name" },
              date: { type: Type.STRING, description: "Date in YYYY-MM-DD" },
              time: { type: Type.STRING, description: "Time in HH:MM:SS, e.g. 14:30:00" },
              paymentMethod: {
                type: Type.STRING,
                description: "cash, card, or unknown"
              },
              cardLast4: {
                type: Type.STRING,
                description: "Last 4 digits of payment card if visible on receipt, e.g. '1234'"
              },
              splits: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: {
                      type: Type.STRING,
                      description: "One of the allowed categories"
                    },
                    amount: {
                      type: Type.NUMBER,
                      description: "Positive net amount in receipt currency"
                    }
                  },
                  required: ["category", "amount"]
                }
              }
            },
            required: ["vendor", "splits"]
          }
        }
      });

      const text = response.text || "{}";
      const parsedData = JSON.parse(text);

      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Gemini Vision Parsing Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to process receipt with AI Vision"
      });
    }
  });

  // Proxy for Google Apps Script Web App submission
  app.post("/api/proxy-sheet", async (req, res) => {
    try {
      const { webhookUrl, payload } = req.body;
      if (!webhookUrl) {
        return res.status(400).json({ error: "Webhook URL is required" });
      }

      const cleanUrl = webhookUrl.trim();

      if (cleanUrl.includes("docs.google.com/spreadsheets")) {
        return res.status(400).json({
          success: false,
          error: "You entered a Google Spreadsheet document link instead of a Web App deployment URL. Please open 'Setup Guide' in the app to deploy your script and copy the resulting Web App URL (starts with https://script.google.com/macros/s/.../exec)."
        });
      }

      // Encode payload into URL query parameter 'data' ONLY if small enough as fallback for Google Apps Script HTTP 302 GET redirects
      const jsonStr = JSON.stringify(payload);
      const targetUrl = cleanUrl;

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonStr
      });

      const responseText = await response.text();
      let responseJson: any = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch (e) {
        // Response might be plain text HTML if authorization page or error page
      }

      if (
        responseText.includes("ServiceLogin") ||
        responseText.includes("accounts.google.com") ||
        responseText.includes("<!DOCTYPE html>") ||
        responseText.includes("<html")
      ) {
        return res.status(400).json({
          success: false,
          error: "Google Apps Script returned an HTML authorization/login page instead of JSON. Please check your Apps Script deployment in Google Sheets: set 'Who has access' to 'Anyone'!"
        });
      }

      const isSuccess = response.ok && (!responseJson || responseJson.status !== "error");

      return res.json({
        success: isSuccess,
        status: response.status,
        responseText,
        responseJson
      });
    } catch (err: any) {
      console.error("Google Sheets Webhook Proxy Error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
