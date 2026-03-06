"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ToolBlog from "@/components/ToolBlog";
import UsageLimitGuard from "@/components/UsageLimitGuard";
import { HardDriveDownload, Loader2, Minimize2, ArrowLeft } from "lucide-react";
import SafeLink from "@/components/SafeLink";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

const BITRATE_PRESETS = [
  { label: "Light (High Quality)", value: 192 },
  { label: "Medium (Balanced)", value: 128 },
  { label: "Heavy (Smallest Size)", value: 64 },
];

export default function AudioCompressorPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    originalSize: number;
    newSize: number;
    ratio: number;
  } | null>(null);
  const [bitrate, setBitrate] = useState(128);
  const [format, setFormat] = useState("mp3");

  const isReady = useMemo(() => !!file && !isProcessing, [file, isProcessing]);

  const handleFile = useCallback((selected: File) => {
    setError(null);
    setResult(null);
    if (!selected.type.startsWith("audio/")) {
      setError("Please upload an audio file (MP3, WAV, FLAC).");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 1 GB.");
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
    form.append("bitrate_kbps", String(bitrate));
    form.append("format", format);

    try {
      const res = await axios.post(`${API_BASE}/api/tools/compress-audio`, form, {
        headers: { "Content-Type": "multipart/form-data", ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}) },
      });
      setResult({
        url: res.data?.download_url,
        originalSize: res.data?.original_size,
        newSize: res.data?.new_size,
        ratio: res.data?.compression_ratio,
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
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools · Audio Compressor</p>
          <SafeLink
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Tools
          </SafeLink>
        </div>
        <div className="flex items-center gap-2">
          <Minimize2 className="h-5 w-5 text-teal-500" strokeWidth={1.5} />
          <h1 className="text-3xl font-semibold">Audio Compressor</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Reduce audio size for WhatsApp, email, or fast uploads while keeping great quality.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition ${dragActive
            ? "border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/30"
            : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
            }`}
        >
          <HardDriveDownload className="h-7 w-7 text-teal-500" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium">Drag & drop your audio file</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">MP3, WAV, FLAC supported · 1 GB max</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <input type="file" accept="audio/*" onChange={handleBrowse} className="hidden" />
            <Minimize2 className="h-4 w-4 text-teal-500" strokeWidth={1.5} />
            Browse file
          </label>
          {file && (
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Minimize2 className="h-4 w-4 text-teal-500" strokeWidth={1.5} />
              <span>{file.name}</span>
              <button onClick={resetAll} className="text-zinc-900 dark:text-zinc-100 underline">
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Compression level</p>
            <div className="mt-3 space-y-2">
              {BITRATE_PRESETS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition ${bitrate === option.value
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-teal-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    }`}
                >
                  <span>{option.label}</span>
                  <input
                    type="radio"
                    name="bitrate"
                    value={option.value}
                    checked={bitrate === option.value}
                    onChange={() => setBitrate(option.value)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Output format</p>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="mp3">MP3</option>
              <option value="ogg">OGG</option>
              <option value="m4a">M4A</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            disabled={!isReady}
            onClick={handleSubmit}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition ${isReady
              ? "bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 text-white shadow-lg hover:from-teal-500 hover:to-cyan-400"
              : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
              }`}
          >
            Compress Audio
          </button>
        </div>
      </section>

      {isProcessing && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-teal-500" strokeWidth={1.5} />
            Compressing your audio...
          </div>
        </section>
      )}

      {result && (
        <section className="rounded-2xl border border-teal-700 bg-teal-950 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-teal-200">Compression complete</p>
              <h2 className="text-lg font-semibold">Your compressed audio is ready</h2>
              <div className="mt-2 text-xs text-teal-200 space-y-1">
                <p>Original Size: {(result.originalSize / (1024 * 1024)).toFixed(2)} MB</p>
                <p>Compressed Size: {(result.newSize / (1024 * 1024)).toFixed(2)} MB</p>
                <p>Reduced: {(result.ratio * 100).toFixed(1)}%</p>
              </div>
            </div>
            <a
              href={`${API_BASE}${result.url}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"
            >
              Download file
            </a>
          </div>
          <audio controls className="mt-4 w-full">
            <source src={`${API_BASE}${result.url}`} />
          </audio>
          <button onClick={resetAll} className="mt-4 text-xs text-teal-200 hover:text-white">
            Compress another
          </button>
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </section>
      )}

      <ToolBlog toolName="Audio Compressor" tagline="Reduce file size without sacrificing quality" description="The Audio Compressor lets you shrink audio files for WhatsApp sharing, email attachments, or fast uploads. Choose from bitrate presets and see exact size comparisons with compression ratios before downloading." accentColor="teal" howToSteps={[{ step: 1, title: "Upload your audio", description: "Drop an MP3, WAV, or FLAC file." }, { step: 2, title: "Select target bitrate", description: "Choose between 64kbps (smallest), 128kbps (balanced), or 192kbps (high quality)." }, { step: 3, title: "Choose output format", description: "Select MP3, M4A, or OGG for the compressed output." }, { step: 4, title: "Compress & compare", description: "See the original vs compressed size with the exact compression ratio." }]} proTips={["128kbps MP3 is the WhatsApp sweet spot — small file, great quality for messaging.", "For podcasts, 64kbps is often sufficient since speech doesn’t need high bitrates.", "M4A format at the same bitrate sounds slightly better than MP3 due to better compression algorithm."]} />
    </div>
  );
}

