"use client";

import Link from "next/link";

type BlogCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  publishedAt: string;
  readTime: string;
};

export default function BlogCard({
  slug,
  title,
  excerpt,
  coverImage,
  category,
  publishedAt,
  readTime,
}: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-zinc-900/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          {publishedAt} - {readTime}
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">{excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:text-emerald-500 dark:text-emerald-400">
          Read article
          <span className="transition group-hover:translate-x-0.5">-&gt;</span>
        </span>
      </div>
    </Link>
  );
}
