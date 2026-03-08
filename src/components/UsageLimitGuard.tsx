"use client";

/**
 * UsageLimitGuard — Completely free, no limits enforced.
 * Simply renders children without any usage checks.
 */

interface UsageLimitGuardProps {
  toolName: string;
  children: React.ReactNode;
  onUsageChecked?: (canUse: boolean) => void;
}

export default function UsageLimitGuard({ toolName, children, onUsageChecked }: UsageLimitGuardProps) {
  // Always allow — completely free, no limits
  if (onUsageChecked) {
    onUsageChecked(true);
  }
  return <>{children}</>;
}
