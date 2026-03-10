import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata = {
  title: "TuneVid Blog | Creator Guides and Audio Tips",
  description:
    "Deep guides, workflows, and creator tips for AI audio tools, visualizers, and YouTube publishing.",
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14 space-y-10 text-zinc-900 dark:text-zinc-100">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">Blog</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Creator Guides, Audio Workflows, and Growth Ideas</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Practical, creator-first content focused on AI audio tools, clean production workflows, and YouTube-ready
          publishing. Every article is written to help you ship better content faster.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="rounded-full border border-zinc-200 px-3 py-1 dark:border-zinc-800">AI audio tools</span>
          <span className="rounded-full border border-zinc-200 px-3 py-1 dark:border-zinc-800">Vocal remover online</span>
          <span className="rounded-full border border-zinc-200 px-3 py-1 dark:border-zinc-800">Audio visualizers</span>
          <span className="rounded-full border border-zinc-200 px-3 py-1 dark:border-zinc-800">YouTube growth</span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <BlogCard key={post.slug} {...post} />
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Need a specific guide?</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Tell us what you want to learn next. We prioritize guides that help creators build safer, higher-quality content.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Suggest a topic
          </Link>
        </div>
      </section>
    </div>
  );
}

