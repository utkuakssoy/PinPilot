import { demoPinDrafts } from "@/lib/demo-data";
import { getEtsyListings } from "@/services/etsy";
import { isPinterestConnected } from "@/services/pinterest";
import type { AnalyticsSnapshotView } from "@/types";

export async function getAnalyticsSummary() {
  const importedProducts = await getEtsyListings();
  const products = importedProducts;
  const connected = isPinterestConnected();
  const snapshots: AnalyticsSnapshotView[] = [];
  const impressions = snapshots.reduce((sum, row) => sum + row.impressions, 0);
  const outboundClicks = snapshots.reduce((sum, row) => sum + row.outboundClicks, 0);
  const saves = snapshots.reduce((sum, row) => sum + row.saves, 0);
  const ctr = impressions ? (outboundClicks / impressions) * 100 : 0;

  return {
    connected,
    totalProducts: products.length,
    generatedPins: demoPinDrafts.length,
    scheduledPins: demoPinDrafts.filter((pin) => pin.status === "scheduled").length,
    impressions,
    outboundClicks,
    saves,
    ctr,
    bestPerformingProducts: products
      .map((product) => {
        const productStats = snapshots.filter((row) => row.productId === product.id);
        const productImpressions = productStats.reduce((sum, row) => sum + row.impressions, 0);
        return { product, impressions: productImpressions };
      })
      .sort((a, b) => b.impressions - a.impressions),
    recentPinDrafts: demoPinDrafts.slice(0, 4),
    snapshots
  };
}
