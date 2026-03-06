"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Youtube, LayoutDashboard, Wrench, Crown, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

const PUBLIC_LINKS = [
    { label: "About", href: "/about" },
    { label: "Tools", href: "/tools" },
    { label: "Pricing", href: "/pricing" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
];

const LOGGED_IN_LINKS = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tools", href: "/tools" },
    { label: "Create Video", href: "/create" },
    { label: "Pricing", href: "/pricing" },
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
        <footer className="border-t border-zinc-200 mt-16 dark:border-zinc-800 footer-separator">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="grid gap-8 sm:grid-cols-3">
                    {/* Brand */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="TuneVid logo"
                                className="w-7 h-7 rounded-lg object-contain dark:invert"
                            />
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                TuneVid
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                            {isLoggedIn
                                ? "Your AI-powered audio studio. Process audio, create visualizers, and publish to YouTube."
                                : "The free AI-powered audio studio for creators. Process audio, create visualizers, and publish to YouTube."
                            }
                        </p>
                        {!isLoggedIn && (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                            >
                                <LogIn className="h-3.5 w-3.5" />
                                Sign in free →
                            </Link>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                            {isLoggedIn ? "Navigation" : "Quick Links"}
                        </p>
                        <div className="flex flex-col gap-2">
                            {footerLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors w-fit"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isLoggedIn && (
                                <>
                                    <Link
                                        href="/privacy-policy"
                                        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors w-fit"
                                    >
                                        Privacy Policy
                                    </Link>
                                    <Link
                                        href="/terms"
                                        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors w-fit"
                                    >
                                        Terms of Service
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Social / Legal */}
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                            Connect
                        </p>
                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                        >
                            <Youtube className="h-4 w-4" strokeWidth={1.5} />
                            YouTube
                        </a>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Built with ❤️ for independent creators, musicians, and podcasters worldwide.
                        </p>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        © {new Date().getFullYear()} TuneVid. All rights reserved.
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center sm:text-right max-w-md">
                        Powered by{" "}
                        <a
                            href="https://developers.google.com/youtube/v3"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            YouTube Data API v3
                        </a>
                        {" · "}
                        By using this service you agree to the{" "}
                        <a
                            href="https://www.youtube.com/t/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            YouTube ToS
                        </a>
                        {" & "}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            Google Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
