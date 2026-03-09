export const metadata = {
  title: "About Us | TuneVid",
  description:
    "Learn about TuneVid, our mission, editorial standards, and creator-first approach to safe and useful audio tools.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Company
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          About TuneVid
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Helping creators produce useful, original, and policy-safe media content.
        </p>
      </div>

      <article className="legal-content rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p>
          TuneVid is a creator platform focused on practical audio tools, clean workflows, and clear publishing
          outcomes. We build for musicians, podcasters, editors, and video creators who need fast results without
          heavy desktop software.
        </p>

        <h2>1. What We Do</h2>
        <ul>
          <li>Audio processing tools such as vocal separation, noise reduction, conversion, and mastering support.</li>
          <li>Visualizer and export workflows designed for short-form and long-form publishing.</li>
          <li>Simple web-based tools that run without complex local setup.</li>
        </ul>

        <h2>2. Creator-First Principles</h2>
        <ul>
          <li>Usability first: clear controls, predictable outputs, and transparent processing behavior.</li>
          <li>Privacy aware: we minimize data handling and keep processing scoped to user-requested actions.</li>
          <li>Policy aligned: we encourage original, rights-cleared, and non-deceptive content workflows.</li>
        </ul>

        <h2>3. Content and Publishing Standards</h2>
        <p>
          We promote high-quality creator content. Users should upload only content they own or are authorized to use,
          avoid copyright abuse, and follow platform rules on spam, misinformation, and harmful material.
        </p>

        <h2>4. Advertising and Monetization Transparency</h2>
        <p>
          TuneVid may display ads to support free access. Ads do not influence tool outputs or editorial guidance. We
          do not promise earnings, ranking guarantees, or instant monetization outcomes.
        </p>

        <h2>5. Contact</h2>
        <p>
          Business and support contact: <a href="mailto:9329238475x@gmail.com">9329238475x@gmail.com</a>
        </p>
      </article>
    </div>
  );
}

