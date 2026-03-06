"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Clock, Crown, AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface UsageInfo {
  tool_name: string;
  used: number;
  max: number;
  remaining: number;
  reset_at: string | null;
}

interface UsageLimitGuardProps {
  toolName: string;
  children: React.ReactNode;
  onUsageChecked?: (canUse: boolean) => void;
}

function CountdownTimer({ resetAt }: { resetAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const reset = new Date(resetAt).getTime();
      const diff = reset - now;

      if (diff <= 0) {
        setTimeLeft("Ready now!");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [resetAt]);

  return (
    <div className="flex items-center gap-2 text-lg font-mono font-bold text-orange-500 dark:text-orange-400">
      <Clock className="h-5 w-5" />
      <span>{timeLeft}</span>
    </div>
  );
}

export default function UsageLimitGuard({ toolName, children, onUsageChecked }: UsageLimitGuardProps) {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [limitReached, setLimitReached] = useState(false);

  const checkUsage = useCallback(async () => {
    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/tool-usage/${toolName}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsage(data);
        const isLimited = data.remaining === 0 && data.max !== -1;
        setLimitReached(isLimited);
        onUsageChecked?.(!isLimited);
      } else if (res.status === 429) {
        const data = await res.json();
        setUsage({
          tool_name: toolName,
          used: data.detail?.used || 0,
          max: data.detail?.max || 3,
          remaining: 0,
          reset_at: data.detail?.reset_at || null,
        });
        setLimitReached(true);
        onUsageChecked?.(false);
      } else {
        // If endpoint doesn't exist yet, allow usage
        onUsageChecked?.(true);
      }
    } catch {
      // Network error — allow usage (backend will enforce)
      onUsageChecked?.(true);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, toolName, onUsageChecked]);

  useEffect(() => {
    checkUsage();
  }, [checkUsage]);

  if (loading) return <>{children}</>;

  if (limitReached && usage) {
    return (
      <div className="space-y-6">
        {/* Usage limit banner */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900/50 dark:bg-orange-950/20">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30">
              <AlertTriangle className="h-7 w-7 text-orange-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Daily Limit Reached
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
                You've used <span className="font-semibold">{usage.used}/{usage.max}</span> free uses today.
                {usage.reset_at && " Your limit will reset in:"}
              </p>
              {usage.reset_at && <CountdownTimer resetAt={usage.reset_at} />}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Crown className="h-4 w-4" />
                Upgrade for Unlimited
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Try Other Tools
              </Link>
            </div>
          </div>
        </div>
        {/* Still show the tool UI but disabled */}
        <div className="opacity-40 pointer-events-none select-none">
          {children}
        </div>
      </div>
    );
  }

  // Show usage indicator if we have data
  if (usage && usage.max !== -1 && usage.remaining > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
            <span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{usage.remaining}</span> of {usage.max} free uses remaining today
            </span>
          </div>
          <Link
            href="/pricing"
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Get Unlimited →
          </Link>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

