"use client";

import { useCallback, useMemo, useState } from "react";
import useProgress from "@/hooks/useProgress";
import ProgressBar from "@/components/ProgressBar";
import { useSession } from "next-auth/react";
import axios from "axios";
import ToolBlog from "@/components/ToolBlog";
import UsageLimitGuard from "@/components/UsageLimitGuard";
import {
  Download,
  FileAudio,
  Loader2,
  UploadCloud,
  MicOff,
  Layers,
  ArrowLeft,
  Mic,
  Drum,
  Guitar,
  Piano,
  Music,
  Headphones,
  AlertCircle,
  CheckCircle,
  Wand2,
} from "lucide-react";
import SafeLink from "@/components/SafeLink";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const MODE_OPTIONS = [
  {
    value: "2stems",
    title: "Standard (2-Stems)",
    description: "Separate Vocals & Instrumental — Perfect for karaoke",
    icon: MicOff,
    badge: null,
  },
  {
    value: "4stems",
    title: "Pro (4-Stems)",
    description: "Extract Vocals, Drums, Bass & More — Full studio isolation",
    icon: Layers,
    badge: "PRO",
  },
];

const MODEL_OPTIONS = [
  {
    value: "htdemucs",
    label: "Standard Quality",
    description: "Faster processing, good for most tracks",
    speed: "~2-3 min",
  },
  {
    value: "htdemucs_ft",
    label: "Best Quality (Fine-tuned)",
    description: "Highest quality stem separation — recommended",
    speed: "~3-5 min",
  },
];

// Icons for each stem type with color coding
const STEM_CONFIG: Record<string, { label: string; color: string; gradient: string; IconComponent: any; description: string }> = {
  vocals: {
    label: "Vocals",
    color: "text-pink-500",
    gradient: "from-pink-500/10 to-rose-500/10",
    IconComponent: Mic,
    description: "Isolated vocal track",
  },
  no_vocals: {
    label: "Instrumental (Karaoke)",
    color: "text-emerald-500",
    gradient: "from-emerald-500/10 to-teal-500/10",
    IconComponent: Music,
    description: "Music without vocals",
  },
  accompaniment: {
    label: "Instrumental (Music)",
    color: "text-emerald-500",
    gradient: "from-emerald-500/10 to-teal-500/10",
    IconComponent: Music,
    description: "Full instrumental",
  },
  drums: {
    label: "Drums & Percussion",
    color: "text-amber-500",
    gradient: "from-amber-500/10 to-orange-500/10",
    IconComponent: Drum,
    description: "Isolated drum track",
  },
  bass: {
    label: "Bass",
    color: "text-blue-500",
    gradient: "from-blue-500/10 to-indigo-500/10",
    IconComponent: Headphones,
    description: "Isolated bass line",
  },
  other: {
    label: "Other Instruments",
    color: "text-purple-500",
    gradient: "from-purple-500/10 to-violet-500/10",
    IconComponent: Guitar,
    description: "Guitar, synths, piano & more",
  },
  piano: {
    label: "Piano / Keys",
    color: "text-cyan-500",
    gradient: "from-cyan-500/10 to-sky-500/10",
    IconComponent: Piano,
    description: "Isolated keys & piano",
  },
};

