import { LoadingState } from "@/components/LoadingState";

export default function Loading() {
  return (
    <div className="grid min-h-96 place-items-center rounded-lg border border-neutral-900 bg-[#050505]">
      <LoadingState />
    </div>
  );
}
