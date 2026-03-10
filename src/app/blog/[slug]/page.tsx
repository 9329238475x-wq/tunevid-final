import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blog";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Article Not Found | TuneVid Blog",
    };
  }

  return {
    title: `${post.title} | TuneVid Blog`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((item) => item.slug !== post.slug).slice(0, 2);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14 text-zinc-900 dark:text-zinc-100 space-y-10">
      <section className="space-y-4">
        <Link href="/blog" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
          Blog
        </Link>
        <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">{post.excerpt}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{post.publishedAt}</span>
          <span>-</span>
          <span>{post.readTime}</span>
          <span className="rounded-full border border-zinc-200 px-3 py-1 text-[10px] uppercase tracking-widest dark:border-zinc-800">
            {post.category}
          </span>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <img src={post.coverImage} alt={post.title} className="w-full object-cover" />
      </div>

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        {post.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${section.heading}-${index}`}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>

      <section className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Ready to try the tools?</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Explore TuneVid tools and ship your next audio project in minutes.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Explore tools
          </Link>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">More from the blog</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedPosts.map((item) => (
              <BlogCard key={item.slug} {...item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
