import Link from "next/link";
import { CheckCircle2, CircleAlert, Plug } from "lucide-react";
import { PinterestCredentialsForm } from "@/components/PinterestCredentialsForm";
import { hasPinterestCredentials, isPinterestConnected } from "@/services/pinterest";

export function PinterestConnectCard({
  connected,
  error
}: {
  connected?: boolean;
  error?: string;
}) {
  const pinterestConnected = isPinterestConnected() || connected;
  const pinterestReady = hasPinterestCredentials();

  return (
    <section className="max-w-3xl rounded-lg border border-neutral-900 bg-[#050505] p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-neutral-500">Pinterest</p>
          <h2 className="mt-1 text-xl font-semibold text-neutral-100">Connected social account</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Panolarini cekmek ve pinleri gercek Pinterest hesabina yayinlamak icin giris yap.
          </p>
        </div>
        <Link
          href="/api/pinterest/oauth/start"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-base font-semibold text-black shadow-sm aria-disabled:pointer-events-none aria-disabled:opacity-50"
          aria-disabled={!pinterestReady}
        >
          <Plug className="h-5 w-5" />
          Pinterest&apos;e giris yap
        </Link>
      </div>

      {!pinterestReady && (
        <div className="mt-4 rounded-md border border-amber-900/60 bg-amber-950/20 p-4 text-sm text-amber-300">
          <div className="flex items-center gap-2 font-semibold">
            <CircleAlert className="h-4 w-4" />
            Pinterest girisi icin bir defalik app bilgisi gerekiyor
          </div>
          <p className="mt-2">
            Pinterest, gercek hesaba pin yayinlayacak her uygulama icin Client ID ve Client Secret ister. Bunlari bir kez girince buton Pinterest&apos;i tarayicida acar.
          </p>
        </div>
      )}

      {!pinterestReady && <PinterestCredentialsForm />}

      {pinterestConnected && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-900/60 bg-emerald-950/20 p-4 text-sm font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Pinterest bagli. Artik pin yayinlayabilirsin.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-900/60 bg-red-950/20 p-4 text-sm font-medium text-red-300">
          {error}
        </div>
      )}
    </section>
  );
}
