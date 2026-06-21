import { ProductGrid } from "@/components/ProductGrid";
import { getEtsyListings } from "@/services/etsy";

export default async function ProductsPage() {
  const products = await getEtsyListings();

  return (
    <div className="space-y-4">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium uppercase text-neutral-500">Etsy katalogu</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Urunler</h1>
        </div>
        <a className="rounded-md border border-neutral-800 bg-[#050505] px-3 py-2 text-xs font-medium text-white shadow-sm hover:border-neutral-700" href="/connect/etsy">
          Etsy linki gir
        </a>
      </header>
      <ProductGrid products={products} />
    </div>
  );
}
