"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    BarChart3,
    Clock,
    Copy,
    Crown,
    ExternalLink,
    Gift,
    Loader2,
    Share2,
    Shield,
    Sparkles,
    Upload,
    Users,
    Zap,
    Check,
    ArrowRight,
    Youtube,
    Timer,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";

interface ToolUsage {
    tool_name: string;
    used: number;
    max: number;
    remaining: number;
    last_used_at: string | null;
    reset_at: string | null;
}

interface DashboardData {
    user: {
        id: string;
        email: string;
        name: string;
        avatar: string;
        plan_type: string;
        subscription_end_date: string | null;
        referral_code: string;
    };
    plan_limits: {
        youtube_uploads_monthly: number;
        tool_uses_24h: number;
        max_file_size_mb: number;
        quality: string;
        batch_upload: boolean;
        api_access: boolean;
        priority_queue: boolean;
    };
    tool_usage: ToolUsage[];
    youtube_uploads: {
        used: number;
        max: number;
        remaining: number;
        period_start: string;
    };
    referrals: {
        total: number;
        rewarded: number;
        pending: number;
        referral_code: string;
        referral_link: string;
    };
}

function buildFallbackDashboard(session: any): DashboardData {
    const referralCode = "TV-DEMO1234";
    return {
        user: {
            id: "",
            email: session?.user?.email || "",
            name: session?.user?.name || "",
            avatar: session?.user?.image || "",
            plan_type: "free",
            subscription_end_date: null,
            referral_code: referralCode,
        },
        plan_limits: {
            youtube_uploads_monthly: 5,
            tool_uses_24h: 3,
            max_file_size_mb: 50,
            quality: "1080p",
            batch_upload: false,
            api_access: false,
            priority_queue: false,
        },
        tool_usage: [],
        youtube_uploads: {
            used: 0,
            max: 5,
            remaining: 5,
            period_start: new Date().toISOString(),
        },
        referrals: {
            total: 0,
            rewarded: 0,
            pending: 0,
            referral_code: referralCode,
            referral_link: `https://tunevid.com/?ref=${referralCode}`,
        },
    };
}

const TOOL_LABELS: Record<string, string> = {
    vocal_remover: "Vocal Remover",
    trim_audio: "Audio Trimmer",
    slowed_reverb: "Slowed + Reverb",
    convert_audio: "Audio Converter",
    bass_boost: "Bass Booster",
    "8d_audio": "8D Audio",
    merge_audio: "Audio Merger",
    compress_audio: "Audio Compressor",
    denoise_audio: "Noise Reducer",
    remove_silence: "Silence Remover",
    analyze_bpm: "BPM Finder",
};

const PLAN_BADGES: Record<string, { label: string; color: string; icon: any }> = {
    free: { label: "Free", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: Sparkles },
    pro: { label: "Pro", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Zap },
    max: { label: "Max", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Crown },
};

