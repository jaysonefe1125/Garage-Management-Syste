"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/styles";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rail px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-line bg-panel p-8 shadow-lg"
      >
        <div className="mb-1 h-1 w-10 bg-accent" />
        <h1 className="mb-6 font-display text-2xl uppercase tracking-wide text-ink">
          Garage Service System
        </h1>

        <label className={labelClass}>Username</label>
        <input
          className={`${inputClass} mb-4`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label className={labelClass}>Password</label>
        <input
          type="password"
          className={`${inputClass} mb-4`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="mb-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full ${primaryButtonClass} disabled:opacity-60`}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
