"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/tools";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const syncCanSubmit = () => {
    const emailVal = emailRef.current?.value?.trim() || "";
    const passwordVal = passwordRef.current?.value || "";
    setCanSubmit(emailVal.length > 0 && passwordVal.length > 0);
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  useEffect(() => {
    // Handles browser autofill cases where onChange may not fire.
    const t1 = window.setTimeout(syncCanSubmit, 50);
    const t2 = window.setTimeout(syncCanSubmit, 300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  async function onCredentialsSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.replace(result?.url ?? callbackUrl);
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-zinc-50 dark:bg-[#0b0b0f] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg shadow-black/5 dark:border-white/10 dark:bg-gradient-to-b dark:from-[#14141a] dark:to-[#0f0f14] dark:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="TuneVid logo" className="w-8 h-8 rounded-lg object-contain dark:invert" />
          <span className="text-lg font-semibold text-zinc-900 dark:text-white">TuneVid</span>
        </Link>

        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Sign in</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Continue with Google or use your email and password.</p>

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="mt-6 w-full rounded-xl border border-zinc-200 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-zinc-800 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          disabled={status === "loading" || submitting}
        >
          <span className="flex items-center justify-center gap-2">
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.3H12z"
                />
                <path
                  fill="#34A853"
                  d="M2.8 7.1l3.2 2.4C6.8 7.7 9.2 6 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4c-3.6 0-6.7 2-8.3 4.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M12 20.8c2.6 0 4.8-.9 6.4-2.5l-3-2.4c-.8.6-1.9 1.1-3.4 1.1-3 0-5.5-2-6.4-4.7l-3.3 2.5c1.7 3.3 5.1 6 9.7 6z"
                />
                <path
                  fill="#4285F4"
                  d="M21.1 13.5c0-.5 0-.9-.1-1.3H12v3.9h5.5c-.3 1.3-1.1 2.2-2.1 2.9l3 2.4c1.8-1.7 2.7-4.1 2.7-7.9z"
                />
              </svg>
            )}
            Continue with Google
          </span>
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
          <span className="text-xs font-semibold tracking-wide text-zinc-400">OR</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
        </div>

        <form className="space-y-4" onSubmit={onCredentialsSignIn}>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Email Address</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                ref={emailRef}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  syncCanSubmit();
                }}
                onInput={syncCanSubmit}
                onBlur={syncCanSubmit}
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
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  syncCanSubmit();
                }}
                onInput={syncCanSubmit}
                onBlur={syncCanSubmit}
                className="w-full rounded-xl border border-zinc-200 bg-white px-9 pr-10 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/30"
                placeholder="Enter your password"
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
            disabled={!canSubmit || submitting}
            className={[
              "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              canSubmit && !submitting
                ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                : "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
            ].join(" ")}
          >
            <span className="flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign In
            </span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-zinc-900 hover:underline dark:text-white">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-120px)] bg-zinc-50 dark:bg-[#0b0b0f] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
