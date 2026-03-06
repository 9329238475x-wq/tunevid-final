"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Lock, LogIn } from "lucide-react";
import Link from "next/link";

interface AuthGuardProps {
    children: React.ReactNode;
    toolName?: string;
}

export default function AuthGuard({ children, toolName }: AuthGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                    <Lock className="h-8 w-8 text-zinc-400" />
                </div>
                <div className="text-center space-y-2 max-w-md">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Login Required
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {toolName
                            ? `Sign in with Google to use the ${toolName} tool. It's free!`
                            : "Sign in with Google to access this tool. It's free!"}
                    </p>
                </div>
                <Link
                    href={`/login?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/tools")}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all"
                >
                    <LogIn className="h-4 w-4" />
                    Sign in to Continue
                </Link>
                <Link
                    href="/tools"
                    className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                    ← Back to Tools
                </Link>
            </div>
        );
    }

    return <>{children}</>;
}
