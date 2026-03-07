"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ToolBlog from "@/components/ToolBlog";
import UsageLimitGuard from "@/components/UsageLimitGuard";
import { Loader2, Mic, Waves, ArrowLeft } from "lucide-react";
import SafeLink from "@/components/SafeLink";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const REDUCTION_LEVELS = [
  { label: "Light", value: 10, description: "Best for mild hiss." },
  { label: "Medium", value: 20, description: "Standard background noise." },
  { label: "Heavy", value: 30, description: "Very noisy environments." },
];

export default function NoiseReducerPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [reduction, setReduction] = useState(20);

  const isReady = useMemo(() => !!file && !isProcessing, [file, isProcessing]);

  const handleFile = useCallback((selected: File) => {
    setError(null);
    setResultUrl(null);
    if (!selected.type.startsWith("audio/")) {
      setError("Please upload an audio file (MP3, WAV, FLAC).");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 50 MB.");
      return;
    }
    setFile(selected);
  }, []);

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

  const handleSubmit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResultUrl(null);

    const form = new FormData();
    form.append("audio_file", file);
    form.append("reduction_amount", String(reduction));

    try {
      const res = await axios.post(`${API_BASE}/api/tools/denoise-audio`, form, {
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
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10 text-zinc-900 dark:text-zinc-100">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools · AI Audio Noise Reducer</p>
          <SafeLink
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Tools
          </SafeLink>
        </div>
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-green-500" strokeWidth={1.5} />
          <h1 className="text-3xl font-semibold">AI Audio Noise Reducer</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Clean up hiss, room noise, and background hum with fast AI-style denoising.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition ${dragActive
              ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-950/30"
              : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
            }`}
        >
          <Waves className="h-7 w-7 text-green-500" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium">Drag & drop your audio</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">MP3, WAV, FLAC supported · 50 MB max</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <input type="file" accept="audio/*" onChange={handleBrowse} className="hidden" />
            <Mic className="h-4 w-4 text-green-500" strokeWidth={1.5} />
            Browse file
          </label>
          {file && (
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Mic className="h-4 w-4 text-green-500" strokeWidth={1.5} />
              <span>{file.name}</span>
              <button onClick={resetAll} className="text-zinc-900 dark:text-zinc-100 underline">
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Reduction level</p>
            <div className="mt-3 space-y-2">
              {REDUCTION_LEVELS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition ${reduction === option.value
                      ? "border-emerald-800 bg-emerald-800 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    }`}
                >
                  <div>
                    <p>{option.label}</p>
                    <p className="text-[11px] text-zinc-400">{option.description}</p>
                  </div>
                  <input
                    type="radio"
                    name="reduction"
                    value={option.value}
                    checked={reduction === option.value}
                    onChange={() => setReduction(option.value)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            disabled={!isReady}
            onClick={handleSubmit}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition ${isReady
                ? "bg-emerald-800 text-white shadow-lg hover:bg-emerald-700"
                : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
              }`}
          >
            Clean Audio
          </button>
        </div>
      </section>

      {isProcessing && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-green-500" strokeWidth={1.5} />
            Cleaning your audio...
          </div>
        </section>
      )}

      {resultUrl && (
        <section className="rounded-2xl border border-emerald-800 bg-emerald-950 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-emerald-200">Noise reduced</p>
              <h2 className="text-lg font-semibold">Compare your audio</h2>
            </div>
            <a
              href={`${API_BASE}${resultUrl}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Download file
            </a>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-800 bg-emerald-900/40 p-4">
              <p className="text-xs text-emerald-200">Original</p>
              {file && (
                <audio controls className="mt-2 w-full">
                  <source src={URL.createObjectURL(file)} />
                </audio>
              )}
            </div>
            <div className="rounded-xl border border-emerald-800 bg-emerald-900/40 p-4">
              <p className="text-xs text-emerald-200">Cleaned</p>
              <audio controls className="mt-2 w-full">
                <source src={`${API_BASE}${resultUrl}`} />
              </audio>
            </div>
          </div>
          <button onClick={resetAll} className="mt-4 text-xs text-emerald-200 hover:text-white">
            Clean another
          </button>
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </section>
      )}

      <ToolBlog toolName="AI Noise Reducer" tagline="Crystal-clear audio with AI-powered noise removal" description="The Noise Reducer uses advanced FFmpeg filters (afftdn and anlmdn) to remove hiss, hum, wind noise, and background interference from recordings. Compare before and after with the built-in dual player." accentColor="blue" howToSteps={[{ step: 1, title: "Upload your recording", description: "Drop an MP3, WAV, or FLAC file with unwanted background noise." }, { step: 2, title: "Choose reduction level", description: "Select Light (for subtle hiss), Medium (for general noise), or Heavy (for severe background noise)." }, { step: 3, title: "Process & compare", description: "Listen to the original and denoised versions side by side to verify the quality." }, { step: 4, title: "Download", description: "Download the clean audio in 320kbps MP3." }]} proTips={["Light mode preserves the most natural sound — best for studio recordings with minor noise.", "Heavy mode uses AI-like non-local means denoising for severely noisy recordings.", "For podcasts and voiceovers, Medium mode usually delivers the best balance.", "If the result sounds too processed, try a lighter setting — over-reduction can affect voice quality."]} />
    </div>
  );
}

