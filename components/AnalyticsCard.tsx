import type { LucideIcon } from "lucide-react";

export function AnalyticsCard({ title, value, icon: Icon }: { title: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-lg border border-neutral-900 bg-[#050505] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <Icon className="h-4 w-4 text-neutral-500" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-neutral-100">{value}</p>
    </div>
  );
}
