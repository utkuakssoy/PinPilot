import type { SeoGenerationResult } from "@/types";

export function SeoResultCard({ result }: { result: SeoGenerationResult }) {
  return (
    <div className="space-y-5 rounded-lg border border-neutral-900 bg-[#050505] p-5 shadow-sm">
      <ResultSection title="Post titles" items={result.pinterestTitles} />
      <ResultSection title="Post descriptions" items={result.pinterestDescriptions} />
      <ResultSection title="Keywords" items={result.keywords} compact />
      <ResultSection title="Board ideas" items={result.boardSuggestions} compact />
      <div>
        <h3 className="text-sm font-semibold text-neutral-100">Listing suggestion</h3>
        <p className="mt-2 text-sm font-medium text-neutral-200">{result.etsyTitleSuggestion}</p>
        <p className="mt-2 text-sm leading-6 text-neutral-500">{result.etsyDescriptionSuggestion}</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-100">Visual concepts</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {result.pinConcepts.map((concept) => (
            <div key={`${concept.template}-${concept.headline}`} className="rounded-md border border-neutral-900 bg-black p-3">
              <p className="text-sm font-semibold text-neutral-100">{concept.headline}</p>
              <p className="mt-1 text-xs font-medium text-neutral-500">{concept.template}</p>
              <p className="mt-2 text-sm leading-5 text-neutral-500">{concept.visualDirection}</p>
              <p className="mt-2 text-xs font-medium text-neutral-500">{concept.targetKeyword}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultSection({ title, items, compact = false }: { title: string; items: string[]; compact?: boolean }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className={compact ? "mt-2 flex flex-wrap gap-2" : "mt-2 space-y-2"}>
        {items.map((item) => (
          <span
            key={item}
            className={compact ? "rounded-full border border-neutral-800 bg-black px-3 py-1 text-xs font-medium text-neutral-400" : "block rounded-md border border-neutral-900 bg-black p-3 text-sm leading-6 text-neutral-400"}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
