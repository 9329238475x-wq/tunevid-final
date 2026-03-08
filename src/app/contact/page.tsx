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
            Contact Us
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">We Would Love to Hear From You</h1>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            Reach out for support requests, product feedback, or creator partnership inquiries. We review every
            message and use feedback to improve TuneVid for independent creators.
          </p>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            Direct email:{" "}
            <a
              className="font-semibold text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
              href="mailto:9329238475x@gmail.com"
            >
              9329238475x@gmail.com
            </a>
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 md:p-8">
        <h2 className="text-lg font-semibold">Send a Message</h2>
        <form className="mt-5 space-y-4" action="#" method="post">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="subject" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="How can we help?"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="message" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              placeholder="Write your message"
              className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}
