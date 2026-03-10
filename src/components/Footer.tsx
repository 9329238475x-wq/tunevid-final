"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Youtube,
  Music,
  Headphones,
  Sparkles,
  Zap,
  Shield,
  ArrowUpRight,
  Heart,
  Globe,
  Mail,
} from "lucide-react";

const PRODUCT_LINKS = [
  { label: "Audio Tools", href: "/tools" },
  { label: "YouTube Upload", href: "/create" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "All Features", href: "/pricing" },
];

const TOOLS_LINKS = [
  { label: "Vocal Remover", href: "/tools/vocal-remover" },
  { label: "Slowed + Reverb", href: "/tools/slowed-reverb" },
  { label: "Bass Booster", href: "/tools/bass-booster" },
  { label: "8D Audio", href: "/tools/8d-audio" },
  { label: "Audio Trimmer", href: "/tools/audio-trimmer" },
  { label: "BPM Finder", href: "/tools/bpm-finder" },
];

const RESOURCE_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Creator Resources", href: "/resources" },
  { label: "About Us", href: "/about" },
  { label: "Editorial Policy", href: "/editorial-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

const STATS = [
  { value: "13+", label: "Free Tools" },
  { value: "1080p", label: "HD Quality" },
  { value: "100%", label: "Free Forever" },
];

export default function Footer() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Gradient accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-emerald-500/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-zinc-50/80 dark:bg-[#0a0a0b] backdrop-blur-sm">
        {/* Stats banner */}
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative -top-6">
            <div className="rounded-2xl border border-zinc-200/80 bg-white/90 backdrop-blur-xl shadow-lg shadow-zinc-900/[0.03] dark:border-zinc-800/60 dark:bg-zinc-900/80 dark:shadow-black/20">
              <div className="grid grid-cols-3 divide-x divide-zinc-200/60 dark:divide-zinc-800/60">
                {STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center justify-center py-5 px-4">
                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 tracking-wide uppercase">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="mx-auto max-w-6xl px-6 pb-8">
          <div className="grid gap-10 sm:gap-8 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand column */}
            <div className="lg:col-span-4 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md shadow-emerald-500/20">
                  <Music className="h-4.5 w-4.5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    TuneVid
                  </h3>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wider uppercase">
                    AI Audio Studio
                  </p>
                </div>
              </div>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                The ultimate free platform for creators. Process audio with 13+ tools, generate HD videos, and publish directly to YouTube — zero fees, zero limits.
              </p>

              {/* Social / CTA */}
              <div className="flex items-center gap-2">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Youtube className="h-3.5 w-3.5" strokeWidth={2} />
                  Start Creating
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  Explore Tools
                </Link>
              </div>
            </div>

            {/* Product links */}
            <div className="lg:col-span-2 lg:col-start-6">
              <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-4">
                Product
              </h4>
              <ul className="space-y-2.5">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
                    >
                      <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-emerald-500 group-hover:shadow-sm group-hover:shadow-emerald-500/50 transition-all duration-200" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools links */}
            <div className="lg:col-span-3">
              <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-4">
                Popular Tools
              </h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-1">
                {TOOLS_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
                    >
                      <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-emerald-500 group-hover:shadow-sm group-hover:shadow-emerald-500/50 transition-all duration-200" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal / Resources */}
            <div className="lg:col-span-3">
              <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
                    >
                      <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-emerald-500 group-hover:shadow-sm group-hover:shadow-emerald-500/50 transition-all duration-200" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Feature badges */}
              <div className="mt-6 space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/60 bg-emerald-50/60 px-2.5 py-1.5 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                  <Shield className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">SSL Secured</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200/60 bg-blue-50/60 px-2.5 py-1.5 ml-2 dark:border-blue-800/30 dark:bg-blue-900/10">
                  <Globe className="h-3 w-3 text-blue-500" strokeWidth={2} />
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">100% Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                © {new Date().getFullYear()} TuneVid. All rights reserved.
              </p>

              <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                <span>Built with</span>
                <Heart className="h-3 w-3 text-rose-400 fill-rose-400 animate-pulse" />
                <span>for creators worldwide</span>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/privacy-policy"
                  className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="/about"
                  className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                >
                  About
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}




