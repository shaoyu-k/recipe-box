"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      router.push(params.get("next") || "/");
      router.refresh();
    } else {
      setError("That code doesn't match. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-sm border border-line bg-card p-6"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          The Recipe Box
        </p>
        <h1 className="-mt-0.5 font-display text-3xl italic text-ink">
          Enter the access code
        </h1>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Access code"
          autoFocus
          className="mt-5 w-full rounded-sm border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
        />
        {error && <p className="mt-2 text-sm text-tomato">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full rounded-full bg-tomato px-5 py-2.5 text-sm font-medium text-card hover:bg-tomato-dark disabled:opacity-60"
        >
          {submitting ? "Checking…" : "Open the box"}
        </button>
      </form>
    </main>
  );
}
