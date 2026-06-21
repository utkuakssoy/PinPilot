"use client";

import { useMemo, useState } from "react";
import { ImagePlus } from "lucide-react";
import { savePinDraft } from "@/lib/client-storage";
import type { EtsyListingView, PinDraftView, PinterestBoardView } from "@/types";

export function PinDraftCreator({ products, boards }: { products: EtsyListingView[]; boards: PinterestBoardView[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [boardId, setBoardId] = useState(boards[0]?.id ?? "");
  const [title, setTitle] = useState(products[0]?.title.slice(0, 90) ?? "");
  const [description, setDescription] = useState(products[0]?.description.slice(0, 240) ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [createdDraft, setCreatedDraft] = useState<PinDraftView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const product = useMemo(() => products.find((item) => item.id === productId) ?? products[0], [productId, products]);

  function handleProductChange(nextProductId: string) {
    const nextProduct = products.find((item) => item.id === nextProductId);
    setProductId(nextProductId);
    if (nextProduct) {
      setTitle(nextProduct.title.slice(0, 90));
      setDescription(nextProduct.description.slice(0, 240));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          boardId,
          title,
          description,
          destinationUrl: product.listingUrl,
          imageUrl: product.images[0] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
          status: scheduledAt ? "scheduled" : "draft",
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create draft");
      }
      savePinDraft(payload.draft);
      setCreatedDraft(payload.draft);
    } catch (draftError) {
      setError(draftError instanceof Error ? draftError.message : "Unable to create draft");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-900 bg-[#050505] p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Product">
          <select className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus-ring" value={productId} onChange={(event) => handleProductChange(event.target.value)}>
            {products.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </Field>
        <Field label="Board">
          <select className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus-ring" value={boardId} onChange={(event) => setBoardId(event.target.value)}>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>{board.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Pin title">
          <input className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus-ring" value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="Schedule time">
          <input className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus-ring" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
        </Field>
      </div>
      <Field label="Pin description" className="mt-4">
        <textarea className="min-h-28 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm leading-6 text-neutral-100 focus-ring" value={description} onChange={(event) => setDescription(event.target.value)} />
      </Field>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm disabled:opacity-60" disabled={loading}>
          <ImagePlus className="h-4 w-4" />
          {loading ? "Creating..." : "Create pin draft"}
        </button>
        {createdDraft && <p className="text-sm font-medium text-emerald-700">Created {createdDraft.status} draft.</p>}
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      </div>
    </form>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-sm font-semibold ${className}`}>
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}
