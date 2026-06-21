import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-black">
      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Etsy Easy Post Tool</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Turn shop listings into ready-to-review marketing posts
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
          Import product listings, generate AI-assisted post copy, create drafts, and prepare content for a connected social account.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 rounded-md bg-black px-5 py-3 text-base font-semibold text-white shadow-sm"
        >
          Open app
        </Link>
      </section>

      <footer className="border-t border-neutral-200 px-6 py-5 text-center text-sm text-neutral-600">
        <Link href="/privacy" className="font-medium text-black underline underline-offset-4">
          Privacy Policy
        </Link>
      </footer>
    </main>
  );
}
