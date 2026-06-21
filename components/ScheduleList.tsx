"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { getStoredPinDrafts, updateStoredPinDraft } from "@/lib/client-storage";
import type { PinDraftView } from "@/types";

export function ScheduleList({ initialDrafts }: { initialDrafts: PinDraftView[] }) {
  const [drafts, setDrafts] = useState(initialDrafts);

  useEffect(() => {
    const stored = getStoredPinDrafts();
    setDrafts([...stored, ...initialDrafts.filter((draft) => !stored.some((item) => item.id === draft.id))]);
  }, [initialDrafts]);

  const scheduledDrafts = useMemo(() => drafts.filter((draft) => draft.scheduledAt), [drafts]);

  function scheduleDraft(draft: PinDraftView, scheduledAt: string) {
    const updatedDraft = {
      ...draft,
      status: "scheduled" as const,
      scheduledAt: new Date(scheduledAt).toISOString()
    };
    updateStoredPinDraft(updatedDraft);
    setDrafts((current) => current.map((item) => (item.id === draft.id ? updatedDraft : item)));
  }

  if (!drafts.length) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No pin drafts yet"
        description="Generate Pinterest SEO for a product, create a pin draft, then schedule it here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-neutral-900 bg-[#050505] shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-900 bg-black text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Pin</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Scheduled</th>
              <th className="px-4 py-3 font-medium">Set time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {drafts.map((draft) => (
              <tr key={draft.id}>
                <td className="px-4 py-4 font-medium">{draft.title}</td>
                <td className="px-4 py-4 capitalize text-neutral-600">{draft.status}</td>
                <td className="px-4 py-4 text-neutral-600">
                  {draft.scheduledAt ? new Date(draft.scheduledAt).toLocaleString() : "Not scheduled"}
                </td>
                <td className="px-4 py-4">
                  <input
                    type="datetime-local"
                    className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus-ring"
                    onChange={(event) => {
                      if (event.target.value) {
                        scheduleDraft(draft, event.target.value);
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!scheduledDrafts.length && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
          You have drafts, but none are scheduled yet.
        </p>
      )}
    </div>
  );
}
