export const metadata = {
  title: "Editorial Policy | TuneVid",
  description:
    "TuneVid editorial policy: how we create creator guides, review AI tool content, and keep publishing standards transparent.",
};

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Policies
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Editorial Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          How we publish creator guides, tool documentation, and monetization-safe advice.
        </p>
      </div>

      <article className="legal-content rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p>
          TuneVid publishes educational content to help creators use AI audio tools responsibly and produce higher-quality
          work. This policy explains how we write, review, and update our articles so readers can trust the guidance we
          provide.
        </p>

        <h2>1. Our Editorial Mission</h2>
        <p>
          We focus on practical, creator-first guidance. Our articles explain how to use tools, how to improve audio
          quality, and how to publish content that is safe for advertisers and audiences. We do not publish content that
          promotes spam, misleading tactics, or policy violations.
        </p>

        <h2>2. Accuracy and Review Process</h2>
        <p>
          Content is written with an emphasis on accuracy and real-world workflows. We validate claims against tool
          behavior and platform best practices. If a tool changes or a workflow is updated, we revise the relevant
          articles to reflect the current guidance.
        </p>

        <h2>3. Transparency and Monetization</h2>
        <p>
          TuneVid may display ads to support free access. Ads do not influence our editorial decisions, rankings, or tool
          recommendations. We do not sell editorial placements or guarantee monetization outcomes.
        </p>

        <h2>4. AI Content and Human Oversight</h2>
        <p>
          We use AI-assisted workflows to speed up drafting, but all published content is reviewed by humans for clarity,
          originality, and compliance with platform policies. We avoid low-value or repetitive content and prioritize
          clear, actionable guidance.
        </p>

        <h2>5. Copyright and Rights Guidance</h2>
        <p>
          We encourage creators to use content they own or are authorized to use. Our guides emphasize copyright-safe
          publishing and warn against reusing protected material without permission.
        </p>

        <h2>6. Corrections and Feedback</h2>
        <p>
          If you spot an error or have a suggestion, contact us. We review feedback and update content when needed to
          keep our guidance accurate and useful.
        </p>
      </article>
    </div>
  );
}
