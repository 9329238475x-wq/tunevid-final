export const metadata = {
  title: "Contact TuneVid | Support and Feedback",
  description:
    "Contact TuneVid for support, feedback, and creator partnership questions.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14 text-zinc-900 dark:text-zinc-100">
      <section className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 md:p-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Get in touch
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">We are here to help creators</h1>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            Reach out for support requests, product feedback, or partnership questions. We read every message and use
            feedback to improve TuneVid.
          </p>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            Email us at{" "}
            <a
              className="font-semibold text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
              href="mailto:9329238475x@gmail.com"
            >
              9329238475x@gmail.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
