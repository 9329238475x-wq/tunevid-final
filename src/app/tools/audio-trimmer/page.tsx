"use client";

import { ArrowLeft, Scissors } from "lucide-react";
import SafeLink from "@/components/SafeLink";
import ToolSeoDescription from "@/components/ToolSeoDescription";
import ToolResourceSection from "@/components/ToolResourceSection";
import { TOOL_RESOURCE_CONTENT } from "@/lib/tool-resource-content";
export default function AudioTrimmerPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 text-zinc-900 dark:text-zinc-100">
      <section className="rounded-2xl border border-zinc-200 bg-white/80 p-8 text-center shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
          <Scissors className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tools</p>
        <h1 className="mt-2 text-2xl font-semibold">Audio Cutter & Trimmer</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          This tool is temporarily unavailable and will be back soon.
        </p>

        <SafeLink
          href="/tools"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Tools
        </SafeLink>
      </section>
      <ToolSeoDescription
        title="Audio Trimming Workflow"
        description="Precise trimming is essential for intros, reels, shorts, podcasts, and clean music excerpts."
        articleTitle="Why Accurate Audio Trimming Matters"
        articleParagraphs={[
          "Audio trimming removes unwanted sections and helps creators focus attention on key moments. A clean start and clean end can significantly improve listener retention.",
          "Professional trimming requires frame-accurate cuts, gentle fades at boundaries, and timing that matches the target platform's content format.",
          "Even when a tool is temporarily unavailable, planning your trim points in advance improves editing speed and keeps your production pipeline efficient."
        ]}
      />
      <ToolResourceSection {...TOOL_RESOURCE_CONTENT["audio-trimmer"]} />
    </div>
  );
}