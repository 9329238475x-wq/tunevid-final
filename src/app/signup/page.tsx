"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error || "Unable to create account.");
        return;
      }

      const login = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/tools",
        redirect: false,
      });

      if (login?.error) {
        setError("Account created, but sign-in failed. Please log in manually.");
        return;
      }

      window.location.href = login?.url || "/tools";
    } catch {
      setError("Unable to create account right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-zinc-50 dark:bg-[#0b0b0f] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg shadow-black/5 dark:border-white/10 dark:bg-gradient-to-b dark:from-[#14141a] dark:to-[#0f0f14] dark:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="TuneVid logo" className="w-8 h-8 rounded-lg object-contain dark:invert" />
          <span className="text-lg font-semibold text-zinc-900 dark:text-white">TuneVid</span>
        </Link>

        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Create account</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Sign up with your name, email, and password.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Name</span>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-9 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/30"
                placeholder="Your full name"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Email Address</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-9 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/30"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Password</span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-9 pr-10 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/30"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign Up
            </span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-zinc-900 hover:underline dark:text-white">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
