"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Check,
    Sparkles,
    ArrowRight,
    Upload,
    Headphones,
    Infinity,
    Shield,
    Cpu,
    Youtube,
    Music,
    Scissors,
    Activity,
    Zap,
} from "lucide-react";

const FREE_FEATURES = [
    { text: "Unlimited YouTube uploads", included: true },
    { text: "Unlimited tool uses (no daily limits)", included: true },
    { text: "1080p HD video quality", included: true },
    { text: "500MB file limit", included: true },
    { text: "No watermark", included: true },
    { text: "13+ audio tools", included: true },
    { text: "Batch upload support", included: true },
    { text: "AI Vocal Remover", included: true },
    { text: "BPM & Key Finder", included: true },
    { text: "Slowed + Reverb, 8D Audio, Bass Booster", included: true },
];

export default function PricingPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-4 mb-12"
            >
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                    100% Free — No Hidden Fees
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Everything is{" "}
                    <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                        Completely Free
                    </span>
                </h1>

                <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
                    All 13+ audio tools, YouTube uploads, and video rendering — free forever.
                    No plans, no subscriptions, no credit card required.
                </p>
            </motion.div>

            {/* Single Free Plan Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative rounded-2xl border border-emerald-200 bg-white p-8 shadow-lg shadow-emerald-500/5 dark:border-emerald-800/30 dark:bg-zinc-950 max-w-xl mx-auto"
            >
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25">
                        <Sparkles className="h-3 w-3" fill="currentColor" />
                        FREE FOREVER
                    </span>
                </div>

                {/* Plan Header */}
                <div className="text-center space-y-3 mb-8 mt-2">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mx-auto">
                        <Sparkles className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">TuneVid Free</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Everything included, no limits</p>
                    </div>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-100">₹0</span>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">forever</span>
                    </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                    {FREE_FEATURES.map((feature, fi) => (
                        <li key={fi} className="flex items-start gap-2.5">
                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">{feature.text}</span>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <Link
                    href="/create"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition btn-depth"
                >
                    Start Creating — It&apos;s Free
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
            </motion.div>

            {/* What's Included */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-16 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
            >
                <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">
                    What&apos;s Included — Free
                </h2>
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-8">
                    No subscriptions, no hidden costs. All features are available to everyone.
                </p>

                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                    {[
                        {
                            icon: Upload,
                            title: "Unlimited Uploads",
                            desc: "No monthly caps — upload as many videos as you want.",
                            color: "text-blue-400",
                        },
                        {
                            icon: Headphones,
                            title: "Unlimited Tool Uses",
                            desc: "Use every tool as many times as you need, no cooldowns.",
                            color: "text-purple-400",
                        },
                        {
                            icon: Youtube,
                            title: "Direct YouTube Publishing",
                            desc: "Publish directly to your YouTube channel via secure OAuth.",
                            color: "text-red-400",
                        },
                        {
                            icon: Infinity,
                            title: "Batch Upload",
                            desc: "Upload 1 image + up to 5 audio files at once.",
                            color: "text-emerald-400",
                        },
                        {
                            icon: Cpu,
                            title: "1080p HD Quality",
                            desc: "All videos render at full 1080p HD quality.",
                            color: "text-pink-400",
                        },
                        {
                            icon: Shield,
                            title: "Privacy First",
                            desc: "All files auto-deleted after processing. We never keep copies.",
                            color: "text-cyan-400",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <item.icon className={`h-6 w-6 ${item.color} mb-3`} strokeWidth={1.5} />
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* FAQ */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-12 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
            >
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                    FAQ
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {[
                        { q: "Is TuneVid really free?", a: "Yes, 100% free. All tools, YouTube uploads, and features are available to everyone without any payment." },
                        { q: "Will there be paid plans in the future?", a: "TuneVid is committed to staying free for all creators. We sustain through ads and community support." },
                        { q: "Are there any usage limits?", a: "No. Use all 13+ tools as much as you want, upload unlimited videos to YouTube — zero restrictions." },
                        { q: "Is my Google account safe?", a: "Absolutely. We use secure OAuth 2.0 and never see or store your Google password." },
                    ].map((faq) => (
                        <div key={faq.q} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{faq.q}</p>
                            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </motion.section>
        </div>
    );
}
