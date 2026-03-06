"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ToolBlog from "@/components/ToolBlog";
import UsageLimitGuard from "@/components/UsageLimitGuard";
import { Loader2, ScissorsLineDashed, Zap, ArrowLeft } from "lucide-react";
import SafeLink from "@/components/SafeLink";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const THRESHOLD_OPTIONS = [
  { label: "High", value: -30, description: "Removes even very quiet pauses." },
  { label: "Medium", value: -40, description: "Balanced for most recordings." },
  { label: "Low", value: -50, description: "Only removes absolute silence." },
];

export default function SilenceRemoverPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    oldDuration: number;
    newDuration: number;
    timeSaved: number;
  } | null>(null);
  const [threshold, setThreshold] = useState(-40);
  const [duration, setDuration] = useState(0.5);
  const [padMs, setPadMs] = useState(50);

  const isReady = useMemo(() => !!file && !isProcessing, [file, isProcessing]);

  const handleFile = useCallback((selected: File) => {
    setError(null);
    setResult(null);
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
    setResult(null);

    const form = new FormData();
    form.append("audio_file", file);
    form.append("threshold", String(threshold));
    form.append("duration", String(duration));
    form.append("pad_ms", String(padMs));

    try {
      const res = await axios.post(`${API_BASE}/api/tools/remove-silence`, form, {
        headers: { "Content-Type": "multipart/form-data", ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}) },
      });
      setResult({
        url: res.data?.download_url,
        oldDuration: res.data?.old_duration,
        newDuration: res.data?.new_duration,
        timeSaved: res.data?.time_saved,
      });
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
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10 text-zinc-900 dark:text-zinc-100">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools · Smart Silence Remover</p>
          <SafeLink
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Tools
          </SafeLink>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-500" strokeWidth={1.5} />
          <h1 className="text-3xl font-semibold">Smart Silence Remover</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Automatically remove silent gaps and tighten your recordings for faster delivery.
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
          <ScissorsLineDashed className="h-7 w-7 text-green-500" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium">Drag & drop your audio</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">MP3, WAV, FLAC supported · 50 MB max</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <input type="file" accept="audio/*" onChange={handleBrowse} className="hidden" />
            <Zap className="h-4 w-4 text-green-500" strokeWidth={1.5} />
            Browse file
          </label>
          {file && (
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Zap className="h-4 w-4 text-green-500" strokeWidth={1.5} />
              <span>{file.name}</span>
              <button onClick={resetAll} className="text-zinc-900 dark:text-zinc-100 underline">
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sensitivity (Threshold)</p>
            <div className="mt-3 space-y-2">
              {THRESHOLD_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition ${threshold === option.value
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
                    name="threshold"
                    value={option.value}
                    checked={threshold === option.value}
                    onChange={() => setThreshold(option.value)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Min Silence Duration to Cut</p>
            <p className="mt-2 text-sm font-semibold text-green-500">{duration.toFixed(1)}s</p>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.1}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="mt-3 w-full accent-emerald-500"
            />
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Cut Padding (Smooth Transition)</p>
            <p className="mt-2 text-sm font-semibold text-green-500">{padMs}ms</p>
            <input
              type="range"
              min={0}
              max={500}
              step={25}
              value={padMs}
              onChange={(event) => setPadMs(Number(event.target.value))}
              className="mt-3 w-full accent-emerald-500"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              Adds silence padding at cut points to prevent abrupt jumps
            </p>
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
            Auto-Trim Silence
          </button>
        </div>
      </section>

      {isProcessing && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-green-500" strokeWidth={1.5} />
            Removing silent sections...
          </div>
        </section>
      )}

      {result && (
        <section className="rounded-2xl border border-emerald-800 bg-emerald-950 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-emerald-200">Trim complete</p>
              <h2 className="text-lg font-semibold">Your trimmed audio is ready</h2>
              <div className="mt-2 text-xs text-emerald-200 space-y-1">
                <p>Original Duration: {result.oldDuration.toFixed(1)}s</p>
                <p>New Duration: {result.newDuration.toFixed(1)}s</p>
                <p>Time Saved: {result.timeSaved.toFixed(1)}s</p>
              </div>
            </div>
            <a
              href={`${API_BASE}${result.url}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Download file
            </a>
          </div>
          <audio controls className="mt-4 w-full">
            <source src={`${API_BASE}${result.url}`} />
          </audio>
          <button onClick={resetAll} className="mt-4 text-xs text-emerald-200 hover:text-white">
            Trim another
          </button>
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </section>
      )}

      <ToolBlog toolName="Smart Silence Remover" tagline="Auto-trim dead air from podcasts and recordings" description="The Silence Remover automatically detects and removes silent gaps in audio. Adjust sensitivity threshold, minimum silence duration, and cut padding for smooth transitions. See exactly how much time you saved after processing." accentColor="orange" howToSteps={[{ step: 1, title: "Upload your recording", description: "Drop a podcast, lecture, or voice recording (MP3/WAV/FLAC)." }, { step: 2, title: "Adjust sensitivity", description: "Set the silence threshold (-60dB to -20dB) and minimum duration to cut (0.1s-2.0s)." }, { step: 3, title: "Set cut padding", description: "Add 0-500ms of padding at cut points to prevent abrupt jumps between segments." }, { step: 4, title: "Process & review", description: "See the time saved and download the tightened audio." }]} proTips={["For podcasts, try -40dB threshold with 0.5s minimum duration for natural-sounding cuts.", "Use 50-100ms padding for smooth transitions that don't sound chopped.", "Lower threshold values (-50dB, -60dB) will catch more quiet sections including soft breaths."]} />
    </div>
  );
}

