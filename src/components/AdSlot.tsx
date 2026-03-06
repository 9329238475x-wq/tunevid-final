"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
    slot: string;
    format?: "auto" | "rectangle" | "horizontal" | "vertical";
    className?: string;
    responsive?: boolean;
}

/**
 * Google AdSense ad slot component.
 * Replace `data-ad-client` with your actual AdSense publisher ID.
 * Replace `data-ad-slot` with your actual ad unit slot ID.
 * 
 * To activate: Add the AdSense script to layout.tsx head:
 * <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous" />
 */
export default function AdSlot({ slot, format = "auto", className = "", responsive = true }: AdSlotProps) {
    const adRef = useRef<HTMLDivElement>(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (pushed.current) return;
        try {
            if (typeof window !== "undefined" && (window as any).adsbygoogle) {
                (window as any).adsbygoogle.push({});
                pushed.current = true;
            }
        } catch {
            // AdSense not loaded yet — that's fine
        }
    }, []);

    return (
        <div className={`ad-container overflow-hidden ${className}`} ref={adRef}>
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    );
}

/**
 * Placeholder ad slot for development — shows where ads will appear.
 * Replace with <AdSlot /> in production after AdSense approval.
 */
export function AdPlaceholder({
    position = "inline",
    className = ""
}: {
    position?: "header" | "inline" | "sidebar" | "footer";
    className?: string;
}) {
    const heights: Record<string, string> = {
        header: "h-[90px]",
        inline: "h-[250px]",
        sidebar: "h-[600px]",
        footer: "h-[90px]",
    };

    return (
        <div
            className={`w-full ${heights[position]} rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/30 ${className}`}
            aria-hidden="true"
        >
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium tracking-wider uppercase">
                Ad Space
            </p>
        </div>
    );
}
