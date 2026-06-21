import OpenAI from "openai";
import { env } from "@/lib/env";
import { readAiCredentials } from "@/services/local-store";
import type { EtsyListingView, SeoGenerationResult } from "@/types";

const fallbackSeo: SeoGenerationResult = {
  pinterestTitles: [
    "Handmade Gift Idea for Thoughtful Shoppers",
    "A Beautiful Find for Cozy Everyday Style",
    "Small Shop Favorite for Gift Season"
  ],
  pinterestDescriptions: [
    "Discover a thoughtful handmade product with useful details, gift-ready appeal, and a style that feels personal without being overdone.",
    "Save this Etsy find for birthdays, holidays, housewarming gifts, or anyone who loves practical pieces with a handmade feel."
  ],
  keywords: ["handmade gift", "etsy find", "gift idea", "small shop", "thoughtful gift"],
  etsyTitleSuggestion: "Handmade Etsy Gift for Everyday Use",
  etsyDescriptionSuggestion:
    "Highlight the product's real materials, size, use case, personalization options, shipping timeline, and gift-ready qualities in clear buyer-focused language.",
  boardSuggestions: ["Thoughtful Gift Ideas", "Etsy Finds", "Small Shop Favorites"],
  pinConcepts: [
    {
      template: "Product close-up with clean text overlay",
      headline: "A Thoughtful Handmade Gift",
      visualDirection: "Use a bright product photo with natural props and one concise headline.",
      targetKeyword: "handmade gift"
    }
  ]
};

export async function generateSeoForListing(listing: EtsyListingView): Promise<SeoGenerationResult> {
  const credentials = getAiCredentials();

  if (credentials.geminiApiKey) {
    return generateSeoWithGemini(listing, credentials.geminiApiKey);
  }

  if (credentials.openaiApiKey) {
    return generateSeoWithOpenAi(listing, credentials.openaiApiKey);
  }

  return generateMockSeo(listing);
}

export function getAiCredentials() {
  const storedCredentials = readAiCredentials();

  return {
    geminiApiKey: storedCredentials?.geminiApiKey || env.geminiApiKey,
    openaiApiKey: storedCredentials?.openaiApiKey || env.openaiApiKey
  };
}

export function getAiStatus() {
  const credentials = getAiCredentials();

  return {
    geminiConfigured: Boolean(credentials.geminiApiKey),
    openaiConfigured: Boolean(credentials.openaiApiKey)
  };
}

async function generateSeoWithOpenAi(listing: EtsyListingView, apiKey: string): Promise<SeoGenerationResult> {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You generate Pinterest SEO for Etsy sellers. Output valid JSON only. Do not include markdown."
      },
      {
        role: "user",
        content: buildSeoPrompt(listing)
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  const parsed = JSON.parse(content) as SeoGenerationResult;
  return parsed;
}

async function generateSeoWithGemini(listing: EtsyListingView, apiKey: string): Promise<SeoGenerationResult> {
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You generate Pinterest SEO for Etsy sellers. Output valid JSON only. Do not include markdown.\n\n${buildSeoPrompt(listing)}`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      })
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini SEO generation failed: ${message}`);
  }

  const payload = await response.json();
  const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error("Gemini returned an empty response");
  }

  return JSON.parse(content) as SeoGenerationResult;
}

function buildSeoPrompt(listing: EtsyListingView) {
  return `
Analyze the Etsy product title, description, tags, category, and images if available.
Generate natural Pinterest SEO copy.
Avoid keyword stuffing.
Use buyer-intent keywords.
Make titles clickable but not spammy.
Generate seasonal and gift-focused angles when relevant.
Do not make false claims.
Preserve the product's real features.
Output valid JSON only.

Return this strict JSON shape:
{
  "pinterestTitles": [],
  "pinterestDescriptions": [],
  "keywords": [],
  "etsyTitleSuggestion": "",
  "etsyDescriptionSuggestion": "",
  "boardSuggestions": [],
  "pinConcepts": [
    {
      "template": "",
      "headline": "",
      "visualDirection": "",
      "targetKeyword": ""
    }
  ]
}

Listing:
${JSON.stringify(listing, null, 2)}
`;
}

export function generateMockSeo(listing: EtsyListingView): SeoGenerationResult {
  const primaryTag = listing.tags[0] ?? "etsy gift";
  const giftAngle = listing.tags.find((tag) => tag.toLowerCase().includes("gift")) ?? "thoughtful gift";

  return {
    ...fallbackSeo,
    pinterestTitles: [
      `${listing.title.slice(0, 70)}`,
      `${giftAngle.replace(/\b\w/g, (char) => char.toUpperCase())} from a Small Etsy Shop`,
      `Save This ${listing.category.split("/").pop()?.trim() ?? "Etsy Find"} Idea`
    ],
    pinterestDescriptions: [
      `${listing.description.slice(0, 180)} Save this Etsy find for shoppers looking for ${primaryTag} with a personal, handmade feel.`,
      `A buyer-friendly ${primaryTag} idea for birthdays, holidays, thank-you gifts, or a practical treat for everyday use.`
    ],
    keywords: Array.from(new Set([primaryTag, giftAngle, ...listing.tags, listing.category])).slice(0, 10),
    etsyTitleSuggestion: `${listing.title} | ${giftAngle}`,
    etsyDescriptionSuggestion: `${listing.description}\n\nGreat for shoppers searching for ${primaryTag}, ${giftAngle}, and small shop finds with authentic product details.`,
    boardSuggestions: ["Thoughtful Gift Ideas", listing.category.split("/").pop()?.trim() ?? "Etsy Finds", "Small Shop Favorites"],
    pinConcepts: [
      {
        template: "Clean product hero pin",
        headline: listing.title.split(" ").slice(0, 7).join(" "),
        visualDirection: "Feature the main product image with generous whitespace and a small high-contrast headline.",
        targetKeyword: primaryTag
      },
      {
        template: "Gift guide pin",
        headline: `Gift Idea: ${giftAngle}`,
        visualDirection: "Pair the product image with a seasonal gift-guide frame and restrained typography.",
        targetKeyword: giftAngle
      }
    ]
  };
}
