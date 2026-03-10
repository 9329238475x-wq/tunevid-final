import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "Resources | TuneVid",
  description:
    "TuneVid resources for creators: content quality guidelines, vlog best practices, and monetization-safe publishing tips.",
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Resources
        </p>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">Creator Resources</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Practical guidance to publish better videos and keep your content quality advertiser-friendly.
        </p>
      </div>

      <article className="legal-content rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2>1. Vlog Quality Checklist</h2>
        <ul>
          <li>Use clear titles that match the actual video topic.</li>
          <li>Keep intros short and provide value in the first 15 to 30 seconds.</li>
          <li>Improve voice clarity with noise reduction and balanced loudness.</li>
          <li>Use original visuals, clean thumbnails, and non-misleading metadata.</li>
        </ul>

        <h2>2. Content Standards for Monetization</h2>
        <ul>
          <li>Avoid reused, spammy, or auto-generated content with no user value.</li>
          <li>Do not upload copyrighted tracks unless you own or license them.</li>
          <li>Avoid harmful, violent, or adult content in titles, thumbnails, and narration.</li>
          <li>Write useful descriptions with context, timestamps, and clear credits.</li>
        </ul>

        <h2>3. Better Vlog Writing Formula</h2>
        <p>
          Follow this structure: Hook, Problem, Solution, Demo, Summary, and CTA. Keep language simple, practical, and
          audience-focused. A good vlog script solves one clear problem per video.
        </p>

        <h2>4. TuneVid Workflow Suggestion</h2>
        <ul>
          <li>Clean audio using Noise Reducer or Vocal Remover if needed.</li>
          <li>Create polished output with Compressor, Bass Booster, or Trimmer.</li>
          <li>Generate visualizers for music-first uploads.</li>
          <li>Publish with accurate title, description, tags, and rights-safe assets.</li>
        </ul>

        <h2>5. Related Pages</h2>
        <ul>
          <li><Link href="/blog">Creator Blog</Link></li>
          <li><Link href="/about">About Us</Link></li>
          <li><Link href="/editorial-policy">Editorial Policy</Link></li>
          <li><Link href="/privacy-policy">Privacy Policy</Link></li>
          <li><Link href="/terms">Terms of Service</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </article>
    </div>
  );
}

