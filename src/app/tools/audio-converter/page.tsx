"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ToolBlog from "@/components/ToolBlog";
import UsageLimitGuard from "@/components/UsageLimitGuard";
import { FileAudio, Loader2, UploadCloud, ArrowLeft } from "lucide-react";
import SafeLink from "@/components/SafeLink";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const FORMAT_OPTIONS = ["MP3", "WAV", "FLAC", "M4A", "OGG"] as const;
const BITRATE_OPTIONS = [
  { value: "128k", label: "128kbps (Good)" },
  { value: "192k", label: "192kbps (Better)" },
  { value: "320k", label: "320kbps (Best)" },
];

export default function AudioConverterPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [format, setFormat] = useState<(typeof FORMAT_OPTIONS)[number]>("MP3");
  const [bitrate, setBitrate] = useState("320k");

  const isReady = useMemo(() => !!file && !isProcessing, [file, isProcessing]);
  const showBitrate = useMemo(() => ["MP3", "M4A", "OGG"].includes(format), [format]);

  const handleFile = useCallback((selected: File) => {
    setError(null);
    setResult(null);
    if (!selected.type.startsWith("audio/") && !selected.type.startsWith("video/")) {
      setError("Please upload an audio or video file.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 100 MB.");
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

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append("file", file);
    form.append("target_format", format.toLowerCase());
    form.append("bitrate", bitrate);

    try {
      const res = await axios.post(`${API_BASE}/api/tools/convert-audio`, form, {
        headers: { "Content-Type": "multipart/form-data", ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}) },
      });
      setResult({ url: res.data?.download_url, size: res.data?.size_bytes });
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
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools · Audio to MP3/WAV Converter</p>
          <SafeLink
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Tools
          </SafeLink>
        </div>
        <div className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-green-500" strokeWidth={1.5} />
          <h1 className="text-3xl font-semibold">Audio to MP3/WAV Converter</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Convert audio or video into MP3/WAV and other common formats in one click.
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
          <UploadCloud className="h-7 w-7 text-green-500" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium">Drag & drop audio or video here</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              MP3, WAV, FLAC, M4A, OGG, MP4, MOV, WEBM supported
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <input type="file" accept="audio/*,video/*" onChange={handleBrowse} className="hidden" />
            <FileAudio className="h-4 w-4 text-green-500" strokeWidth={1.5} />
            Browse file
          </label>
          {file && (
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <FileAudio className="h-4 w-4 text-green-500" strokeWidth={1.5} />
              <span>{file.name}</span>
              <button onClick={resetAll} className="text-zinc-900 dark:text-zinc-100 underline">
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Target format</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setFormat(option)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${format === option
                      ? "border-emerald-800 bg-emerald-800 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Quality (Bitrate)</p>
            {showBitrate ? (
              <div className="mt-3 space-y-2">
                {BITRATE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition ${bitrate === option.value
                        ? "border-emerald-800 bg-emerald-800 text-white"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
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
            ) : (
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                Lossless output selected. Bitrate not required.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            disabled={!isReady}
            onClick={handleConvert}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition ${isReady
                ? "bg-emerald-800 text-white shadow-lg hover:bg-emerald-700"
                : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
              }`}
          >
            Convert File
          </button>
        </div>
      </section>

      {isProcessing && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-green-500" strokeWidth={1.5} />
            Converting your file...
          </div>
        </section>
      )}

      {result && (
        <section className="rounded-2xl border border-emerald-800 bg-emerald-950 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-emerald-200">Conversion complete</p>
              <h2 className="text-lg font-semibold">Your file is ready</h2>
              <p className="text-xs text-emerald-200 mt-1">
                Size: {(result.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <a
              href={`${API_BASE}${result.url}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Download file
            </a>
          </div>
          <button onClick={resetAll} className="mt-4 text-xs text-emerald-200 hover:text-white">
            Convert another
          </button>
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </section>
      )}

      <ToolBlog toolName="Audio Converter" tagline="Convert between all major audio formats instantly" description="Convert audio files or extract sound from videos. Supports MP3, WAV, FLAC, M4A, and OGG with selectable bitrate quality presets. Perfect for format compatibility, reducing file size, or extracting audio from video files." accentColor="orange" howToSteps={[{ step: 1, title: "Upload audio or video", description: "Drop any audio file (MP3, WAV, FLAC, M4A, OGG) or video file (MP4, MOV, WEBM)." }, { step: 2, title: "Choose target format", description: "Select your desired output format from MP3, WAV, FLAC, M4A, or OGG." }, { step: 3, title: "Set quality", description: "For lossy formats, choose 128kbps, 192kbps, or 320kbps. WAV and FLAC are lossless." }, { step: 4, title: "Convert & download", description: "Click Convert and download the converted file." }]} proTips={["WAV and FLAC are lossless — no bitrate selection needed, but file sizes are larger.", "320kbps MP3 is indistinguishable from lossless for most listeners.", "Extract audio from MP4/WEBM video files — great for music videos and screen recordings."]} />
    </div>
  );
}
