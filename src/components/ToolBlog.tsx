"use client";

import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type HowToStep = {
    step: number;
    title: string;
    description: string;
};

type ToolBlogProps = {
    toolName: string;
    tagline: string;
    description: string;
    howToSteps: HowToStep[];
    proTips?: string[];
    faq?: { q: string; a: string }[];
    accentColor?: string;
};

export default function ToolBlog({
    toolName,
    tagline,
    description,
    howToSteps,
    proTips,
    faq,
    accentColor = "emerald",
}: ToolBlogProps) {
    const [showFaq, setShowFaq] = useState<number | null>(null);

    const accentMap: Record<string, string> = {
        emerald: "border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20",
        purple: "border-purple-500/20 bg-purple-50 dark:bg-purple-950/20",
        pink: "border-pink-500/20 bg-pink-50 dark:bg-pink-950/20",
        red: "border-red-500/20 bg-red-50 dark:bg-red-950/20",
        cyan: "border-cyan-500/20 bg-cyan-50 dark:bg-cyan-950/20",
        teal: "border-teal-500/20 bg-teal-50 dark:bg-teal-950/20",
        green: "border-green-500/20 bg-green-50 dark:bg-green-950/20",
        indigo: "border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/20",
        orange: "border-orange-500/20 bg-orange-50 dark:bg-orange-950/20",
        blue: "border-blue-500/20 bg-blue-50 dark:bg-blue-950/20",
    };

    const stepNumberMap: Record<string, string> = {
        emerald: "bg-emerald-600 text-white",
        purple: "bg-purple-600 text-white",
        pink: "bg-pink-600 text-white",
        red: "bg-red-600 text-white",
        cyan: "bg-cyan-600 text-white",
        teal: "bg-teal-600 text-white",
        green: "bg-green-600 text-white",
        indigo: "bg-indigo-600 text-white",
        orange: "bg-orange-600 text-white",
        blue: "bg-blue-600 text-white",
    };

    return (
        <section className="mt-12 space-y-8">
            {/* Blog Header */}
            <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    How to Use {toolName}
                </h2>
            </div>

            {/* Tagline + Description */}
            <div className={`rounded-xl border p-5 ${accentMap[accentColor] || accentMap.emerald}`}>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{tagline}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Step-by-Step Guide
                </h3>
                <div className="space-y-3">
                    {howToSteps.map((step) => (
                        <div
                            key={step.step}
                            className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${stepNumberMap[accentColor] || stepNumberMap.emerald}`}
                            >
                                {step.step}
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {step.title}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pro Tips */}
            {proTips && proTips.length > 0 && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                        💡 Pro Tips
                    </h3>
                    <ul className="space-y-2">
                        {proTips.map((tip, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                            >
                                <span className="mt-0.5 text-emerald-500">•</span>
                                <span className="leading-relaxed">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* FAQ */}
            {faq && faq.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                        Frequently Asked Questions
                    </h3>
                    {faq.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => setShowFaq(showFaq === i ? null : i)}
                            className="w-full text-left rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 transition hover:border-zinc-300 dark:hover:border-zinc-700"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pr-4">
                                    {item.q}
                                </p>
                                {showFaq === i ? (
                                    <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                                )}
                            </div>
                            {showFaq === i && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                                    {item.a}
                                </p>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
