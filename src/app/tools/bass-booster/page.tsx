"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ToolBlog from "@/components/ToolBlog";
import UsageLimitGuard from "@/components/UsageLimitGuard";
import { Loader2, Speaker, Zap, ArrowLeft } from "lucide-react";
import SafeLink from "@/components/SafeLink";
import ToolSeoDescription from "@/components/ToolSeoDescription";
import ToolResourceSection from "@/components/ToolResourceSection";
import { TOOL_RESOURCE_CONTENT } from "@/lib/tool-resource-content";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const PRESETS = {
  "Extreme Bass": { bass: 18, treble: -4, volume: 6 },
  "Car Mix": { bass: 12, treble: 2, volume: 4 },
  "Vocal Boost": { bass: 4, treble: 6, volume: 2 },
  Flat: { bass: 0, treble: 0, volume: 0 },
};

export default function BassBoosterPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState<keyof typeof PRESETS>("Car Mix");
  const [bassGain, setBassGain] = useState(PRESETS["Car Mix"].bass);
  const [trebleGain, setTrebleGain] = useState(PRESETS["Car Mix"].treble);
  const [volumeGain, setVolumeGain] = useState(PRESETS["Car Mix"].volume);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handlePresetChange = (value: keyof typeof PRESETS) => {
    setPreset(value);
    const presetValues = PRESETS[value];
    setBassGain(presetValues.bass);
    setTrebleGain(presetValues.treble);
    setVolumeGain(presetValues.volume);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResultUrl(null);
    setUploadProgress(0);

    const form = new FormData();
    form.append("audio_file", file);
    form.append("bass_gain", String(bassGain));
    form.append("treble_gain", String(trebleGain));
    form.append("volume_gain", String(volumeGain));

    try {
      const res = await axios.post(`${API_BASE}/api/tools/bass-boost`, form, {
        headers: { "Content-Type": "multipart/form-data", ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}) },
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
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 text-zinc-900 dark:text-zinc-100">
        <section className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading tool...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10 text-zinc-900 dark:text-zinc-100">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools · Bass Booster</p>
          <SafeLink
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Tools
          </SafeLink>
        </div>
        <div className="flex items-center gap-2">
          <Speaker className="h-5 w-5 text-green-500" strokeWidth={1.5} />
          <h1 className="text-3xl font-semibold">Bass Booster</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Pump deep bass, refine treble, and push volume for car mixes, remixes, and bass-heavy edits.
        </p>
      </section>

      <UsageLimitGuard toolName="bass_boost">
        <section className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition ${dragActive
              ? "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-950/30"
              : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
              }`}
          >
            <Zap className="h-7 w-7 text-green-500" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="text-sm font-medium">Drag & drop your audio here</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">MP3, WAV, FLAC supported · 50 MB max</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <input type="file" accept="audio/*" onChange={handleBrowse} className="hidden" />
              <Speaker className="h-4 w-4 text-green-500" strokeWidth={1.5} />
              Browse file
            </label>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Speaker className="h-4 w-4 text-green-500" strokeWidth={1.5} />
                <span>{file.name}</span>
                <button onClick={resetAll} className="text-zinc-900 dark:text-zinc-100 underline">
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Preset</p>
              <select
                value={preset}
                onChange={(event) => handlePresetChange(event.target.value as keyof typeof PRESETS)}
                className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                {Object.keys(PRESETS).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Volume Boost</p>
              <p className="mt-2 text-sm font-semibold text-green-500">{volumeGain} dB</p>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={volumeGain}
                onChange={(event) => setVolumeGain(Number(event.target.value))}
                className="mt-3 w-full accent-red-500"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Bass / Thump</p>
              <p className="mt-2 text-sm font-semibold text-green-500">{bassGain} dB</p>
              <input
                type="range"
                min={-10}
                max={20}
                step={1}
                value={bassGain}
                onChange={(event) => setBassGain(Number(event.target.value))}
                className="mt-3 w-full accent-red-500"
              />
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Treble / Crisp</p>
              <p className="mt-2 text-sm font-semibold text-green-500">{trebleGain} dB</p>
              <input
                type="range"
                min={-10}
                max={10}
                step={1}
                value={trebleGain}
                onChange={(event) => setTrebleGain(Number(event.target.value))}
                className="mt-3 w-full accent-red-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              disabled={!isReady}
              onClick={handleSubmit}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition ${isReady
                ? "bg-red-600 text-white shadow-lg hover:bg-red-500"
                : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
                }`}
            >
              <Zap className="h-4 w-4" strokeWidth={1.5} />
              Boost Audio
            </button>
          </div>
        </section>

        {isProcessing && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Loader2 className="h-4 w-4 animate-spin text-green-500" strokeWidth={1.5} />
              Processing bass boost...
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-3">
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Uploading file: {uploadProgress}%</p>
              </div>
            )}
          </section>
        )}

        {resultUrl && (
          <section className="rounded-2xl border border-red-700 bg-red-950 p-6 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-red-200">Boost complete</p>
                <h2 className="text-lg font-semibold">Your boosted track is ready</h2>
              </div>
              <a
                href={`${API_BASE}${resultUrl}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                Download file
              </a>
            </div>
            <audio controls className="mt-4 w-full">
              <source src={`${API_BASE}${resultUrl}`} />
            </audio>
            <button onClick={resetAll} className="mt-4 text-xs text-red-200 hover:text-white">
              Boost another
            </button>
          </section>
        )}

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {typeof error === "string" ? error : "Something went wrong. Please try again."}
          </section>
        )}
      </UsageLimitGuard>

      <ToolBlog toolName="Bass Booster" tagline="Deep bass, crisp treble, and powerful volume — all in one tool" description="The Bass Booster features a 3-band equalizer with presets for car mixes, deep bass, balanced enhancement, and treble boost. Fine-tune bass, treble, and volume independently for the perfect sound profile." accentColor="red" howToSteps={[{ step: 1, title: "Upload your audio", description: "Drop an MP3, WAV, or FLAC file (up to 50 MB)." }, { step: 2, title: "Choose a preset or customize", description: "Select Deep Bass, Balanced, Car Mode, or Treble Boost — or manually adjust all three bands." }, { step: 3, title: "Process & preview", description: "Hit Boost Audio and listen to the enhanced version." }, { step: 4, title: "Download", description: "Download the boosted track in 320kbps MP3 quality." }]} proTips={["Car Mode preset is optimized for car stereo systems with heavy sub-bass.", "Avoid pushing bass above 18dB on tracks with existing bass — it may cause clipping.", "For vocals, try Treble Boost preset to add clarity and presence."]} faq={[{ q: "Will bass boosting reduce audio quality?", a: "Our tool uses professional FFmpeg equalizer filters. At reasonable levels (6-12dB), quality remains excellent. Extreme boost may cause slight distortion." }, { q: "Can I boost bass and treble together?", a: "Yes! Use the manual sliders to adjust bass, treble, and volume independently for complete control." }]} />
      <ToolSeoDescription
        title="Bass Boosting Without Mud"
        description="Enhance low-end energy while keeping vocals and midrange detail clear."
        articleTitle="Smart Bass Enhancement for Modern Tracks"
        articleParagraphs={[
          "Bass boosting increases low-frequency presence, but excessive gain can quickly make mixes muddy. Effective enhancement balances sub-bass punch with midrange intelligibility.",
          "A practical approach combines moderate bass gain, controlled treble adjustment, and level checks across headphones, phones, and speakers.",
          "TuneVid helps creators test bass enhancement quickly so tracks feel fuller for reels, shorts, and music uploads without sacrificing overall clarity."
        ]}
      />
      <ToolResourceSection {...TOOL_RESOURCE_CONTENT["bass-booster"]} />
    </div>
  );
}