export default function VocalRemoverPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState("2stems");
  const [model, setModel] = useState("htdemucs_ft");
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [playingStem, setPlayingStem] = useState<string | null>(null);

  const progressData = useProgress(taskId, API_BASE);
  const isReady = useMemo(() => !!file && !isProcessing, [file, isProcessing]);

  const handleFile = useCallback((selected: File) => {
    setError(null);
    setResult(null);
    if (!selected.type.startsWith("audio/")) {
      setError("Please upload an MP3 or WAV file.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 50 MB.");
      return;
    }
    setFile(selected);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
      const dropped = event.dataTransfer.files?.[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleBrowse = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setTaskId(null);

    const form = new FormData();
    form.append("audio_file", file);
    form.append("mode", mode);
    form.append("model", model);

    try {
      const res = await axios.post(`${API_BASE}/api/tools/vocal-remover`, form, {
        headers: { "Content-Type": "multipart/form-data", ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}) },
        timeout: 600000, // 10 min timeout for large files
      });

      if (res.data?.task_id) {
        setTaskId(res.data.task_id);
      }

      setResult(res.data?.stems ?? res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === "string") {
          setError(detail);
        } else if (err.code === "ECONNABORTED") {
          setError("Processing took too long. Try a shorter audio file or the Standard model.");
        } else {
          setError(err.message || "Something went wrong. Please try again.");
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
    setResult(null);
    setError(null);
    setTaskId(null);
    setPlayingStem(null);
  };

  const handlePlayStem = (stemName: string) => {
    // Pause all other audio elements
    document.querySelectorAll("audio").forEach((audio) => {
      if (audio.id !== `audio-${stemName}`) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setPlayingStem(playingStem === stemName ? null : stemName);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools · Vocal Remover</p>
          <SafeLink
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Tools
          </SafeLink>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Wand2 className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Vocal Remover</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Powered by Meta Demucs · Studio-grade separation</p>
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Studio-quality AI stem separation. Upload any track and isolate vocals, drums, bass, and
          instruments in minutes. Perfect for karaoke, remixes, and music production.
        </p>
      </section>

      {/* Upload + Settings */}
      {!isProcessing && !result && (
        <section className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 space-y-6">
          {/* Drop Zone */}
          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition ${dragActive
              ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/20"
              : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
              }`}
          >
            <UploadCloud className="h-7 w-7 text-emerald-500" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="text-sm font-medium">Drag & drop your MP3/WAV here</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Maximum 50 MB · Stereo audio recommended</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <input type="file" accept="audio/*" onChange={handleBrowse} className="hidden" />
              <FileAudio className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
              Browse file
            </label>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <FileAudio className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                <span className="font-medium text-zinc-700 dark:text-zinc-200">{file.name}</span>
                <span>({formatFileSize(file.size)})</span>
                <button onClick={resetAll} className="text-red-500 hover:text-red-600 underline font-medium">
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Stem Mode Selector */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">Separation Mode</p>
            <div className="grid gap-3 md:grid-cols-2">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className={`relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${mode === option.value
                    ? "border-emerald-500 bg-emerald-50 shadow-sm dark:border-emerald-400 dark:bg-emerald-950/40"
                    : "border-zinc-200 bg-white hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                    }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${mode === option.value
                    ? "border-emerald-300 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900"
                    : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
                    }`}>
                    <option.icon className={`h-4 w-4 ${mode === option.value ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`} strokeWidth={1.5} />
                  </span>
                  <span className="space-y-0.5 flex-1">
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {option.title}
                    </span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      {option.description}
                    </span>
                  </span>
                  {option.badge && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {option.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* AI Model Selector */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">AI Model Quality</p>
            <div className="grid gap-3 md:grid-cols-2">
              {MODEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setModel(opt.value)}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all duration-200 ${model === opt.value
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/40"
                    : "border-zinc-200 bg-white hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-950"
                    }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{opt.label}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{opt.description}</p>
                  </div>
                  <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {opt.speed}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-2">
            <button
              disabled={!isReady}
              onClick={handleSubmit}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-bold transition-all duration-200 ${isReady
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
                }`}
            >
              <Wand2 className="h-4 w-4" strokeWidth={2} />
              Separate Vocals
            </button>
          </div>
        </section>
      )}

      {/* Processing State */}
      {isProcessing && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" strokeWidth={2} />
            AI is separating your audio...
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Using <span className="font-semibold">{model === "htdemucs_ft" ? "Fine-tuned" : "Standard"}</span> Demucs model for{" "}
            {mode === "2stems" ? "2-stem" : "4-stem"} separation. This may take a few minutes.
          </p>

          {taskId && (
            <ProgressBar
              progress={progressData.progress}
              statusText={progressData.message}
              accentColor="bg-emerald-500"
            />
          )}

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 dark:bg-amber-900/10 dark:border-amber-800/30">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Don&apos;t close this tab. Processing happens on our server and results will appear here automatically.
            </p>
          </div>
        </section>
      )}

      {/* Results — Professional Stem Cards */}
      {result && !isProcessing && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
          {/* Result Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <CheckCircle className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Your stems are ready</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {Object.keys(result).length} stems separated · {model === "htdemucs_ft" ? "Fine-tuned" : "Standard"} quality
                </p>
              </div>
            </div>
            <button onClick={resetAll} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition">
              Process another file
            </button>
          </div>

          {/* Stem Grid — 2x2 for 4-stems, 1x2 for 2-stems */}
          <div className={`grid gap-4 ${Object.keys(result).length > 2 ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
            {Object.entries(result).map(([stem, url]) => {
              const config = STEM_CONFIG[stem] || {
                label: stem,
                color: "text-zinc-500",
                gradient: "from-zinc-500/10 to-zinc-400/10",
                IconComponent: Music,
                description: "Separated audio",
              };
              const StemIcon = config.IconComponent;

              return (
                <div
                  key={stem}
                  className={`rounded-xl border border-zinc-200 bg-gradient-to-br ${config.gradient} p-5 dark:border-zinc-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
                >
                  {/* Stem Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700`}>
                      <StemIcon className={`h-5 w-5 ${config.color}`} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{config.label}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{config.description}</p>
                    </div>
                  </div>

                  {/* Audio Player */}
                  <audio
                    id={`audio-${stem}`}
                    controls
                    className="w-full mt-2 h-10"
                    onPlay={() => handlePlayStem(stem)}
                    onPause={() => setPlayingStem(null)}
                  >
                    <source src={`${API_BASE}${url}`} />
                  </audio>

                  {/* Download Button */}
                  <a
                    href={`${API_BASE}${url}`}
                    download
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={2} />
                    Download WAV
                  </a>
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3 dark:bg-zinc-900 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              💡 <span className="font-semibold">Tip:</span> Files are in lossless WAV format for maximum quality. Use the Audio Converter tool to convert to MP3 if needed.
            </p>
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Processing Error</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
              <button
                onClick={resetAll}
                className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400 hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </section>
      )}

      <ToolBlog
        toolName="AI Vocal Remover"
        tagline="Studio-grade vocal & stem separation powered by Meta's Demucs AI"
        description="TuneVid's Vocal Remover uses Meta's Demucs deep learning model to separate any song into individual stems — vocals, drums, bass, and other instruments. Whether you're creating karaoke tracks, remixes, acapellas, or isolated instrumentals, this tool delivers professional results in minutes."
        accentColor="emerald"
        howToSteps={[
          { step: 1, title: "Upload your audio file", description: "Drag and drop or browse for an MP3 or WAV file (up to 50 MB). Stereo audio gives the best results." },
          { step: 2, title: "Choose separation mode", description: "Select 2-Stem for vocals + instrumental, or 4-Stem (Pro) for vocals, drums, bass, and other instruments." },
          { step: 3, title: "Select AI model quality", description: "Choose Standard for fast processing or Fine-tuned for the highest quality stem separation." },
          { step: 4, title: "Click 'Separate Vocals'", description: "The AI will process your track. This may take 2-5 minutes depending on the model and file length." },
          { step: 5, title: "Preview & download stems", description: "Listen to each separated stem, then download the lossless WAV files for your project." },
        ]}
        proTips={[
          "Use the Fine-tuned model (htdemucs_ft) for music with complex arrangements — it excels at isolating overlapping instruments.",
          "For karaoke purposes, 2-Stem mode is faster and produces cleaner vocal/instrumental separation.",
          "Stems are exported as lossless WAV. Use our Audio Converter to convert to MP3 if file size matters.",
          "Works best with studio-quality recordings. Live recordings or heavily compressed audio may produce artifacts.",
        ]}
        faq={[
          { q: "Is the vocal removal quality comparable to professional plugins?", a: "Yes! Demucs is Meta's state-of-the-art AI model, used by professional producers worldwide. The \"Fine-tuned\" model delivers near-studio-quality separation." },
          { q: "What formats are supported for upload?", a: "MP3, WAV, and FLAC files are supported. We recommend WAV for the best input quality. Maximum file size is 50 MB." },
          { q: "Can I use the separated stems commercially?", a: "The tool separates audio you upload. Make sure you have the rights to use and modify any copyrighted material. TuneVid does not grant licenses for third-party content." },
          { q: "Why does processing take a few minutes?", a: "Deep learning-based stem separation is computationally intensive. The AI analyzes the entire frequency spectrum to cleanly isolate each instrument. Better quality takes more time." },
        ]}
      />
    </div>
  );
}

