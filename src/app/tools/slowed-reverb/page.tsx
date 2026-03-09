"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ToolBlog from "@/components/ToolBlog";
import UsageLimitGuard from "@/components/UsageLimitGuard";
import { Loader2, Music, Sparkles, ArrowLeft, Download, AlertCircle, CheckCircle } from "lucide-react";
import SafeLink from "@/components/SafeLink";
import ToolSeoDescription from "@/components/ToolSeoDescription";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const REVERB_PRESETS = [
  { value: "room", label: "🏠 Room", description: "Intimate, close reverb", speed: 0.88, reverb: 25 },
  { value: "hall", label: "🏛️ Hall", description: "Classic concert hall reverb", speed: 0.85, reverb: 45 },
  { value: "stadium", label: "🏟️ Stadium", description: "Massive, epic reverb tail", speed: 0.82, reverb: 70 },
  { value: "dreamy", label: "💫 Dreamy Lo-Fi", description: "Deep slow with heavy reverb", speed: 0.78, reverb: 85 },
  { value: "custom", label: "🎛️ Custom", description: "Dial your own speed & reverb", speed: 0.85, reverb: 40 },
];

export default function SlowedReverbPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState("hall");
  const [speed, setSpeed] = useState(0.85);
  const [reverb, setReverb] = useState(45);

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

  const handlePresetChange = (presetValue: string) => {
    setPreset(presetValue);
    const p = REVERB_PRESETS.find((r) => r.value === presetValue);
    if (p && presetValue !== "custom") {
      setSpeed(p.speed);
      setReverb(p.reverb);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResultUrl(null);
    setUploadProgress(0);

    const form = new FormData();
    form.append("audio_file", file);
    form.append("speed", String(speed));
    form.append("reverb", String(reverb));
    form.append("preset", preset);

    try {
      const res = await axios.post(`${API_BASE}/api/tools/slowed-reverb`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        onUploadProgress: (event) => {
          if (!event.total) return;
          setUploadProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)));
        },
      });
      setResultUrl(res.data?.download_url);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail;
        if (status === 401) {
          setError("Please sign in to use this tool.");
        } else if (status === 403) {
          setError("Access denied. Suspicious activity detected from your network.");
        } else if (status === 429) {
          const msg = typeof detail === "object" ? detail?.message : detail;
          setError(msg || "Daily usage limit reached. Please try again later.");
        } else {
          const msg = typeof detail === "object" ? detail?.message || JSON.stringify(detail) : detail;
          setError(msg ?? err.message);
        }
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
    setUploadProgress(0);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10 text-zinc-900 dark:text-zinc-100">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools · Slowed + Reverb</p>
          <SafeLink
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Tools
          </SafeLink>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg shadow-purple-500/20">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Slowed + Reverb Generator</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Create dreamy lo-fi edits instantly</p>
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Slow down your track, add atmospheric reverb, and create the perfect lo-fi vibe.
          Choose from professional reverb presets or customize your own.
        </p>
      </section>

      <UsageLimitGuard toolName="slowed_reverb">
        {!isProcessing && !resultUrl && (
          <section className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 space-y-6">
            {/* Drop Zone */}
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition ${dragActive
                ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/30"
                : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
                }`}
            >
              <Music className="h-7 w-7 text-purple-400" strokeWidth={1.5} />
              <div className="space-y-1">
                <p className="text-sm font-medium">Drag & drop your audio here</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">MP3, WAV, FLAC supported · 50 MB max</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <input type="file" accept="audio/*" onChange={handleBrowse} className="hidden" />
                <Music className="h-4 w-4 text-purple-400" strokeWidth={1.5} />
                Browse file
              </label>
              {file && (
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <Music className="h-4 w-4 text-purple-400" strokeWidth={1.5} />
                  <span className="font-medium text-zinc-700 dark:text-zinc-200">{file.name}</span>
                  <button onClick={resetAll} className="text-red-500 hover:text-red-600 underline font-medium">Remove</button>
                </div>
              )}
            </div>

            {/* Reverb Presets */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">Reverb Preset</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {REVERB_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => handlePresetChange(p.value)}
                    className={`flex flex-col rounded-xl border px-4 py-3 text-left transition-all duration-200 ${preset === p.value
                      ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/40"
                      : "border-zinc-200 bg-white hover:border-purple-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                      }`}
                  >
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{p.label}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{p.description}</span>
                    {p.value !== "custom" && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
                        {p.speed}x · {p.reverb}% reverb
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Sliders (always visible, editable when custom is selected) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 transition ${preset !== "custom" ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Slowing Rate</p>
                  <p className="text-sm font-bold text-purple-500">{speed.toFixed(2)}x</p>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.01}
                  value={speed}
                  onChange={(event) => {
                    setSpeed(Number(event.target.value));
                    setPreset("custom");
                  }}
                  className="mt-3 w-full accent-purple-500 h-2 rounded-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-zinc-400">0.5x (Very Slow)</span>
                  <span className="text-[10px] text-zinc-400">1.0x (Normal)</span>
                </div>
              </div>
              <div className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 transition ${preset !== "custom" ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Reverb Intensity</p>
                  <p className="text-sm font-bold text-purple-500">{reverb}%</p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={reverb}
                  onChange={(event) => {
                    setReverb(Number(event.target.value));
                    setPreset("custom");
                  }}
                  className="mt-3 w-full accent-purple-500 h-2 rounded-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-zinc-400">Dry</span>
                  <span className="text-[10px] text-zinc-400">Heavy Reverb</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-2">
              <button
                disabled={!isReady}
                onClick={handleSubmit}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-bold transition-all duration-200 ${isReady
                  ? "bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]"
                  : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
                  }`}
              >
                <Sparkles className="h-4 w-4" strokeWidth={2} />
                Generate Lo-Fi Track
              </button>
            </div>
          </section>
        )}

        {isProcessing && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" strokeWidth={2} />
              Rendering slowed + reverb audio...
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div>
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div className="h-2 rounded-full bg-purple-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Uploading file: {uploadProgress}%</p>
              </div>
            )}
            <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 animate-pulse" style={{ width: "60%" }} />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Applying {speed.toFixed(2)}x speed with {reverb}% reverb. This usually takes 10-30 seconds.
            </p>
          </section>
        )}

        {resultUrl && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600">
                <CheckCircle className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Your lo-fi track is ready</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {speed.toFixed(2)}x speed · {reverb}% reverb · {REVERB_PRESETS.find((p) => p.value === preset)?.label || "Custom"} preset
                </p>
              </div>
            </div>

            {/* Comparison - Original vs Result */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">🎵 Original</p>
                {audioUrl && (
                  <audio controls className="w-full h-10">
                    <source src={audioUrl} />
                  </audio>
                )}
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800/30 dark:bg-purple-950/20">
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">💫 Slowed + Reverb</p>
                <audio controls className="w-full h-10">
                  <source src={`${API_BASE}${resultUrl}`} />
                </audio>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`${API_BASE}${resultUrl}`}
                download
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 transition"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                Download
              </a>
              <button onClick={resetAll} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition">
                Generate another
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
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{typeof error === "string" ? error : "Something went wrong. Please try again."}</p>
                <button onClick={resetAll} className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400 hover:underline">Try again</button>
              </div>
            </div>
          </section>
        )}
      </UsageLimitGuard>

      <ToolBlog toolName="Slowed + Reverb Generator" tagline="Create dreamy lo-fi edits in seconds" description="The Slowed + Reverb Generator lets you slow down any track and add atmospheric reverb to create the iconic lo-fi aesthetic. Choose from professional presets or fine-tune your own settings for the perfect vibe." accentColor="purple" howToSteps={[{ step: 1, title: "Upload your audio", description: "Drag and drop an MP3, WAV, or FLAC file (up to 50 MB)." }, { step: 2, title: "Choose a reverb preset", description: "Select from Room, Hall, Stadium, Dreamy Lo-Fi, or Custom for full manual control." }, { step: 3, title: "Fine-tune settings", description: "Adjust the slowing rate (0.5x-1.0x) and reverb intensity (0-100%). Moving sliders auto-switches to Custom mode." }, { step: 4, title: "Generate & compare", description: "Hit Generate and compare the original vs the lo-fi version side by side." }]} proTips={["Hall preset (0.85x, 45% reverb) works great for most songs.", "For TikTok-style edits, try Dreamy Lo-Fi preset at 0.78x speed.", "Output is 320kbps MP3 for excellent quality."]} faq={[{ q: "Will the pitch change when I slow down?", a: "Yes, slowing the track naturally lowers the pitch, which is the signature lo-fi sound. This is by design." }, { q: "Can I preview before downloading?", a: "Absolutely! After processing, you'll see both the Original and Slowed+Reverb players side by side." }]} />
      <ToolSeoDescription
        title="Slowed + Reverb Production Notes"
        description="Create lo-fi and atmospheric edits with controlled speed reduction and space-enhancing ambience."
        articleTitle="Building the Slowed-Reverb Sound"
        articleParagraphs={[
          "Slowed + reverb edits combine tempo reduction with ambience to create a dreamy, emotional listening experience popular on short-form and streaming platforms.",
          "The best results come from subtle speed changes and measured reverb depth. Too much processing can blur transients and reduce vocal intelligibility.",
          "Creators should compare original and processed versions, then export at high quality for distribution. TuneVid streamlines this process with preset and custom controls."
        ]}
      />
    </div>
  );
}


