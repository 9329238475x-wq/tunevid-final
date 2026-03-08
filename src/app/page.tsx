"use client";

import Landing from "../components/Landing";

export default function Home() {
  return (
    <Landing
      seoContent={
        <div id="seo-content" className="max-w-4xl mx-auto px-6 py-12 prose dark:prose-invert">
          <h2>Why TuneVid is the Best for Creators</h2>
          <p>
            The modern creator economy moves fast, and publishing quality content consistently requires more than talent alone.
            Creators need reliable workflows, speed, and output quality they can trust. TuneVid is built for that exact purpose.
            It is a creator-first platform where <strong>AI audio tools</strong>, <strong>Video Visualizer</strong> workflows,
            and practical <strong>YouTube automation</strong> support come together in one place, so users can move from raw idea
            to published content without unnecessary friction.
          </p>
          <p>
            A major strength of TuneVid is practical utility. Many products look impressive but fail in daily production use.
            TuneVid focuses on what creators actually do every day: clean audio, trim content, isolate stems, convert formats,
            and prepare media for publishing. Tools like Vocal Remover, Noise Reducer, Silence Remover, and Audio Converter help
            music creators, podcasters, and short-form editors reduce repetitive manual work and ship polished output faster.
          </p>
          <p>
            Visual publishing is another key advantage. Audio processing alone is often not enough for YouTube growth. TuneVid
            helps creators pair audio with visual output through a streamlined <strong>Video Visualizer</strong> pipeline. This
            improves presentation quality, makes uploads more engaging, and supports stronger channel branding over time. Creators
            can manage artwork, metadata, and production flow with less complexity.
          </p>
          <p>
            The platform also supports a production mindset around <strong>YouTube automation</strong>. Instead of repeating the
            same manual steps for every release, creators can rely on a workflow that is built for publishing consistency. This is
            especially valuable for independent creators and small teams that need to maintain quality while posting on schedule.
          </p>
          <p>
            If you want a balanced platform that combines speed, quality, and usability, TuneVid delivers exactly that. With
            professional <strong>AI audio tools</strong>, creator-focused workflow design, and visual publishing support, TuneVid
            acts as more than a utility. It becomes a practical production partner for creators building long-term content brands.
          </p>
        </div>
      }
    />
  );
}
