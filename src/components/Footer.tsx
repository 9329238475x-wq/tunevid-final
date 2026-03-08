"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Upload, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";

const PUBLIC_LINKS = [
  { label: "About", href: "/about" },
  { label: "Tools", href: "/tools" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
];

const LOGGED_IN_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Create", href: "/create" },
  { label: "Tools", href: "/tools" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isLoggedIn = !!session;
  const footerLinks = isLoggedIn ? LOGGED_IN_LINKS : PUBLIC_LINKS;

  return (
    <footer className="mt-14 border-t border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-950/80 footer-separator">
      <div className="mx-auto max-w-4xl px-5 py-9 sm:px-7">
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="TuneVid logo"
                className="h-7 w-7 rounded-md object-contain dark:invert"
              />
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">TuneVid</p>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1e4573] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#16365a]"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Files
            </Link>
          </div>

          <div className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <p>
              1. Select an <span className="font-semibold">Audio File</span> (up to 25 MB)
            </p>
            <p>
              2. Select an <span className="font-semibold">Image</span> (1920x1080px recommended)
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            <span className="inline-flex items-center gap-1.5">
              <CircleAlert className="h-3.5 w-3.5" />
              Audio and image must both be uploaded before publish.
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-zinc-900 dark:hover:text-zinc-100">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p>{`© ${new Date().getFullYear()} TuneVid. Built for fast audio-to-video YouTube uploads. 100% Free.`}</p>
        </div>
      </div>
    </footer>
  );
}
