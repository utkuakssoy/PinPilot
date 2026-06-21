import Image from "next/image";
import type { PinDraftView } from "@/types";

export function PinDraftCard({ draft }: { draft: PinDraftView }) {
  return (
    <article className="grid grid-cols-[96px_1fr] gap-4 rounded-lg border border-neutral-900 bg-[#050505] p-3 shadow-sm">
      <Image src={draft.imageUrl} alt={draft.title} width={200} height={260} sizes="96px" className="h-32 w-24 rounded-md object-cover" />
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-neutral-800 bg-black px-2 py-1 text-xs font-medium capitalize text-neutral-500">{draft.status}</span>
          {draft.scheduledAt && <span className="text-xs text-neutral-500">{new Date(draft.scheduledAt).toLocaleDateString()}</span>}
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-neutral-100">{draft.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-5 text-neutral-600">{draft.description}</p>
      </div>
    </article>
  );
}
