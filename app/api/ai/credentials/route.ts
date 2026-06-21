import { NextResponse } from "next/server";
import { z } from "zod";
import { saveAiCredentials } from "@/services/local-store";

const credentialsSchema = z.object({
  geminiApiKey: z.string().optional(),
  openaiApiKey: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const credentials = credentialsSchema.parse(await request.json());
    if (!credentials.geminiApiKey && !credentials.openaiApiKey) {
      return NextResponse.json({ error: "Gemini veya ChatGPT API key gir." }, { status: 400 });
    }

    saveAiCredentials({
      geminiApiKey: credentials.geminiApiKey || undefined,
      openaiApiKey: credentials.openaiApiKey || undefined
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI bilgileri kaydedilemedi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
