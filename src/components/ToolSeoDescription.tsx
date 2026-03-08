type ToolSeoDescriptionProps = {
  title: string;
  description: string;
  articleTitle: string;
  articleParagraphs: string[];
};

export default function ToolSeoDescription({
  title,
  description,
  articleTitle,
  articleParagraphs,
}: ToolSeoDescriptionProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 md:p-8">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            In-Depth Guide
          </p>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 md:text-3xl">{title}</h2>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">{description}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">{articleTitle}</h3>
          <div className="mt-4 space-y-4">
            {articleParagraphs.map((paragraph, index) => (
              <p key={index} className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
