"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRazorpay } from "@/hooks/useRazorpay";
import {
    Check,
    Crown,
    Zap,
    Rocket,
    Star,
    ArrowRight,
    Sparkles,
    Shield,
    Infinity,
    Upload,
    Headphones,
    Cpu,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const PLANS = [
    {
        id: "free",
        name: "Free",
        tagline: "For casual creators",
        priceINR: "₹0",
        priceUSD: "$0",
        period: "forever",
        icon: Sparkles,
        color: "emerald",
        gradient: "from-emerald-500 to-teal-500",
        glowClass: "hover:shadow-glow-green",
        features: [
            { text: "5 YouTube uploads/month", included: true },
            { text: "3 uses/tool every 24h", included: true },
            { text: "1080p video quality", included: true },
            { text: "50MB file limit", included: true },
            { text: "No watermark", included: true },
            { text: "13+ audio tools", included: true },
            { text: "Auto-promo in description", included: true, note: "TuneVid branding" },
            { text: "Batch uploads", included: false },
            { text: "4K quality", included: false },
            { text: "API access", included: false },
        ],
        cta: "Current Plan",
        popular: false,
    },
    {
        id: "pro",
        name: "Pro",
        tagline: "For serious creators",
        priceINR: "₹750",
        priceUSD: "$9",
        period: "/month",
        icon: Zap,
        color: "blue",
        gradient: "from-blue-500 to-indigo-600",
        glowClass: "hover:shadow-glow-blue",
        features: [
            { text: "Unlimited YouTube uploads", included: true },
            { text: "50 uses/tool every 24h", included: true },
            { text: "4K video quality", included: true },
            { text: "500MB file limit", included: true },
            { text: "No watermark", included: true },
            { text: "13+ audio tools", included: true },
            { text: "No auto-promo", included: true },
            { text: "Batch Upload (1 image + 20 audios)", included: true },
            { text: "High-priority queue", included: true },
            { text: "API access", included: false },
        ],
        cta: "Upgrade to Pro",
        popular: true,
    },
    {
        id: "max",
        name: "Max / Studio",
        tagline: "For professionals & studios",
        priceINR: "₹4,100",
        priceUSD: "$49",
        period: "/month",
        icon: Crown,
        color: "purple",
        gradient: "from-purple-500 to-pink-600",
        glowClass: "hover:shadow-glow-purple",
        features: [
            { text: "Unlimited everything", included: true },
            { text: "Unlimited tool uses", included: true },
            { text: "4K video quality", included: true },
            { text: "2GB file limit", included: true },
            { text: "No watermark", included: true },
            { text: "13+ audio tools", included: true },
            { text: "No auto-promo", included: true },
            { text: "Batch Upload (1 image + 20 audios)", included: true },
            { text: "Dedicated server speed", included: true },
            { text: "Full API access", included: true },
        ],
        cta: "Go Max",
        popular: false,
    },
];

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PricingPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState<string | null>(null);
    const [showINR, setShowINR] = useState(true);
    const { openCheckout } = useRazorpay();

    const handleUpgrade = async (planType: string) => {
        if (!session) {
            window.location.href = `/login?callbackUrl=/pricing`;
            return;
        }

        if (planType === "free") return;

        setLoading(planType);

        try {
            // Create order via backend
            const res = await fetch(`${API_BASE}/api/payments/create-order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
                },
                body: JSON.stringify({ plan_type: planType }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to create order");
            }

            const order = await res.json();

            // Launch Razorpay checkout using our custom hook
            await openCheckout({
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: "TuneVid.com",
                description: `${planType.toUpperCase()} Plan — Monthly Subscription`,
                order_id: order.order_id,
                prefill: {
                    email: order.user_email,
                    name: order.user_name || "",
                },
                theme: {
                    color: planType === "pro" ? "#3B82F6" : "#8B5CF6",
                    backdrop_color: "#121212",
                },
                handler: async (response: any) => {
                    // Verify payment signature on backend
                    try {
                        const verifyRes = await fetch(`${API_BASE}/api/payments/verify-payment`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        if (verifyRes.ok) {
                            // Clear cache/session if needed and redirect
                            window.location.href = "/dashboard?upgraded=true";
                        } else {
                            const err = await verifyRes.json().catch(() => ({}));
                            alert(err.detail || "Payment verification failed. Please contact support.");
                        }
                    } catch (e) {
                        console.error("Verification error:", e);
                        alert("Payment verification error. Please check your dashboard in a few minutes.");
                    }
                },
                modal: {
                    ondismiss: () => setLoading(null),
                },
            });
        } catch (err: any) {
            console.error("Payment flow error:", err);
            alert(err.message || "Payment failed. Please try again.");
            setLoading(null);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-4 mb-12"
            >
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                    <Crown className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />
                    Simple, transparent pricing
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Choose Your{" "}
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Creator Plan
                    </span>
                </h1>

                <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
                    Start free, upgrade when you grow. No hidden fees, cancel anytime.
                </p>

                {/* Currency Toggle */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => setShowINR(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${showINR
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                            }`}
                    >
                        ₹ INR
                    </button>
                    <button
                        onClick={() => setShowINR(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!showINR
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                            }`}
                    >
                        $ USD
                    </button>
                </div>
            </motion.div>

            {/* Pricing Grid */}
            <div className="grid gap-6 md:grid-cols-3 items-stretch">
                {PLANS.map((plan, idx) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className={`relative rounded-2xl border p-6 sm:p-8 flex flex-col transition-all duration-300 card-elevated
              ${plan.popular
                                ? "border-blue-500/30 dark:border-blue-500/20 scale-[1.02] shadow-lg shadow-blue-500/10"
                                : "border-zinc-200 dark:border-zinc-800"
                            }
              bg-white dark:bg-zinc-950 ${plan.glowClass}
            `}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-500/25">
                                    <Star className="h-3 w-3" fill="currentColor" />
                                    MOST POPULAR
                                </span>
                            </div>
                        )}

                        {/* Plan Header */}
                        <div className="space-y-3 mb-6">
                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient}`}>
                                <plan.icon className="h-5 w-5 text-white" strokeWidth={2} />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{plan.name}</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{plan.tagline}</p>
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                                    {showINR ? plan.priceINR : plan.priceUSD}
                                </span>
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">{plan.period}</span>
                            </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 flex-1 mb-6">
                            {plan.features.map((feature, fi) => (
                                <li key={fi} className="flex items-start gap-2.5">
                                    {feature.included ? (
                                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                                    ) : (
                                        <div className="h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-700 mt-0.5 shrink-0" />
                                    )}
                                    <span
                                        className={`text-sm ${feature.included
                                            ? "text-zinc-700 dark:text-zinc-300"
                                            : "text-zinc-400 dark:text-zinc-600 line-through"
                                            }`}
                                    >
                                        {feature.text}
                                        {feature.note && (
                                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                {feature.note}
                                            </span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <button
                            onClick={() => handleUpgrade(plan.id)}
                            disabled={loading === plan.id || plan.id === "free"}
                            className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 btn-depth flex items-center justify-center gap-2
                ${plan.id === "free"
                                    ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500 cursor-default"
                                    : plan.popular
                                        ? `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 shadow-lg`
                                        : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                                }
                ${loading === plan.id ? "opacity-70" : ""}
              `}
                        >
                            {loading === plan.id ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {plan.cta}
                                    {plan.id !== "free" && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
                                </>
                            )}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Feature Comparison */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-20 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
            >
                <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">
                    Why Upgrade?
                </h2>
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-8">
                    Unlock the full power of TuneVid
                </p>

                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                    {[
                        {
                            icon: Upload,
                            title: "Unlimited Uploads",
                            desc: "No monthly caps — publish as often as your audience demands.",
                            color: "text-blue-400",
                        },
                        {
                            icon: Headphones,
                            title: "50 Uses / Tool / Day",
                            desc: "Process massive batches without hitting cooldowns.",
                            color: "text-purple-400",
                        },
                        {
                            icon: Rocket,
                            title: "High-Priority Queue",
                            desc: "Your jobs jump to the front of the line for faster processing.",
                            color: "text-amber-400",
                        },
                        {
                            icon: Infinity,
                            title: "Batch Upload",
                            desc: "1 image + up to 20 audio files in a single click.",
                            color: "text-emerald-400",
                        },
                        {
                            icon: Cpu,
                            title: "4K Quality",
                            desc: "Render studio-grade videos at the highest resolution.",
                            color: "text-pink-400",
                        },
                        {
                            icon: Shield,
                            title: "No Branding",
                            desc: "Clean descriptions without TuneVid auto-promotion.",
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
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-12 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 card-elevated"
            >
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                    Pricing FAQ
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {[
                        { q: "Can I cancel anytime?", a: "Yes. Plans are month-to-month with no commitment. You keep your plan until the period ends." },
                        { q: "What payment methods are supported?", a: "We accept UPI, credit/debit cards, net banking, and wallets via Razorpay. International cards accepted with USD pricing." },
                        { q: "What happens when my plan expires?", a: "Your account downgrades to the Free plan. No data is lost — you can re-upgrade anytime." },
                        { q: "Is there a referral program?", a: "Yes! Refer a friend who uploads or subscribes, and you get 1 month of Pro for free." },
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

