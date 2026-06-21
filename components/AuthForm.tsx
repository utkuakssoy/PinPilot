"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    setMessage("Bu MVP tek kullanicilik calisir. Demo moda devam edebilirsin.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-neutral-900 bg-[#050505] p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-neutral-400">Sign in</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Access PinPilot</h1>
      </div>
      <label className="mt-5 block text-sm font-semibold text-neutral-200">
        <span className="mb-2 block">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus-ring"
          placeholder="seller@example.com"
        />
      </label>
      <button
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm disabled:opacity-60"
      >
        <Mail className="h-4 w-4" />
        {loading ? "Sending..." : "Send magic link"}
      </button>
      <Link
        href="/connect/etsy"
        className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-neutral-800 bg-black px-4 py-2 text-sm font-medium text-neutral-100 shadow-sm"
      >
        Continue in demo mode
      </Link>
      {message && <p className="mt-4 rounded-md border border-emerald-900/70 bg-emerald-950/30 p-3 text-sm text-emerald-200">{message}</p>}
      {error && <p className="mt-4 rounded-md border border-red-900/70 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
    </form>
  );
}
