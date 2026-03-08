export const metadata = {
  title: "About TuneVid | AI Tools for Independent Creators",
  description:
    "Learn about TuneVid's mission to help independent creators produce better audio and video with practical AI tools.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14 text-zinc-900 dark:text-zinc-100">
      <section className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 md:p-10">
        <div className="max-w-3xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            About TuneVid
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">Helping Independent Creators Ship Faster</h1>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            TuneVid exists to reduce the technical friction between creative ideas and published content. We build
            practical AI-powered audio and video tools for musicians, remix artists, podcasters, and YouTube creators
            who need speed, reliability, and clean output without enterprise complexity.
          </p>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            Our mission is simple: make professional production workflows accessible to solo creators and small teams.
            From vocal separation and audio cleanup to visualizer generation and publishing support, TuneVid is designed
            as a focused toolkit for real creator pipelines.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white/70 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-base font-semibold">Creator First</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            We prioritize clear UX, fast results, and export quality that creators can trust in production.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white/70 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-base font-semibold">Practical AI</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            We use AI where it delivers real workflow value, not where it adds noise or uncertainty.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white/70 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-base font-semibold">Trust and Clarity</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            We aim for transparent platform policies, straightforward usage rules, and reliable communication.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 md:p-8">
        <h2 className="text-xl font-semibold">Who TuneVid Is For</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          <li>Independent musicians creating release visuals and instrumentals for YouTube.</li>
          <li>DJs and remix creators extracting stems for edits, mashups, and live sets.</li>
          <li>Podcast and voice creators cleaning audio for clearer listening experiences.</li>
          <li>Content teams producing short-form clips with consistent audio quality.</li>
        </ul>
      </section>
    </div>
  );
}
