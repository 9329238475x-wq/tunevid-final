import { Info } from "lucide-react";

export const metadata = {
    title: "About",
    description: "TuneVid is a free AI-powered audio studio — create visualizers, remove vocals, boost bass, and publish directly to YouTube.",
};

export default function AboutPage() {
    return (
        <div className="mx-auto max-w-3xl px-6 py-16 space-y-6">
            <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">About</p>
            </div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">TuneVid</h1>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm legal-content dark:border-zinc-800 dark:bg-zinc-950">
                <p>
                    TuneVid is a free, open-source tool that helps music creators,
                    podcasters, and content enthusiasts turn their audio into visually
                    stunning videos — and publish them directly to YouTube with a single
                    click.
                </p>

                <h2>Our Mission</h2>
                <p>
                    We believe every sound deserves a visual identity. Whether you&apos;re
                    a bedroom producer, an independent artist, or a podcast host, TuneVid
                    makes it effortless to create bass-reactive audio visualizer videos
                    — no editing software required.
                </p>

                <h2>How It Works</h2>
                <ul>
                    <li>Upload your MP3 audio and a cover image (JPG / PNG).</li>
                    <li>Optionally enable the AI Vocal Remover powered by Spleeter to isolate instrumentals.</li>
                    <li>TuneVid generates a 720p visualizer video using FFmpeg with dynamic frequency bars and waveforms.</li>
                    <li>The video is uploaded directly to your YouTube channel via the YouTube Data API v3.</li>
                    <li>All temporary files are deleted from our server immediately after upload.</li>
                </ul>

                <h2>Your Privacy Matters</h2>
                <p>
                    We never store your files beyond the processing session. Your YouTube
                    credentials are used only to publish one video at a time and are not
                    saved. Read our full <a href="/privacy-policy">Privacy Policy</a> for details.
                </p>

                <h2>Built With</h2>
                <ul>
                    <li><strong>Frontend:</strong> Next.js, React, Tailwind CSS</li>
                    <li><strong>Backend:</strong> Python, FastAPI, FFmpeg</li>
                    <li><strong>AI:</strong> Spleeter (Deezer) for vocal separation</li>
                    <li><strong>Integration:</strong> YouTube Data API v3 with OAuth 2.0</li>
                </ul>

                <h2>Contact</h2>
                <p>
                    Have questions, feedback, or feature requests? Reach out to us at
                    <a href="mailto:9329238475x@gmail.com">9329238475x@gmail.com</a>.
                </p>
            </div>
        </div>
    );
}
