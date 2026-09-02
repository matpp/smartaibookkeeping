import { GoogleGenAI, Type } from "@google/genai";
import { DEFAULT_CATEGORIES } from "../types";

export async function parseReceiptWithGeminiDirect(
  base64Data: string,
  mimeType: string,
  apiKey: string,
  customCategories?: string[]
) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Gemini API key is required for direct AI Vision parsing.");
  }

  const allowedCategories =
    customCategories && customCategories.length > 0 ? customCategories : DEFAULT_CATEGORIES;

  const ai = new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build-client"
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
- If an item has a discount or coupon printed below or beside it, subtract that discount from the item's price before adding to its category sum.
- Sum up the NET amounts for each category group.
- Do NOT include receipt sub-totals, tax lines, or transaction numbers.
- Verify your math: The sum of all category split amounts MUST equal the net final total paid on the receipt.
- Return positive numbers for each category split amount.

EXTRACTED STRUCTURE:
- "vendor": Store or Payee name (e.g. "Lidl", "Tesco", "Aldi").
- "date": Date in YYYY-MM-DD format.
- "time": Time in HH:MM:SS format if printed on receipt (e.g. "14:30:00"). If no seconds on receipt, use "00" for seconds (e.g. "14:30:00"). If no time found, return "".
- "paymentMethod": "cash" if paid in cash, "card" if paid by debit/credit card, "unknown" if not clearly stated.
- "cardLast4": Exact 4 digits of the payment card if printed on receipt (e.g. "1234"), or empty string "" if not found.
- "splits": Array of objects containing "category" (exact string match from ALLOWED CATEGORIES) and "amount" (positive float rounded to 2 decimal places).
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
  return JSON.parse(text);
}
