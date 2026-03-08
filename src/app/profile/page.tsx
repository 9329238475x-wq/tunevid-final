"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Copy,
    Check,
    Key,
    RefreshCw,
    Shield,
    User,
    Mail,
    Crown,
    LogOut,
    ChevronRight,
    Loader2,
    Eye,
    EyeOff,
    Zap,
    Calendar,
    Settings,
    Bell,
    HelpCircle,
} from "lucide-react";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [signOutConfirm, setSignOutConfirm] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login?callbackUrl=/profile");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!session) return null;

    const user = session.user;
    const planType = (session as any).planType || "free";

    const planBadge: Record<string, { label: string; color: string; icon: typeof Crown }> = {
        free: { label: "Free Plan", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300", icon: User },
        pro: { label: "Pro Plan", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: Zap },
        max: { label: "Max / Studio", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Crown },
    };

    const plan = planBadge[planType] || planBadge.free;
    const PlanIcon = plan.icon;

    const handleGenerateApiKey = async () => {
        setGenerating(true);
        // Simulate API key generation (replace with real backend call)
        await new Promise((r) => setTimeout(r, 1500));
        const key = `tvid_${Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`;
        setApiKey(key);
        setShowApiKey(true);
        setGenerating(false);
    };

    const handleCopyApiKey = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: "/" });
    };

    const maskApiKey = (key: string) => {
        return key.slice(0, 8) + "••••••••••••••••••••" + key.slice(-4);
    };

    return (
        <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">
            {/* Header */}
            <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Account Settings</p>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">My Profile</h1>
            </div>

            {/* Profile Card */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-start gap-5">
                    <img
                        src={user?.image ?? "/icon.png"}
                        alt={user?.name ?? "User"}
                        className="h-20 w-20 rounded-2xl border-2 border-zinc-200 object-cover shadow-sm dark:border-zinc-700"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {user?.name ?? "User"}
                            </h2>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${plan.color}`}>
                                <PlanIcon className="h-3 w-3" />
                                {plan.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{user?.email ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                            <Calendar className="h-3 w-3" />
                            <span>Member since {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                        </div>
                    </div>
                </div>


            </section>

            {/* API Key Section */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                        <Key className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">API Access</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Generate an API key to access TuneVid tools programmatically.
                        </p>
                    </div>
                </div>

                {apiKey ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                            <code className="flex-1 text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate">
                                {showApiKey ? apiKey : maskApiKey(apiKey)}
                            </code>
                            <button
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                                title={showApiKey ? "Hide key" : "Show key"}
                            >
                                {showApiKey ? (
                                    <EyeOff className="h-4 w-4 text-zinc-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-zinc-500" />
                                )}
                            </button>
                            <button
                                onClick={handleCopyApiKey}
                                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                                title="Copy to clipboard"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <Copy className="h-4 w-4 text-zinc-500" />
                                )}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleGenerateApiKey}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Regenerate Key
                            </button>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                Warning: This will invalidate your current key.
                            </p>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleGenerateApiKey}
                        disabled={generating}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Key className="h-4 w-4" />
                                Generate API Key
                            </>
                        )}
                    </button>
                )}
            </section>

            {/* Quick Links */}
            <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick Links</h3>
                </div>
                {[
                    { icon: Settings, label: "Dashboard", desc: "View your activity and usage stats", href: "/dashboard" },
                    { icon: Shield, label: "Privacy Policy", desc: "How we handle your data", href: "/privacy-policy" },
                    { icon: HelpCircle, label: "Terms of Service", desc: "Our terms and conditions", href: "/terms" },
                ].map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-4 px-6 py-4 border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50 transition dark:border-zinc-800/50 dark:hover:bg-zinc-900/50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                            <item.icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                    </a>
                ))}
            </section>

            {/* Sign Out Section */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
                            <LogOut className="h-5 w-5 text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sign Out</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Sign out of your TuneVid account on this device.
                            </p>
                        </div>
                    </div>
                    {signOutConfirm ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSignOut}
                                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
                            >
                                Yes, Sign Out
                            </button>
                            <button
                                onClick={() => setSignOutConfirm(false)}
                                className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setSignOutConfirm(true)}
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-800/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            </section>

            {/* Footer text */}
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 pb-4">
                TuneVid v4.0.0 · © {new Date().getFullYear()} All rights reserved.
            </p>
        </div>
    );
}
