"use client";

import Landing from "../components/Landing";

export default function Home() {
  return (
    <div className="pb-20">
      <Landing />

      <section className="mx-auto mt-10 max-w-6xl px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 md:p-10">
          <div className="max-w-4xl space-y-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                TuneVid Knowledge Hub
              </p>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 md:text-3xl">
                What is TuneVid?
              </h2>
              <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                TuneVid is an AI-powered creator workspace for musicians, editors, DJs, and YouTube-first artists
                who want faster production without sacrificing quality. Instead of jumping between many disconnected
                apps, you can clean audio, transform vocals, adjust tempo, isolate stems, and prepare publish-ready
                output from one modern dashboard. Our tools are designed for real creator workflows: fast previews,
                practical export settings, and simple controls that help you move from idea to upload quickly.
              </p>
              <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                Beyond one-click processing, TuneVid focuses on repeatable results for independent creators. That
                means stable conversion pipelines, transparent file handling, and purpose-built utilities like vocal
                remover, silence remover, audio trimmer, and YouTube uploader. Whether you are producing karaoke
                tracks, remix stems, podcast clips, or social media snippets, TuneVid helps you create professional
                audio and video assets with less technical friction and more creative control.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 md:text-2xl">
                How to Create Music Visualizers for YouTube
              </h3>
              <div className="space-y-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                <p>
                  Step 1: Start with the right source files. Export your final master audio in a high-quality format
                  such as WAV or a high-bitrate MP3, then prepare clean artwork at square or landscape resolution.
                  The most common mistake creators make is building a visualizer from unfinished audio. If your mix is
                  still changing, visuals will need to be rebuilt each time. Lock your final version first so your
                  upload process stays fast and predictable.
                </p>
                <p>
                  Step 2: Upload your audio and cover image in TuneVid Create. The uploader is built to handle mobile
                  and desktop workflows, so you can start a project from anywhere. Keep your title and metadata ready:
                  video title, description, tags, category, and visibility. Strong metadata improves discoverability
                  and helps YouTube understand the audience for your content.
                </p>
                <p>
                  Step 3: Optimize your track before rendering video. If the song has long pauses, remove silence to
                  improve retention. If vocals are too dominant for a lyric-free channel, use vocal remover to generate
                  an instrumental version. If the loudness is inconsistent, run compression and normalization before
                  publishing. Small improvements here can increase watch time because listeners hear a more consistent,
                  polished output from the first second.
                </p>
                <p>
                  Step 4: Design with brand consistency in mind. Pick one visual style and reuse it across releases so
                  your channel becomes recognizable. Use readable titles in descriptions, include artist credits, and
                  avoid crowded thumbnails. Many channels underperform because the visualizer video and channel brand
                  look disconnected. Consistency builds trust and improves click-through rate over time.
                </p>
                <p>
                  Step 5: Publish strategically. When uploading to YouTube, choose the right privacy setting and make
                  sure your description includes useful context: genre, mood, credits, and links. Add timestamped
                  sections for longer mixes, place related tracks in playlists, and pin a comment with your streaming
                  links. After publishing, watch analytics for retention drop-off points. If viewers leave early, trim
                  intros and tighten structure in your next upload. Sustainable channel growth comes from this cycle:
                  publish, measure, refine, and repeat.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 md:text-2xl">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <details className="group rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Is TuneVid free to use?
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                    TuneVid provides free core tools so creators can test, produce, and publish without a high upfront
                    cost. Usage policies can evolve as infrastructure grows, but the product direction remains focused on
                    accessibility for independent artists and small creator teams. Always check current limits on the
                    tool page before starting large batches.
                  </p>
                </details>

                <details className="group rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    How does Vocal Remover work?
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                    Vocal removal is powered by deep-learning source separation models. These models analyze frequency,
                    timing, and stereo patterns to estimate which parts belong to vocals versus instruments. The result
                    is usually delivered as stems, such as vocals, drums, bass, and other instruments. Output quality
                    depends on mix complexity, effects, and source compression.
                  </p>
                </details>

                <details className="group rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Can I upload directly to YouTube from TuneVid?
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                    Yes. TuneVid supports YouTube publishing with metadata controls including title, description, tags,
                    privacy status, and audience selection. This reduces manual upload work and keeps your publishing
                    workflow in one place. You should still review each upload in YouTube Studio for final checks.
                  </p>
                </details>

                <details className="group rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Which formats are supported?
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                    Most tools accept common creator formats such as MP3, WAV, FLAC, JPG, PNG, and WebP. For best
                    results, use the highest quality source available and avoid heavily compressed files where possible.
                    Clean source files improve separation accuracy, compression quality, and final export clarity.
                  </p>
                </details>

                <details className="group rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Is my data secure on TuneVid?
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                    TuneVid is designed to process uploads for active jobs rather than store creator files long term.
                    Privacy and retention behavior should always be verified through the Privacy Policy and Terms pages.
                    If you manage sensitive client media, use project-specific naming and keep local backups of all
                    source and exported assets as part of standard production practice.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
