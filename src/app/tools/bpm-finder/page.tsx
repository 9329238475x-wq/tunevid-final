"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ToolBlog from "@/components/ToolBlog";
import UsageLimitGuard from "@/components/UsageLimitGuard";
import {
  Activity,
  FileAudio,
  Loader2,
  Music,
  Play,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import SafeLink from "@/components/SafeLink";
import ToolSeoDescription from "@/components/ToolSeoDescription";
import ToolResourceSection from "@/components/ToolResourceSection";
import { TOOL_RESOURCE_CONTENT } from "@/lib/tool-resource-content";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

interface AnalysisResult {
  bpm: number;
  key: string;
  confidence: number;
}

export default function BPMFinderPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const isReady = !!file && !isAnalyzing;

  const handleFile = useCallback((selected: File) => {
    setError(null);
    setResult(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (!selected.type.startsWith("audio/")) {
      setError("Please upload an audio file (MP3, WAV, etc.).");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 50 MB.");
      return;
    }
    setFile(selected);
    setAudioUrl(URL.createObjectURL(selected));
  }, [audioUrl]);

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

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setUploadProgress(0);

    const form = new FormData();
    form.append("audio_file", file);

    try {
      const res = await axios.post(`${API_BASE}/api/tools/analyze-bpm`, form, {
        headers: { "Content-Type": "multipart/form-data", ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}) },
        onUploadProgress: (event) => {
          if (!event.total) return;
          setUploadProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)));
        },
      });
      setResult(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10 text-zinc-900 dark:text-zinc-100">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools · BPM & Key Finder</p>
          <SafeLink
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Tools
          </SafeLink>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" strokeWidth={1.5} />
          <h1 className="text-3xl font-semibold">BPM & Key Finder</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Instantly detect tempo (BPM) and musical key from any audio track. Perfect for DJs,
          producers, and musicians.
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
          <Music className="h-7 w-7 text-green-500" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium">Drag & drop your audio track here</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Maximum 50 MB · MP3, WAV, FLAC supported</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <input type="file" accept="audio/*" onChange={handleBrowse} className="hidden" />
            <FileAudio className="h-4 w-4" strokeWidth={1.5} />
            Browse file
          </label>
          {file && (
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <FileAudio className="h-4 w-4" strokeWidth={1.5} />
              <span>{file.name}</span>
              <span>({formatFileSize(file.size)})</span>
              <button onClick={resetAll} className="text-zinc-900 dark:text-zinc-100 underline">
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            disabled={!isReady}
            onClick={handleAnalyze}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition ${isReady
                ? "bg-emerald-800 text-white shadow-sm hover:bg-emerald-700"
                : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
              }`}
          >
            <Activity className="h-4 w-4" strokeWidth={1.5} />
            Analyze BPM & Key
          </button>
        </div>
      </section>

      {isAnalyzing && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-green-500" strokeWidth={1.5} />
            Analyzing Tempo and Pitch...
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

      {result && !isAnalyzing && (
        <section className="rounded-2xl border border-green-800 bg-green-950 p-8 shadow-lg">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <p className="text-xs font-medium text-green-300">Detected Tempo</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl font-bold text-green-400">{result.bpm}</span>
                <span className="text-2xl font-semibold text-green-300">BPM</span>
              </div>
            </div>

            <div className="h-px w-24 bg-green-700" />

            <div className="space-y-2">
              <p className="text-xs font-medium text-green-300">Musical Key</p>
              <div className="text-4xl font-semibold text-white">{result.key}</div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {audioUrl && (
                <button
                  onClick={() => {
                    const audio = document.getElementById("preview-audio") as HTMLAudioElement;
                    if (audio) audio.play();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-900 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
                >
                  <Play className="h-4 w-4" strokeWidth={1.5} />
                  Play Preview
                </button>
              )}
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-900 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                Analyze Another
              </button>
            </div>

            {audioUrl && (
              <audio id="preview-audio" controls className="mt-4 w-full max-w-md">
                <source src={audioUrl} />
              </audio>
            )}

            {result.confidence && (
              <p className="mt-4 text-xs text-green-400">
                Detection confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </section>
      )}

      <ToolBlog toolName="BPM & Key Finder" tagline="Instant tempo and musical key detection powered by AI" description="The BPM & Key Finder uses Librosa's advanced audio analysis to detect the tempo (BPM) and musical key of any track. Essential for DJs, producers, and music creators who need to match tempos for mixing or find the right key for remixes and covers." accentColor="green" howToSteps={[{ step: 1, title: "Upload your track", description: "Drop an MP3, WAV, or FLAC file (up to 50 MB)." }, { step: 2, title: "Click Analyze", description: "The AI engine will analyze the audio waveform to detect BPM and musical key." }, { step: 3, title: "View results", description: "Get the detected BPM, musical key, and confidence score in a Spotify-style result card." }]} proTips={["For most accurate BPM, use tracks with a clear beat. Ambient or experimental music may produce variable results.", "The confidence score tells you how reliable the detection is — above 80% is very accurate.", "BPM detection works best with songs that maintain a consistent tempo throughout."]} faq={[{ q: "How accurate is the BPM detection?", a: "Very accurate for most commercial music (pop, EDM, hip-hop). The algorithm analyzes onset patterns and beat tracking. Complex time signatures may produce results with lower confidence." }, { q: "What musical key formats are shown?", a: "The tool shows key in standard notation (e.g., C Major, A Minor) along with the Camelot wheel notation used by DJs." }]} />
      <ToolSeoDescription
        title="BPM Detection for Producers and DJs"
        description="Find accurate tempo values for editing, remixing, transitions, and beat-synced content production."
        articleTitle="How BPM Analysis Improves Music Workflow"
        articleParagraphs={[
          "BPM is the structural backbone of rhythmic editing. Accurate tempo detection helps align loops, time effects, and build smooth transitions between songs.",
          "For remixing and mashups, knowing BPM early prevents timing drift and reduces manual correction work. It also improves compatibility with DAW grids and DJ software.",
          "Reliable BPM tools analyze transient peaks and rhythmic patterns to estimate tempo quickly, saving creators significant prep time before production starts."
        ]}
      />
      <ToolResourceSection {...TOOL_RESOURCE_CONTENT["bpm-finder"]} />
    </div>
  );
}