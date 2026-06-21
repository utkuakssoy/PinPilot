import { SettingsPanel } from "@/components/SettingsPanel";
import { PinterestConnectCard } from "@/components/PinterestConnectCard";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-neutral-500">Project</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-100">Settings</h1>
      </header>
      <PinterestConnectCard connected={connected === "1"} error={error} />
      <SettingsPanel />
    </div>
  );
}
