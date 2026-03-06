"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Headphones,
    MicOff,
    Sparkles,
    Upload,
    Youtube,
    Zap,
    Shield,
    Clock,
    Layers,
    Music,
    Scissors,
    Activity,
} from "lucide-react";
import { fadeInUpVariants, staggerContainer } from "@/utils/animations";
import AnimatedButton from "./AnimatedButton";

const TOOLS_PREVIEW = [
    { icon: MicOff, label: "Vocal Remover", color: "text-blue-400" },
    { icon: Activity, label: "BPM Finder", color: "text-green-400" },
    { icon: Scissors, label: "Audio Trimmer", color: "text-indigo-400" },
    { icon: Sparkles, label: "Slowed + Reverb", color: "text-purple-400" },
    { icon: Headphones, label: "8D Audio", color: "text-pink-400" },
    { icon: Zap, label: "Bass Booster", color: "text-red-400" },
];

export default function Landing() {
    const { data: session } = useSession();

    return (
        <div className="mx-auto max-w-6xl px-6 py-12 space-y-20 text-zinc-900 dark:text-zinc-100">
            {/* ── HERO SECTION ── */}
            <motion.section 
                className="relative flex flex-col items-center text-center space-y-8 py-8 md:py-16"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {/* Badge */}
                <motion.div 
                    variants={fadeInUpVariants}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />
                    Free AI-Powered Audio Studio
                </motion.div>

                {/* Headline */}
                <motion.h1 
                    variants={fadeInUpVariants}
                    className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-4xl"
                >
                    Transform Audio into{" "}
                    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Viral Content
                    </span>{" "}
                    with AI
                </motion.h1>

                {/* Subtitle */}
                <motion.p 
                    variants={fadeInUpVariants}
                    className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed"
                >
                    The all-in-one studio to create audio visualizers, remove vocals,
                    boost bass, find BPM, and publish directly to YouTube — completely free.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div 
                    variants={fadeInUpVariants}
                    className="flex flex-col sm:flex-row items-center gap-3"
                >
                    <Link href={session ? "/create" : "/login"}>
                        <AnimatedButton className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:shadow-emerald-500/30 transition-all duration-200 btn-depth">
                            {session ? "Create Video" : "Get Started — It's Free"}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                        </AnimatedButton>
                    </Link>
                    <Link href="/tools">
                        <AnimatedButton className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 btn-depth">
                            Explore 13+ Tools
                        </AnimatedButton>
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div 
                    variants={fadeInUpVariants}
                    className="grid grid-cols-3 gap-6 pt-4 text-center"
                >
                    {[
                        { value: "13+", label: "Audio Tools" },
                        { value: "Free", label: "No Hidden Fees" },
                        { value: "AI", label: "Powered" },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </motion.section>

            {/* ── 3 CORE PILLARS ── */}
            <section className="grid gap-5 md:grid-cols-3">
                {[
                    {
                        icon: Sparkles,
                        title: "AI Audio Studio",
                        copy: "Remove vocals, boost bass, create 8D audio, find BPM — 13+ professional audio tools powered by AI and FFmpeg.",
                        color: "text-purple-400",
                    },
                    {
                        icon: Music,
                        title: "Pro Visualizers",
                        copy: "Turn audio + artwork into stunning YouTube-ready visualizer videos with bass-reactive animations.",
                        color: "text-cyan-400",
                    },
                    {
                        icon: Youtube,
                        title: "Direct YT Publishing",
                        copy: "Publish directly to your YouTube channel with secure OAuth. Full control over metadata and privacy.",
                        color: "text-red-400",
                    },
                ].map((item) => (
                    <div
                        key={item.title}
                        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 card-elevated transition-all duration-200"
                    >
                        <item.icon className={`h-8 w-8 ${item.color} mb-4`} strokeWidth={1.5} />
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                        <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400 leading-relaxed">{item.copy}</p>
                    </div>
                ))}
            </section>

            {/* ── HOW IT WORKS (1-2-3 Steps) ── */}
            <section className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm space-y-8 dark:border-zinc-800 dark:bg-zinc-950 card-feature transition-all duration-200">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">How It Works</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Three simple steps to publish studio-quality content</p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        {
                            step: "01",
                            icon: Upload,
                            title: "Upload Your Audio",
                            copy: "Drop your MP3/WAV file and cover artwork. We support up to 50MB high-fidelity audio.",
                            color: "text-emerald-400",
                        },
                        {
                            step: "02",
                            icon: Zap,
                            title: "Process with AI",
                            copy: "Remove vocals, boost bass, add reverb — or go straight to video rendering with one click.",
                            color: "text-blue-400",
                        },
                        {
                            step: "03",
                            icon: Youtube,
                            title: "Publish to YouTube",
                            copy: "Set your title, description, and privacy — then hit publish. Your video goes live instantly.",
                            color: "text-red-400",
                        },
                    ].map((item) => (
                        <div key={item.step} className="relative rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                Step {item.step}
                            </span>
                            <item.icon className={`h-6 w-6 ${item.color} mt-3`} strokeWidth={1.5} />
                            <h3 className="text-sm font-semibold text-zinc-900 mt-3 dark:text-zinc-100">{item.title}</h3>
                            <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400 leading-relaxed">{item.copy}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── TOOLS PREVIEW STRIP ── */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Audio Tools Suite</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Professional-grade tools, free forever</p>
                    </div>
                    <Link
                        href="/tools"
                        className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition"
                    >
                        View all tools <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {TOOLS_PREVIEW.map((tool) => (
                        <div
                            key={tool.label}
                            className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-950 card-elevated transition-all duration-200 hover:-translate-y-1"
                        >
                            <tool.icon className={`h-6 w-6 ${tool.color}`} strokeWidth={1.5} />
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{tool.label}</span>
                        </div>
                    ))}
                </div>
                <div className="sm:hidden text-center">
                    <Link
                        href="/tools"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600"
                    >
                        View all 13+ tools <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </Link>
                </div>
            </section>

            {/* ── ENTERPRISE FEATURES ── */}
            <section className="space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Built for Creators Who Ship</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Enterprise polish without the overhead</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        { icon: Shield, title: "Secure by Design", copy: "OAuth-based access means TuneVid never sees or stores your password." },
                        { icon: Clock, title: "Fast Rendering", copy: "Optimized FFmpeg pipeline renders visualizer videos in minutes, not hours." },
                        { icon: Layers, title: "Precision Metadata", copy: "Full control over titles, descriptions, tags, and privacy before every publish." },
                        { icon: Youtube, title: "Artist-First Delivery", copy: "Videos publish to your own channel — monetization and control stay with you." },
                        { icon: Upload, title: "Batch-Ready Workflow", copy: "Repeatable, consistent flow so your audience sees new releases on schedule." },
                        { icon: Shield, title: "Privacy Focused", copy: "All files are auto-deleted after processing. We never keep copies." },
                    ].map((f) => (
                        <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 card-elevated transition-all duration-200">
                            <f.icon className="h-5 w-5 text-emerald-500 mb-3" strokeWidth={1.5} />
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{f.title}</h3>
                            <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400">{f.copy}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 dark:border-zinc-800 dark:bg-zinc-950 card-elevated transition-all duration-200">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Frequently Asked Questions</h2>
                    <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400">Quick answers for creators</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                    {[
                        { q: "Is TuneVid completely free?", a: "Yes. All 13+ audio tools and YouTube publishing are free for creators. No hidden fees, ever." },
                        { q: "Do uploads go to my YouTube channel?", a: "Yes. Everything publishes directly to your connected YouTube account. You own everything." },
                        { q: "Do you store my files?", a: "No. Files are automatically deleted from our servers after processing is complete." },
                        { q: "What audio formats are supported?", a: "MP3, WAV, FLAC, M4A, and OGG. We support files up to 50MB (100MB for converter)." },
                        { q: "Is my Google account safe?", a: "Absolutely. We use secure OAuth 2.0 and never see or store your password." },
                        { q: "Can I remove vocals from any song?", a: "Yes. Our AI Vocal Remover uses Spleeter to separate vocals, drums, bass, and instrumentals." },
                    ].map((faq) => (
                        <div key={faq.q} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{faq.q}</p>
                            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SEO-RICH TEXT SECTION (AdSense compliance) ── */}
            <section className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 dark:border-zinc-800 dark:bg-zinc-950 card-elevated">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    The Complete Audio Toolkit for YouTube Creators
                </h2>
                <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-4">
                    <p>
                        <strong>TuneVid</strong> is a free, all-in-one audio processing platform designed for musicians,
                        podcasters, DJs, and content creators who want to produce professional-quality audio content
                        and publish it directly to YouTube without expensive software.
                    </p>
                    <p>
                        Our <strong>AI Vocal Remover</strong> uses Deezer&apos;s Spleeter technology to separate vocals
                        from instrumentals with studio-grade accuracy. Extract 2 stems (vocals + music) or 4 stems
                        (vocals, drums, bass, other) from any audio track instantly.
                    </p>
                    <p>
                        The <strong>BPM &amp; Key Finder</strong> analyzes tempo and musical key using librosa, helping
                        DJs match tracks and producers find the perfect sample. Our <strong>Audio Trimmer</strong>{" "}
                        features a visual waveform editor with precision start/end controls for exact cuts.
                    </p>
                    <p>
                        Create viral lo-fi remixes with <strong>Slowed + Reverb</strong>, immersive{" "}
                        <strong>8D Audio</strong> with spatial rotation, or pump up your tracks with{" "}
                        <strong>Bass Booster</strong> presets for car mixes and remixes. Convert between MP3, WAV,
                        FLAC, M4A, and OGG with our <strong>Audio Converter</strong>, or reduce file sizes with
                        the <strong>Audio Compressor</strong>.
                    </p>
                    <p>
                        For podcasters and voice-over artists, our <strong>AI Noise Reducer</strong> removes background
                        hiss and hum, while the <strong>Smart Silence Remover</strong> automatically trims dead air
                        from recordings. Combine multiple tracks seamlessly with the <strong>Audio Merger</strong>{" "}
                        featuring optional crossfade transitions.
                    </p>
                    <p>
                        The <strong>YouTube Video Uploader</strong> is the crown jewel — upload your MP3 and cover art,
                        and TuneVid renders a bass-reactive audio visualizer video and publishes it directly to your
                        YouTube channel via the YouTube Data API v3. Secure OAuth 2.0 authentication ensures your
                        account stays safe, and all files are automatically deleted after processing.
                    </p>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-600 p-8 sm:p-12 text-center space-y-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to Create?</h2>
                <p className="text-sm text-emerald-100 max-w-xl mx-auto">
                    Join thousands of creators using TuneVid to process audio, create visualizers,
                    and publish to YouTube — all for free.
                </p>
                <Link
                    href={session ? "/create" : "/login"}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-emerald-700 shadow-lg hover:bg-emerald-50 transition btn-depth"
                >
                    {session ? "Start Creating" : "Get Started — It's Free"}
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
            </section>
        </div>
    );
}
