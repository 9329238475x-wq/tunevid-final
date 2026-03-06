"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Crown,
    Zap,
    X,
    ArrowRight,
    Infinity,
    Shield,
    Cpu,
    Upload,
} from "lucide-react";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
    requiredPlan?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature, requiredPlan = "Pro" }: UpgradeModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 transition dark:border-zinc-800 dark:hover:bg-zinc-900"
                            >
                                <X className="h-4 w-4 text-zinc-500" />
                            </button>

                            {/* Content */}
                            <div className="text-center space-y-5">
                                {/* Icon */}
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    <Crown className="h-8 w-8 text-white" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                        Upgrade to Unlock
                                    </h2>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{feature}</span> is available on the{" "}
                                        <span className="font-bold text-blue-500">{requiredPlan}</span> plan and above.
                                    </p>
                                </div>

                                {/* Benefits */}
                                <div className="space-y-2 text-left">
                                    {[
                                        { icon: Infinity, text: "Unlimited YouTube uploads" },
                                        { icon: Upload, text: "Batch Upload (1 image + 20 audios)" },
                                        { icon: Cpu, text: "4K video quality" },
                                        { icon: Shield, text: "No auto-promo in descriptions" },
                                    ].map((item) => (
                                        <div key={item.text} className="flex items-center gap-2.5 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-900">
                                            <item.icon className="h-4 w-4 text-blue-500 shrink-0" strokeWidth={1.5} />
                                            <span className="text-xs text-zinc-700 dark:text-zinc-300">{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href="/pricing"
                                        onClick={onClose}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition btn-depth"
                                    >
                                        <Zap className="h-4 w-4" />
                                        View Plans & Upgrade
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={onClose}
                                        className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 py-2"
                                    >
                                        Maybe later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
