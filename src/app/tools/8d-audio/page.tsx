"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ToolBlog from "@/components/ToolBlog";
import UsageLimitGuard from "@/components/UsageLimitGuard";
import { Headphones, Loader2, RotateCw, ArrowLeft, Download, AlertCircle, CheckCircle, Info } from "lucide-react";
import SafeLink from "@/components/SafeLink";
import ToolSeoDescription from "@/components/ToolSeoDescription";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ROTATION_PATTERNS = [
  { value: "circle", label: "🔄 Circle", description: "Smooth circular motion — classic 8D" },
  { value: "figure8", label: "♾️ Figure-8", description: "Infinity pattern for dynamic feel" },
  { value: "bounce", label: "↔️ Bounce", description: "Left-to-right ping-pong motion" },
  { value: "random", label: "🎲 Random", description: "Unpredictable spatial movement" },
];

const INTENSITY_PRESETS = [
  { value: "subtle", label: "Subtle", speed: 15, reverb: true, description: "Gentle spatial effect" },
  { value: "immersive", label: "Immersive", speed: 10, reverb: true, description: "Recommended for most tracks" },
  { value: "extreme", label: "Extreme", speed: 5, reverb: true, description: "Maximum 8D effect" },
];

export default function EightDAudioPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [rotationSpeed, setRotationSpeed] = useState(10);
  const [enableReverb, setEnableReverb] = useState(true);
  const [pattern, setPattern] = useState("circle");
  const [intensityPreset, setIntensityPreset] = useState("immersive");

  const isReady = useMemo(() => !!file && !isProcessing, [file, isProcessing]);

  const handleFile = useCallback((selected: File) => {
    setError(null);
    setResultUrl(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (!selected.type.startsWith("audio/")) {
      setError("Please upload an audio file (MP3, WAV, FLAC).");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 50 MB.");
      return;
    }
    setFile(selected);
    setAudioUrl(URL.createObjectURL(selected));
  }, [audioUrl]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const handleBrowse = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleIntensityChange = (preset: string) => {
    setIntensityPreset(preset);
    const p = INTENSITY_PRESETS.find((i) => i.value === preset);
    if (p) {
      setRotationSpeed(p.speed);
      setEnableReverb(p.reverb);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResultUrl(null);

    const form = new FormData();
    form.append("audio_file", file);
    form.append("speed", String(rotationSpeed));
    form.append("reverb", enableReverb ? "1" : "0");
    form.append("pattern", pattern);

    try {
      const res = await axios.post(`${API_BASE}/api/tools/8d-audio`, form, {
        headers: { "Content-Type": "multipart/form-data", ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}) },
      });
      setResultUrl(res.data?.download_url);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResultUrl(null);
    setError(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10 text-zinc-900 dark:text-zinc-100">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools · 8D Audio Converter</p>
          <SafeLink
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Tools
          </SafeLink>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/20">
            <Headphones className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">8D Audio Converter</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Immersive spatial audio experience</p>
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Convert any track into immersive 8D spatial audio with customizable rotation patterns.
          Perfect for viral remixes and headphone-first listening experiences.
        </p>

        {/* Headphone Warning */}
        <div className="flex items-center gap-2 rounded-lg bg-pink-50 border border-pink-200 p-3 dark:bg-pink-900/10 dark:border-pink-800/30">
          <Headphones className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" strokeWidth={2} />
          <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">
            🎧 Use headphones for the best 8D experience. Speakers cannot reproduce the spatial effect.
          </p>
        </div>
      </section>

      {!isProcessing && !resultUrl && (
        <section className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 space-y-6">
          {/* Drop Zone */}
          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition ${dragActive
              ? "border-pink-500 bg-pink-50 dark:border-pink-400 dark:bg-pink-950/30"
              : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
              }`}
          >
            <RotateCw className="h-7 w-7 text-pink-500" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="text-sm font-medium">Drag & drop your audio here</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">MP3, WAV, FLAC supported · 50 MB max</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <input type="file" accept="audio/*" onChange={handleBrowse} className="hidden" />
              <Headphones className="h-4 w-4 text-pink-500" strokeWidth={1.5} />
              Browse file
            </label>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Headphones className="h-4 w-4 text-pink-500" strokeWidth={1.5} />
                <span className="font-medium text-zinc-700 dark:text-zinc-200">{file.name}</span>
                <button onClick={resetAll} className="text-red-500 hover:text-red-600 underline font-medium">Remove</button>
              </div>
            )}
          </div>

          {/* Rotation Pattern */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">Rotation Pattern</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {ROTATION_PATTERNS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPattern(p.value)}
                  className={`flex flex-col rounded-xl border px-4 py-3 text-left transition-all duration-200 ${pattern === p.value
                    ? "border-pink-500 bg-pink-50 dark:border-pink-400 dark:bg-pink-950/40"
                    : "border-zinc-200 bg-white hover:border-pink-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                    }`}
                >
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{p.label}</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{p.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Presets */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">Intensity</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {INTENSITY_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handleIntensityChange(p.value)}
                  className={`rounded-xl border px-4 py-3 text-left transition-all duration-200 ${intensityPreset === p.value
                    ? "border-pink-500 bg-pink-50 dark:border-pink-400 dark:bg-pink-950/40"
                    : "border-zinc-200 bg-white hover:border-pink-300 dark:border-zinc-800 dark:bg-zinc-950"
                    }`}
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{p.label}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Fine Controls */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Rotation Speed</p>
                <p className="text-sm font-bold text-pink-500">{rotationSpeed}s per lap</p>
              </div>
              <input
                type="range" min={2} max={20} step={1}
                value={rotationSpeed}
                onChange={(event) => setRotationSpeed(Number(event.target.value))}
                className="mt-3 w-full accent-pink-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-zinc-400">Fast (2s)</span>
                <span className="text-[10px] text-zinc-400">Slow (20s)</span>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Spatial Reverb</p>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Concert hall depth</span>
                <button
                  onClick={() => setEnableReverb((prev) => !prev)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full border transition focus:outline-none ${enableReverb
                    ? "border-pink-400 bg-pink-600"
                    : "border-zinc-400 bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-700"
                    }`}
                  type="button"
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${enableReverb ? "translate-x-7" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-2">
            <button
              disabled={!isReady}
              onClick={handleSubmit}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-bold transition-all duration-200 ${isReady
                ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02]"
                : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
                }`}
            >
              <Headphones className="h-4 w-4" strokeWidth={2} />
              Convert to 8D
            </button>
          </div>
        </section>
      )}

      {isProcessing && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Loader2 className="h-5 w-5 animate-spin text-pink-500" strokeWidth={2} />
            Creating 8D spatial mix...
          </div>
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 animate-pulse" style={{ width: "55%" }} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Applying {ROTATION_PATTERNS.find((p) => p.value === pattern)?.label} pattern at {rotationSpeed}s rotation speed.
          </p>
        </section>
      )}

      {resultUrl && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
              <CheckCircle className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Your 8D audio is ready</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {ROTATION_PATTERNS.find((p) => p.value === pattern)?.label} · {rotationSpeed}s rotation · {enableReverb ? "Reverb On" : "Reverb Off"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-pink-50 border border-pink-200 p-3 dark:bg-pink-900/10 dark:border-pink-800/30">
            <Info className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" strokeWidth={2} />
            <p className="text-xs text-pink-700 dark:text-pink-300 font-medium">
              Put on your headphones for the full 8D experience! 🎧
            </p>
          </div>

          {/* Comparison */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">🎵 Original (Stereo)</p>
              {audioUrl && (
                <audio controls className="w-full h-10">
                  <source src={audioUrl} />
                </audio>
              )}
            </div>
            <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-4 dark:border-pink-800/30 dark:bg-pink-950/20">
              <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 mb-2">🎧 8D Spatial</p>
              <audio controls className="w-full h-10">
                <source src={`${API_BASE}${resultUrl}`} />
              </audio>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`${API_BASE}${resultUrl}`}
              download
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 transition"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              Download 8D
            </a>
            <button onClick={resetAll} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition">
              Convert another
            </button>
          </div>
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Processing Error</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
              <button onClick={resetAll} className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400 hover:underline">Try again</button>
            </div>
          </div>
        </section>
      )}

      <ToolBlog toolName="8D Audio Converter" tagline="Immersive spatial audio that moves around your head" description="Transform any track into a 360-degree 8D spatial audio experience. The sound rotates and pans around your head using advanced pulsator filters, creating an incredibly immersive listening experience best enjoyed with headphones." accentColor="pink" howToSteps={[{ step: 1, title: "Upload your audio", description: "Drop an MP3, WAV, or FLAC file (up to 50 MB)." }, { step: 2, title: "Choose a rotation pattern", description: "Select Circle, Figure-8, Bounce, or Random for different spatial movement styles." }, { step: 3, title: "Set intensity level", description: "Choose Subtle for gentle movement, Immersive for the sweet spot, or Extreme for maximum effect." }, { step: 4, title: "Fine-tune controls", description: "Adjust rotation speed (2-20 seconds per lap) and toggle spatial reverb on/off." }, { step: 5, title: "Convert & compare", description: "Listen to Original vs 8D side-by-side, then download your spatial mix." }]} proTips={["Always use headphones — speakers cannot reproduce the 8D spatial effect.", "Circle pattern at 10s rotation with reverb ON is the most popular setting.", "Figure-8 creates an interesting infinity movement that works great for EDM.", "Slower rotation speeds (15-20s) work better for ballads and calm tracks."]} faq={[{ q: "Does 8D audio work on speakers?", a: "No, 8D audio relies on binaural processing that requires headphones to work properly. On speakers, you'll hear a panning effect but not full spatial immersion." }, { q: "What is the best rotation pattern?", a: "Circle is the classic 8D effect. Figure-8 adds complexity and Bounce creates a ping-pong effect. Try each and see which fits your track best." }]} />
      <ToolSeoDescription
        title="8D Audio Converter Guide"
        description="Learn how binaural panning simulates 3D motion and how to choose rotation, intensity, and ambience for immersive headphone playback."
        articleTitle="How 8D Spatial Audio Works"
        articleParagraphs={[
          "8D audio is created by automating subtle left-right panning and distance cues to simulate movement around the listener's head. The effect is strongest on headphones because each ear receives independent channel information.",
          "Professional 8D processing balances movement with musical stability. If motion is too aggressive, vocals can feel unstable. Slower rotation patterns preserve groove while still giving a cinematic, immersive result.",
          "For best output, start with clean stereo masters, preview multiple patterns, and keep loudness consistent. TuneVid helps creators compare original and processed versions before final download."
        ]}
      />
    </div>
  );
}


