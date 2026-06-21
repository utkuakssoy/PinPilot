import { FlaskConical } from "lucide-react";
import { demoMode } from "@/lib/env";

export function DemoModeBadge() {
  if (!demoMode) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs font-semibold text-neutral-300">
      <FlaskConical className="h-3.5 w-3.5" />
      Local Mode
    </div>
  );
}
