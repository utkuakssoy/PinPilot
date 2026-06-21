import Link from "next/link";
import { BarChart3, Lock, MousePointerClick, Save } from "lucide-react";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { getAnalyticsSummary } from "@/services/analytics";
import { formatNumber, pct } from "@/lib/utils";

export default async function AnalyticsPage() {
  const summary = await getAnalyticsSummary();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-neutral-500">Performance</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-100">Analytics</h1>
      </header>
      {!summary.connected ? (
        <section className="rounded-lg border border-neutral-900 bg-[#050505] p-8 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-neutral-800 bg-black text-neutral-400">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-neutral-100">Connect your account to see analytics</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            Performance data is hidden until your account is connected. No mock analytics are shown.
          </p>
          <Link href="/settings" className="mt-5 inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-black">
            Go to settings
          </Link>
        </section>
      ) : (
        <>
      <section className="grid gap-4 md:grid-cols-4">
        <AnalyticsCard title="Impressions" value={formatNumber(summary.impressions)} icon={BarChart3} />
        <AnalyticsCard title="Clicks" value={formatNumber(summary.outboundClicks)} icon={MousePointerClick} />
        <AnalyticsCard title="Saves" value={formatNumber(summary.saves)} icon={Save} />
        <AnalyticsCard title="CTR" value={pct(summary.ctr)} icon={BarChart3} />
      </section>
      <div className="overflow-hidden rounded-lg border border-neutral-900 bg-[#050505] shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-900 bg-black text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Impressions</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
              <th className="px-4 py-3 font-medium">Saves</th>
              <th className="px-4 py-3 font-medium">CTR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {summary.snapshots.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-4">{row.date}</td>
                <td className="px-4 py-4">{formatNumber(row.impressions)}</td>
                <td className="px-4 py-4">{formatNumber(row.outboundClicks)}</td>
                <td className="px-4 py-4">{formatNumber(row.saves)}</td>
                <td className="px-4 py-4">{pct(row.ctr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  );
}
