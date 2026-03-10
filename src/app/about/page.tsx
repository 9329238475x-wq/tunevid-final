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
          TuneVid exists to help creators ship better audio and video content without heavy software or complicated
          workflows. We build simple, reliable tools for musicians, podcasters, editors, and YouTube creators who need
          professional results on a tight timeline.
        </p>

        <h2>1. Our Mission</h2>
        <p>
          We believe creative work should be accessible. That means fast tools, clear interfaces, and guidance that helps
          you publish content safely and confidently. We focus on the real needs of creators: clean audio, consistent
          output quality, and workflows that reduce busywork.
        </p>

        <h2>2. What Creators Can Expect</h2>
        <ul>
          <li>Practical audio utilities like vocal removal, noise cleanup, trimming, compression, and format conversion.</li>
          <li>Visualizer-ready exports that make music uploads look polished on YouTube.</li>
          <li>Web-based tools that work without installing heavy desktop software.</li>
        </ul>

        <h2>3. Editorial and Content Standards</h2>
        <p>
          Our blog and help content are written to be accurate, actionable, and honest about tradeoffs. We do not promise
          instant success or guaranteed monetization. We encourage creators to use content they own or are authorized to
          use, and to follow platform rules around copyright, spam, and misleading material.
        </p>

        <h2>4. Privacy and Trust</h2>
        <p>
          We minimize data handling and keep processing scoped to the actions you request. Our goal is to make tooling
          that feels safe to use and transparent in how it works.
        </p>

        <h2>5. Advertising and Monetization Transparency</h2>
        <p>
          TuneVid may show ads to keep the platform free. Ads do not affect tool outputs, rankings, or editorial guidance.
          We focus on sustainable value, not shortcuts.
        </p>

        <h2>6. Contact</h2>
        <p>
          Business and support contact: <a href="mailto:9329238475x@gmail.com">9329238475x@gmail.com</a>
        </p>
      </article>
    </div>
  );
}