function CooldownTimer({ resetAt }: { resetAt: string }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const update = () => {
            const now = new Date().getTime();
            const reset = new Date(resetAt).getTime();
            const diff = reset - now;

            if (diff <= 0) {
                setTimeLeft("Ready!");
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [resetAt]);

    if (timeLeft === "Ready!") {
        return (
            <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                <Check className="h-3 w-3" /> Ready
            </span>
        );
    }

    return (
        <span className="text-xs font-mono font-medium text-amber-500 flex items-center gap-1">
            <Timer className="h-3 w-3" />
            {timeLeft}
        </span>
    );
}

function DashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const upgraded = searchParams.get("upgraded") === "true";

    const fetchDashboard = useCallback(async () => {
        if (!session?.accessToken) return;

        // Try session cache first for instant paint.
        let hasWarmData = false;
        try {
            const cached = sessionStorage.getItem("tunevid_dashboard");
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed._ts < 60000) { // 1 min cache
                    setData(parsed.data);
                    setLoading(false);
                    hasWarmData = true;
                }
            }
        } catch {}

        // If cache miss, paint lightweight fallback immediately, then revalidate.
        if (!hasWarmData) {
            setData((prev) => prev ?? buildFallbackDashboard(session));
            setLoading(false);
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3500); // fail fast, keep UI snappy
            
            const res = await fetch(`${API_BASE}/api/user/dashboard`, {
                headers: { Authorization: `Bearer ${session.accessToken}` },
                signal: controller.signal,
            });
            clearTimeout(timeout);
            
            if (res.ok) {
                const dashData = await res.json();
                setData(dashData);
                // Cache for faster subsequent loads
                try {
                    sessionStorage.setItem("tunevid_dashboard", JSON.stringify({ data: dashData, _ts: Date.now() }));
                } catch {}
            }
        } catch {
            setData((prev) => prev ?? buildFallbackDashboard(session));
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/dashboard");
            return;
        }
        if (status === "authenticated") {
            fetchDashboard();
        }
    }, [status, fetchDashboard, router]);

    const copyReferralCode = () => {
        if (data?.referrals.referral_link) {
            navigator.clipboard.writeText(data.referrals.referral_link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    const planBadge = PLAN_BADGES[data.user.plan_type] || PLAN_BADGES.free;
    const PlanIcon = planBadge.icon;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8">
            {/* Upgrade Success Banner */}
            {upgraded && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-center text-white font-semibold shadow-lg"
                >
                    🎉 You&apos;re now on the {data.user.plan_type.toUpperCase()} plan! Enjoy unlimited power.
                </motion.div>
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div className="flex items-center gap-4">
                    {data.user.avatar && (
                        <img
                            src={data.user.avatar}
                            alt={data.user.name}
                            className="h-14 w-14 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-800"
                        />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            Welcome, {data.user.name || "Creator"}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${planBadge.color}`}>
                                <PlanIcon className="h-3 w-3" />
                                {planBadge.label} Plan
                            </span>
                            {data.user.subscription_end_date && (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Renews {new Date(data.user.subscription_end_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {data.user.plan_type === "free" && (
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition btn-depth"
                    >
                        <Zap className="h-4 w-4" />
                        Upgrade Plan
                    </Link>
                )}
            </motion.div>

            {/* Stats Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* YouTube Uploads */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20">
                            <Youtube className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">YouTube Uploads</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">This month</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            {data.youtube_uploads.used}
                            <span className="text-sm font-normal text-zinc-400">
                                /{data.youtube_uploads.max === -1 ? "∞" : data.youtube_uploads.max}
                            </span>
                        </p>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-500"
                            style={{
                                width:
                                    data.youtube_uploads.max === -1
                                        ? "10%"
                                        : `${Math.min(100, (data.youtube_uploads.used / data.youtube_uploads.max) * 100)}%`,
                            }}
                        />
                    </div>
                </motion.div>

                {/* Tool Uses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools Used Today</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">Per tool limit</p>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {data.tool_usage.length}
                        <span className="text-sm font-normal text-zinc-400 ml-1">tools active</span>
                    </p>
                    <p className="text-xs text-zinc-400 mt-2">
                        Limit: {data.plan_limits.tool_uses_24h === -1 ? "Unlimited" : `${data.plan_limits.tool_uses_24h}/tool/24h`}
                    </p>
                </motion.div>

                {/* File Limit */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                            <Upload className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">File Limit</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">Per upload</p>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {data.plan_limits.max_file_size_mb >= 1024
                            ? `${(data.plan_limits.max_file_size_mb / 1024).toFixed(0)}GB`
                            : `${data.plan_limits.max_file_size_mb}MB`}
                    </p>
                    <p className="text-xs text-zinc-400 mt-2">Quality: {data.plan_limits.quality}</p>
                </motion.div>

                {/* Referrals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <Users className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Referrals</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">Users invited</p>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {data.referrals.total}
                    </p>
                    <p className="text-xs text-zinc-400 mt-2">
                        {data.referrals.rewarded} rewarded · {data.referrals.pending} pending
                    </p>
                </motion.div>
            </div>

            {/* Usage & Limits Detail + Referral Card */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Tool Usage Detail */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            Usage & Limits
                        </h2>
                        <span className="text-xs text-zinc-400">Resets every 24h</span>
                    </div>

                    {data.tool_usage.length === 0 ? (
                        <div className="text-center py-8 text-zinc-400 dark:text-zinc-500">
                            <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No tools used yet today. Start creating!</p>
                            <Link
                                href="/tools"
                                className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-500"
                            >
                                Explore tools <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.tool_usage.map((usage) => {
                                const maxVal = usage.max === -1 ? 100 : usage.max;
                                const pct = usage.max === -1 ? 5 : Math.min(100, (usage.used / maxVal) * 100);
                                const atLimit = usage.max !== -1 && usage.used >= usage.max;

                                return (
                                    <div key={usage.tool_name} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                {TOOL_LABELS[usage.tool_name] || usage.tool_name}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-semibold ${atLimit ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                                                    {usage.used}/{usage.max === -1 ? "∞" : usage.max}
                                                </span>
                                                {atLimit && usage.reset_at && <CooldownTimer resetAt={usage.reset_at} />}
                                            </div>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${atLimit ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                                                    }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Referral Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
                >
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
                        <Gift className="h-5 w-5 text-purple-500" />
                        Refer & Earn
                    </h2>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-4 border border-purple-200/50 dark:border-purple-800/30">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Get 1 Month Pro Free!</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                Share your referral link. When your friend uploads or subscribes, you get a free month of Pro.
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Your referral link</p>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={data.referrals.referral_link}
                                    className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 truncate"
                                />
                                <button
                                    onClick={copyReferralCode}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <div className="flex-1 rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-900">
                                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{data.referrals.total}</p>
                                <p className="text-[10px] text-zinc-400">Total</p>
                            </div>
                            <div className="flex-1 rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-900">
                                <p className="text-xl font-bold text-emerald-500">{data.referrals.rewarded}</p>
                                <p className="text-[10px] text-zinc-400">Rewarded</p>
                            </div>
                            <div className="flex-1 rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-900">
                                <p className="text-xl font-bold text-amber-500">{data.referrals.pending}</p>
                                <p className="text-[10px] text-zinc-400">Pending</p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: "Join TuneVid — Free AI Audio Studio",
                                        text: "Use my referral link to join TuneVid and we both get Pro features!",
                                        url: data.referrals.referral_link,
                                    });
                                } else {
                                    copyReferralCode();
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition btn-depth"
                        >
                            <Share2 className="h-4 w-4" />
                            Share Referral Link
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid gap-4 sm:grid-cols-3"
            >
                <Link
                    href="/create"
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <Upload className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Upload & Publish</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Create a new video</p>
                    </div>
                </Link>

                <Link
                    href="/tools"
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Audio Tools</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">13+ free tools</p>
                    </div>
                </Link>

                <Link
                    href="/pricing"
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        <Crown className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Manage Plan</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">View pricing & upgrade</p>
                    </div>
                </Link>
            </motion.div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}

