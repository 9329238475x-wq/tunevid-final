"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Uploader from "../../components/Uploader";
import { Sparkles } from "lucide-react";

export default function CreatePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

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
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <Sparkles className="h-3.5 w-3.5" />
                            100% Free — No Limits
                        </div>
                        <Link
                            href="/tools"
                            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            Back to Tools
                        </Link>
                    </div>
                </div>
            </div>
            <Uploader />
        </div>
    );
}
