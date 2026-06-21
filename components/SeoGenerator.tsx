"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, ImagePlus, Sparkles } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { SeoResultCard } from "@/components/SeoResultCard";
import { savePinDraft } from "@/lib/client-storage";
import type { EtsyListingView, PinDraftView, PinterestBoardView, SeoGenerationResult } from "@/types";

export function SeoGenerator({
  products,
  boards,
  initialProductId
}: {
  products: EtsyListingView[];
  boards: PinterestBoardView[];
  initialProductId?: string;
}) {
  const initialProduct = products.find((product) => product.id === initialProductId) ?? products[0];
  const [productId, setProductId] = useState(initialProduct?.id ?? "");
  const [boardId, setBoardId] = useState(boards[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [result, setResult] = useState<SeoGenerationResult | null>(null);
  const [createdDraft, setCreatedDraft] = useState<PinDraftView | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? products[0],
    [productId, products]
  );

  async function handleGenerate() {
    if (!selectedProduct) {
      return;
    }

    setLoading(true);
    setError(null);
    setCreatedDraft(null);
    setPublishedUrl(null);

    try {
      const response = await fetch("/api/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedProduct)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Generation failed");
      }
      setResult(payload.output);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDraft() {
    if (!selectedProduct || !result) {
      return;
    }

    setDraftLoading(true);
    setDraftError(null);

    const title = result.pinterestTitles[0] ?? selectedProduct.title;
    const concept = result.pinConcepts[0];
    const description =
      result.pinterestDescriptions[0] ?? selectedProduct.description.slice(0, 240);

    try {
      const response = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          boardId,
          title,
          description,
          destinationUrl: selectedProduct.listingUrl,
          imageUrl: selectedProduct.images[0] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
          status: scheduledAt ? "scheduled" : "draft",
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create pin draft");
      }

      const draft = payload.draft as PinDraftView;
      savePinDraft({
        ...draft,
        description: concept
          ? `${draft.description}\n\nConcept: ${concept.headline}. ${concept.visualDirection}`
          : draft.description
      });
      setCreatedDraft(draft);
    } catch (draftCreationError) {
      setDraftError(draftCreationError instanceof Error ? draftCreationError.message : "Unable to create pin draft");
    } finally {
      setDraftLoading(false);
    }
  }

  async function handlePublishDraft() {
    if (!createdDraft) {
      return;
    }

    setPublishLoading(true);
    setPublishError(null);

    try {
      const response = await fetch("/api/pinterest/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createdDraft)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Pinterest’e yayınlanamadı");
      }
      setPublishedUrl(payload.publishedPin.url ?? null);
      setCreatedDraft({ ...createdDraft, status: "published", pinterestPinId: payload.publishedPin.id, publishedUrl: payload.publishedPin.url });
    } catch (publishDraftError) {
      setPublishError(publishDraftError instanceof Error ? publishDraftError.message : "Pinterest’e yayınlanamadı");
    } finally {
      setPublishLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-neutral-900 bg-[#050505] p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-black px-3 py-1 text-sm font-semibold text-neutral-400">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs text-black">2</span>
          Select product
        </div>
        <label className="mt-4 block text-base font-semibold text-neutral-100" htmlFor="product">
          Which product should we prepare?
        </label>
        <select
          id="product"
          className="mt-2 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-3 text-base text-neutral-100 focus-ring"
          value={productId}
          onChange={(event) => {
            setProductId(event.target.value);
            setResult(null);
            setCreatedDraft(null);
          }}
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>
        {selectedProduct && (
          <div className="mt-4 rounded-md border border-neutral-900 bg-black p-4 text-sm leading-6 text-neutral-500">
            <p className="font-medium text-neutral-200">{selectedProduct.category}</p>
            <p className="mt-1 line-clamp-4">{selectedProduct.description}</p>
          </div>
        )}
        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-base font-semibold text-black shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleGenerate}
          disabled={loading || !selectedProduct}
        >
          <Sparkles className="h-4 w-4" />
          3. Generate marketing copy
        </button>
        {loading && <div className="mt-4"><LoadingState label="Generating SEO content" /></div>}
        {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </section>
      {result ? (
        <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <SeoResultCard result={result} />
          <div className="h-fit rounded-lg border border-neutral-900 bg-[#050505] p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-black px-3 py-1 text-sm font-semibold text-neutral-400">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs text-black">4</span>
              Final step
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-100">Create draft</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              PinPilot selected the first title, description, and concept. Choose a board or schedule time.
            </p>
            {boards.length ? (
              <>
                <div className="mt-4 space-y-4">
                  <Field label="Pinterest board">
                    <select className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-3 text-base text-neutral-100 focus-ring" value={boardId} onChange={(event) => setBoardId(event.target.value)}>
                      {boards.map((board) => (
                        <option key={board.id} value={board.id}>{board.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Ne zaman yayınlansın?">
                    <input className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-3 text-base text-neutral-100 focus-ring" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
                  </Field>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCreateDraft}
                    disabled={draftLoading || !boardId}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-base font-semibold text-black shadow-sm disabled:opacity-60"
                  >
                    {scheduledAt ? <CalendarClock className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
                    {draftLoading ? "Kaydediliyor..." : scheduledAt ? "Pin oluştur ve planla" : "Pin taslağı oluştur"}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  {createdDraft && (
                    <button
                      onClick={handlePublishDraft}
                      disabled={publishLoading || createdDraft.status === "published"}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-800 bg-black px-5 py-3 text-base font-semibold text-neutral-100 shadow-sm disabled:opacity-60"
                    >
                      {publishLoading ? "Pinterest’e gönderiliyor..." : createdDraft.status === "published" ? "Pinterest’e yayınlandı" : "Pinterest’e şimdi yayınla"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-md border border-amber-900/60 bg-amber-950/20 p-4">
                <p className="text-sm font-semibold text-amber-300">Connect a social account first.</p>
                <Link href="/connect/pinterest" className="mt-3 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black">
                  Connect account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {createdDraft && (
                <Link href="/schedule" className="text-sm font-semibold text-neutral-100 underline underline-offset-4">
                  View schedule
                </Link>
              )}
              {createdDraft && <p className="text-sm font-medium text-emerald-400">Draft saved.</p>}
              {publishedUrl && (
                <a href={publishedUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-neutral-100 underline underline-offset-4">
                  Open published post
                </a>
              )}
              {draftError && <p className="text-sm font-medium text-red-400">{draftError}</p>}
              {publishError && <p className="text-sm font-medium text-red-400">{publishError}</p>}
            </div>
          </div>
        </section>
      ) : (
        <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-neutral-800 bg-[#050505] p-8 text-center text-base text-neutral-500">
          Generated content will appear here.
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}
