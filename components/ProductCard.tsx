import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { EtsyListingView } from "@/types";

export function ProductCard({ product }: { product: EtsyListingView }) {
  const imageUrl = product.images[0] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

  return (
    <Link href={`/products/${product.id}`} className="group overflow-hidden rounded-md border border-neutral-900 bg-[#050505] shadow-sm transition hover:border-neutral-700">
      <Image
        src={imageUrl}
        alt={product.title}
        width={520}
        height={390}
        sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
        className="aspect-[5/4] w-full object-cover"
      />
      <div className="p-3">
        <p className="truncate text-[10px] font-medium uppercase leading-4 text-neutral-500">{product.category.split("/").pop()?.trim()}</p>
        <h3 className="mt-1 line-clamp-2 min-h-9 text-xs font-semibold leading-[18px] text-neutral-100 group-hover:underline">{product.title}</h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-neutral-300">{formatCurrency(product.price, product.currency)}</span>
          <span className="rounded-full border border-neutral-800 bg-neutral-950 px-1.5 py-0.5 text-[10px] font-medium capitalize text-neutral-500">{product.status}</span>
        </div>
      </div>
    </Link>
  );
}
