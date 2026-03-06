"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ToolBlog from "@/components/ToolBlog";
import UsageLimitGuard from "@/components/UsageLimitGuard";
import { ArrowDown, ArrowUp, Loader2, Trash2, UploadCloud, ArrowLeft } from "lucide-react";
import SafeLink from "@/components/SafeLink";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const MAX_FILE_SIZE = 500 * 1024 * 1024;

export default function AudioMergerPage() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [crossfade, setCrossfade] = useState(false);
  const [format, setFormat] = useState("mp3");

  const isReady = useMemo(() => files.length > 1 && !isProcessing, [files, isProcessing]);

  const handleFiles = useCallback((selectedFiles: FileList | File[]) => {
    const incoming = Array.from(selectedFiles);
    const valid: File[] = [];
    for (const file of incoming) {
      if (!file.type.startsWith("audio/")) {
        setError("Please upload only audio files (MP3, WAV, FLAC).");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("One or more files are too large (max 50 MB).");
        return;
      }
      valid.push(file);
    }
    setError(null);
    setResultUrl(null);
    setFiles((prev) => [...prev, ...valid]);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files?.length) {
      handleFiles(event.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleBrowse = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) handleFiles(event.target.files);
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    setFiles((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length < 2) return;

    setIsProcessing(true);
    setError(null);
    setResultUrl(null);

    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    form.append("crossfade", crossfade ? "1" : "0");
    form.append("format", format);

    try {
      const res = await axios.post(`${API_BASE}/api/tools/merge-audio`, form, {
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
    setFiles([]);
    setResultUrl(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10 text-zinc-900 dark:text-zinc-100">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools · Audio Joiner & Merger</p>
          <SafeLink
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Tools
          </SafeLink>
        </div>
        <div className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-cyan-500" strokeWidth={1.5} />
          <h1 className="text-3xl font-semibold">Audio Joiner & Merger</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Combine multiple tracks into a single file. Perfect for mashups, podcasts, and playlists.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition ${dragActive
              ? "border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/30"
              : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
            }`}
        >
          <UploadCloud className="h-7 w-7 text-cyan-500" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium">Drag & drop multiple audio files</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">MP3, WAV, FLAC supported · 500 MB max each</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <input type="file" accept="audio/*" multiple onChange={handleBrowse} className="hidden" />
            <UploadCloud className="h-4 w-4 text-cyan-500" strokeWidth={1.5} />
            Browse files
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{file.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveFile(index, "up")}
                    className="rounded-lg border border-zinc-200 bg-white p-2 text-cyan-600 hover:bg-cyan-50 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveFile(index, "down")}
                    className="rounded-lg border border-zinc-200 bg-white p-2 text-cyan-600 hover:bg-cyan-50 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="rounded-lg border border-zinc-200 bg-white p-2 text-red-500 hover:bg-red-50 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Crossfade</p>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Smooth 3s overlap</span>
              <button
                onClick={() => setCrossfade((prev) => !prev)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-cyan-500/60 ${crossfade
                    ? "border-cyan-400 bg-cyan-600"
                    : "border-zinc-400 bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-700"
                  }`}
                type="button"
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${crossfade ? "translate-x-7" : "translate-x-1"
                    }`}
                />
              </button>
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
              <option value="wav">WAV</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            disabled={!isReady}
            onClick={handleSubmit}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition ${isReady
                ? "bg-cyan-600 text-white shadow-lg hover:bg-cyan-500"
                : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
              }`}
          >
            Merge Audio Files
          </button>
        </div>
      </section>

      {isProcessing && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-500" strokeWidth={1.5} />
            Merging your tracks...
          </div>
        </section>
      )}

      {resultUrl && (
        <section className="rounded-2xl border border-cyan-700 bg-cyan-950 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-cyan-200">Merge complete</p>
              <h2 className="text-lg font-semibold">Your merged track is ready</h2>
            </div>
            <a
              href={`${API_BASE}${resultUrl}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
            >
              Download file
            </a>
          </div>
          <audio controls className="mt-4 w-full">
            <source src={`${API_BASE}${resultUrl}`} />
          </audio>
          <button onClick={resetAll} className="mt-4 text-xs text-cyan-200 hover:text-white">
            Merge another
          </button>
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </section>
      )}

      <ToolBlog toolName="Audio Joiner & Merger" tagline="Combine multiple tracks into one seamless file" description="The Audio Merger lets you combine multiple audio files into a single track. Drag to reorder, enable crossfade for smooth transitions, and choose your output format. Perfect for mashups, podcast compilations, and playlists." accentColor="cyan" howToSteps={[{ step: 1, title: "Upload multiple files", description: "Drop 2+ audio files (MP3, WAV, FLAC). You can upload them all at once." }, { step: 2, title: "Arrange order", description: "Use the up/down arrows to reorder tracks in the desired sequence." }, { step: 3, title: "Enable crossfade (optional)", description: "Toggle the 3-second crossfade for smooth transitions between tracks." }, { step: 4, title: "Merge & download", description: "Click Merge and download the combined track." }]} proTips={["Crossfade creates a 3-second overlap between tracks for smooth transitions.", "You can combine different formats — the tool normalizes everything during merge.", "For podcasts, disable crossfade to keep clean segment boundaries."]} />
    </div>
  );
}
