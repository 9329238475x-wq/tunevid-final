"use client";

import type { ToolResourceContent } from "@/lib/tool-resource-content";

export default function ToolResourceSection({
  toolName,
  whatIs,
  howTo,
  whyImportant,
}: ToolResourceContent) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">Creator Resource</p>
        <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{toolName} Resource Guide</h2>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">What is {toolName}?</h3>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {whatIs.map((paragraph, index) => (
            <p key={`what-${index}`}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">How to Use Our {toolName}?</h3>
        <ol className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 list-decimal list-inside">
          {howTo.map((step, index) => (
            <li key={`step-${index}`}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Why is {toolName} Important for Creators?
        </h3>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {whyImportant.map((paragraph, index) => (
            <p key={`why-${index}`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
