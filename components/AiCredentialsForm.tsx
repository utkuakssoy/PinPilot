"use client";

import { useState } from "react";
import { Save } from "lucide-react";

export function AiCredentialsForm() {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/ai/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey, openaiApiKey })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Kaydedilemedi");
      }
      setMessage("AI API key kaydedildi. Artik SEO olusturabilirsin.");
      setGeminiApiKey("");
      setOpenaiApiKey("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Kaydedilemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-md border border-neutral-900 bg-black p-4">
      <p className="text-sm font-semibold text-neutral-100">Add AI API key</p>
      <p className="mt-1 text-sm leading-6 text-neutral-500">
        Gemini veya ChatGPT key girmen yeterli. Ikisini birden girmek zorunda degilsin.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block text-sm font-semibold text-neutral-300">
          <span className="mb-2 block">Gemini API key</span>
          <input
            value={geminiApiKey}
            onChange={(event) => setGeminiApiKey(event.target.value)}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus-ring"
            placeholder="AIza..."
            type="password"
          />
        </label>
        <label className="block text-sm font-semibold text-neutral-300">
          <span className="mb-2 block">ChatGPT / OpenAI API key</span>
          <input
            value={openaiApiKey}
            onChange={(event) => setOpenaiApiKey(event.target.value)}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus-ring"
            placeholder="sk-..."
            type="password"
          />
        </label>
      </div>
      <button
        disabled={loading || (!geminiApiKey && !openaiApiKey)}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {loading ? "Kaydediliyor..." : "AI key kaydet"}
      </button>
      {message && <p className="mt-3 text-sm font-semibold text-emerald-400">{message}</p>}
      {error && <p className="mt-3 text-sm font-semibold text-red-400">{error}</p>}
    </form>
  );
}
