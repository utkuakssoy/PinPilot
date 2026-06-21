import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Menu, MousePointerClick, Package, Save, Search, Sparkles } from "lucide-react";
import { DashboardCard } from "@/components/DashboardCard";
import { ProductCard } from "@/components/ProductCard";
import { EtsyImportForm } from "@/components/EtsyImportForm";
import { getAnalyticsSummary } from "@/services/analytics";
import { getEtsyListings } from "@/services/etsy";
import { formatNumber, pct } from "@/lib/utils";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ imported?: string }>;
}) {
  const { imported } = await searchParams;
  const [summary, products] = await Promise.all([getAnalyticsSummary(), getEtsyListings()]);
  const firstProduct = products[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button className="grid h-11 w-11 place-items-center rounded-md border border-neutral-800 bg-[#050505] text-neutral-300">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-600" />
          <input
            className="h-11 w-full rounded-md border border-neutral-800 bg-[#050505] pl-11 pr-4 text-sm text-neutral-300 placeholder:text-neutral-600 focus-ring"
            placeholder="Search products, drafts, or shop links"
          />
        </div>
        <Link href="/settings" className="rounded-md border border-neutral-800 bg-[#050505] px-4 py-2.5 text-sm font-semibold text-neutral-100">
          Settings
        </Link>
      </div>

      <section className="rounded-lg border border-neutral-800 bg-[#050505] p-6">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-neutral-900 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              Production workflow
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-100">
              Import listings and generate ready-to-review posts
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Paste a shop link, choose a product, generate AI copy, then prepare a draft for your connected social account.
            </p>
          </div>
          <div className="hidden rounded-full border border-neutral-800 px-3 py-1 text-xs font-medium text-neutral-500 md:block">
            Local first
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div>
            <EtsyImportForm label={imported || products.length ? "Refresh listings" : "Import listings"} />
          </div>
          <div className="rounded-lg border border-neutral-900 bg-black p-4">
            <h3 className="text-sm font-semibold text-neutral-200">Workflow</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Step done={products.length > 0} label="Import shop listings" />
              <Step done={false} label="Select one product" />
              <Step done={false} label="Generate AI content" />
              <Step done={false} label="Save or publish draft" />
            </div>
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <section className="rounded-lg border border-neutral-800 bg-[#050505] p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-medium text-neutral-500">Next step</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-100">Choose a product</h2>
              <p className="mt-1 text-xs text-neutral-500">{products.length} products are ready.</p>
            </div>
            {firstProduct && (
              <Link
                href={`/generate?product=${firstProduct.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-black"
              >
                <Sparkles className="h-4 w-4" />
                Continue with first product
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Products" value={formatNumber(summary.totalProducts)} icon={Package} />
        {summary.connected ? (
          <>
            <DashboardCard title="Impressions" value={formatNumber(summary.impressions)} icon={BarChart3} />
            <DashboardCard title="Clicks" value={formatNumber(summary.outboundClicks)} icon={MousePointerClick} />
            <DashboardCard title="CTR" value={pct(summary.ctr)} icon={Save} />
          </>
        ) : (
          <div className="rounded-lg border border-neutral-900 bg-[#050505] p-5 shadow-sm sm:col-span-1 xl:col-span-3">
            <p className="text-sm font-medium text-neutral-500">Analytics locked</p>
            <p className="mt-2 text-sm leading-6 text-neutral-300">Connect your account in Settings to show real performance data.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className={done ? "h-4 w-4 text-blue-500" : "h-4 w-4 text-neutral-700"} />
      <span className={done ? "font-medium text-neutral-200" : "text-neutral-500"}>{label}</span>
    </div>
  );
}
