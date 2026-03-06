"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Uploader from "../../components/Uploader";
import UpgradeModal from "../../components/UpgradeModal";
import { Layers, Crown, Zap, Clock, AlertTriangle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function CreatePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [planType, setPlanType] = useState("free");
    const [ytStatus, setYtStatus] = useState<{ used_today: number; max_daily: number; remaining: number; can_upload: boolean; reset_at: string | null } | null>(null);
    const [ytLoading, setYtLoading] = useState(true);

    // Fetch plan type and YouTube upload status
    const fetchUserStatus = useCallback(async () => {
        if (!session?.accessToken) return;

        try {
            const [planRes, ytRes] = await Promise.all([
                fetch(`${API_BASE}/api/user/me`, { headers: { Authorization: `Bearer ${session.accessToken}` } }),
                fetch(`${API_BASE}/api/user/youtube-upload-status`, { headers: { Authorization: `Bearer ${session.accessToken}` } }),
            ]);

            if (planRes.ok) {
                const planData = await planRes.json();
                setPlanType(planData.plan_type || "free");
            }

            if (ytRes.ok) {
                const ytData = await ytRes.json();
                setYtStatus(ytData);
            }
        } catch (e) {
            console.error("Failed to fetch user status:", e);
        } finally {
            setYtLoading(false);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchUserStatus();
        }
    }, [status, fetchUserStatus]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-800 animate-spin" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="py-6">
            <div className="mx-auto max-w-5xl px-6">
                <div className="flex items-center justify-between pb-4">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Upload to YouTube
                    </p>
                    <div className="flex items-center gap-3">
                        {/* Batch Upload Button */}
                        <button
                            onClick={() => {
                                if (planType === "free") {
                                    setShowUpgradeModal(true);
                                } else {
                                    // Navigate to batch upload or toggle batch mode
                                    router.push("/create?mode=batch");
                                }
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${planType === "free"
                                ? "border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
                                : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                }`}
                        >
                            <Layers className="h-3.5 w-3.5" />
                            Batch Upload
                            {planType === "free" && (
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold dark:bg-amber-900/30 dark:text-amber-400">
                                    PRO
                                </span>
                            )}
                        </button>

                        <Link
                            href="/tools"
                            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            Back to Tools
                        </Link>
                    </div>
                </div>

                {/* YouTube Upload Limit Banner */}
                {planType === "free" && ytStatus && !ytLoading && (
                    <div className={`mb-4 rounded-lg border p-3 flex items-center justify-between ${ytStatus.can_upload
                            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-900/10"
                            : "border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/10"
                        }`}>
                        <div className="flex items-center gap-2">
                            {ytStatus.can_upload ? (
                                <>
                                    <Zap className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                        {ytStatus.remaining} YouTube upload{ytStatus.remaining !== 1 ? 's' : ''} remaining today
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Clock className="h-4 w-4 text-red-500" />
                                    <span className="text-xs font-medium text-red-700 dark:text-red-400">
                                        Daily upload limit reached
                                    </span>
                                </>
                            )}
                        </div>
                        {!ytStatus.can_upload && ytStatus.reset_at && (
                            <Link
                                href="/pricing"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                            >
                                Upgrade for Unlimited →
                            </Link>
                        )}
                    </div>
                )}

                {/* Plan Banner for Free Users */}
                {planType === "free" && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center justify-between dark:border-amber-800/30 dark:bg-amber-900/10">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                <span className="font-semibold">Free Plan:</span> 5 uploads/month · TuneVid promo added to description
                            </p>
                        </div>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400"
                        >
                            <Zap className="h-3 w-3" />
                            Upgrade
                        </Link>
                    </div>
                )}
            </div>
            <Uploader />

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                feature="Batch Upload"
                requiredPlan="Pro"
            />
        </div>
    );
}

function Sparkles(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}

