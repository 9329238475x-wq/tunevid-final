"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { signIn, useSession } from "next-auth/react";
import VisualizerCanvas from "./VisualizerCanvas";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const MAX_SIZE  = 50 * 1024 * 1024; // 50 MB
const fmt = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`;

const STEPS = [
  { label: "Uploading files…",          icon: "⬆️" },
  { label: "Generating video…",         icon: "🎛️" },
  { label: "Publishing to YouTube…",    icon: "🚀" },
  { label: "Done!",                      icon: "✅" },
];

export default function UploadForm() {
  const { data: session } = useSession();

  const [audioFile,    setAudioFile]    = useState<File | null>(null);
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [title,        setTitle]        = useState("");
  const [description,  setDescription]  = useState("");
  const [privacy,      setPrivacy]      = useState("private");
  const [madeForKids,  setMadeForKids]  = useState("no");
  const [tags,         setTags]         = useState("");
  const [categoryId,   setCategoryId]   = useState("10");
  const [isUploading,  setIsUploading]  = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [statusText,   setStatusText]   = useState("");
  const [activeStep,   setActiveStep]   = useState(0);
  const [youtubeUrl,   setYoutubeUrl]   = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [jobId,        setJobId]        = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);

  const imageUrl = useMemo(() =>
    imageFile ? URL.createObjectURL(imageFile) : null,
  [imageFile]);

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    esRef.current?.close();
  }, [imageUrl]);

  const reset = () => {
    setError(null); setYoutubeUrl(null);
    setProgress(0); setActiveStep(0); setStatusText("");
  };

  // ── Dropzones ────────────────────────────────────────────────────
  const audioDz = useDropzone({
    maxSize: MAX_SIZE,
    multiple: false,
    accept: { "audio/*": [".mp3", ".wav"] },
    onDrop: (f) => { setAudioFile(f[0] ?? null); reset(); },
  });

  const imageDz = useDropzone({
    maxSize: MAX_SIZE,
    multiple: false,
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    onDrop: (f) => { setImageFile(f[0] ?? null); reset(); },
  });

  // ── Cancel ───────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (jobId) await axios.post(`${API_BASE}/cancel/${jobId}`).catch(() => {});
    esRef.current?.close();
    setIsUploading(false);
    setStatusText("Cancelled");
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!audioFile || !imageFile) return;
    const token = (session as any)?.accessToken;
    if (!token) { setError("Please login with YouTube first."); return; }

    setIsUploading(true);
    setError(null);
    setYoutubeUrl(null);
    setProgress(2);
    setActiveStep(0);
    setStatusText(STEPS[0].label);

    const form = new FormData();
    form.append("audio_file",           audioFile);
    form.append("image_file",           imageFile);
    form.append("title",                title || audioFile.name.replace(/\.[^/.]+$/, ""));
    form.append("description",          description);
    form.append("privacy_status",       privacy);
    form.append("made_for_kids",         madeForKids);
    form.append("tags",                  tags);
    form.append("category_id",           categoryId);
    form.append("youtube_access_token",  (session as any)?.accessToken  ?? "");
    form.append("youtube_refresh_token", (session as any)?.refreshToken ?? "");

    try {
      const res = await axios.post(`${API_BASE}/upload_to_youtube`, form, {
        onUploadProgress: (e) => {
          if (e.total) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(Math.min(Math.round(pct * 0.25), 24));
            setStatusText(`Uploading… ${pct}%`);
          }
        },
      });

      const id = res.data.job_id ?? res.data.task_id;
      setJobId(id);
      setActiveStep(1);
      setStatusText(STEPS[1].label);

      // SSE progress
      esRef.current?.close();
      const es = new EventSource(`${API_BASE}/progress/${id}`);
      esRef.current = es;

      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          setProgress(data.progress ?? 0);
          setStatusText(data.message ?? "Processing…");
          setActiveStep(Math.max(0, (data.step ?? 1) - 1));
          if (data.youtube_url) setYoutubeUrl(data.youtube_url);
          if (data.progress >= 100) {
            setIsUploading(false);
            es.close();
            if (!data.youtube_url) {
              setError(data.message?.startsWith("Error:") ? data.message : "Upload failed. Check backend logs.");
            }
          }
        } catch { /* ignore */ }
      };
      es.onerror = () => {
        es.close();
        setIsUploading(false);
        setError("Connection lost. Please try again.");
      };

    } catch (err) {
      setIsUploading(false);
      setError(axios.isAxiosError(err)
        ? (err.response?.data?.detail ?? err.message)
        : "Something went wrong. Please try again.");
    }
  };

  const isReady = !!audioFile && !!imageFile && !!(session as any)?.accessToken;

  // ── UI ───────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Upload to <span className="gradient-text">YouTube</span>
        </h1>
        <p className="mt-3 text-slate-400 max-w-md mx-auto text-sm">
          Drop your audio + image. We'll render and publish to YouTube in seconds.
        </p>
      </div>

      {/* ── File dropzones ── */}
      {!isUploading && !youtubeUrl && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">

          {/* Audio */}
          <div
            {...audioDz.getRootProps()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all
              ${audioDz.isDragActive
                ? "border-cyan-400 bg-cyan-500/10"
                : audioFile
                  ? "border-cyan-500/40 bg-cyan-500/5"
                  : "border-white/10 bg-white/5 hover:border-white/20"}`}
          >
            <input {...audioDz.getInputProps()} />
            <div className="text-3xl mb-3">🎵</div>
            {audioFile ? (
              <>
                <p className="text-sm font-bold text-white truncate">{audioFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">{fmt(audioFile.size)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setAudioFile(null); reset(); }}
                  className="mt-3 text-xs text-rose-400 hover:underline"
                >Remove</button>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-white">Drop MP3 / WAV</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse · max 50 MB</p>
              </>
            )}
          </div>

          {/* Image */}
          <div
            {...imageDz.getRootProps()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all
              ${imageDz.isDragActive
                ? "border-emerald-400 bg-emerald-500/10"
                : imageFile
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-white/10 bg-white/5 hover:border-white/20"}`}
          >
            <input {...imageDz.getInputProps()} />
            {imageFile && imageUrl ? (
              <div className="flex flex-col items-center">
                <img src={imageUrl} alt="cover" className="w-20 h-20 rounded-xl object-cover mb-3 shadow-lg" />
                <p className="text-sm font-bold text-white truncate w-full text-center">{imageFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">{fmt(imageFile.size)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setImageFile(null); reset(); }}
                  className="mt-3 text-xs text-rose-400 hover:underline"
                >Remove</button>
              </div>
            ) : (
              <>
                <div className="text-3xl mb-3">🖼️</div>
                <p className="text-sm font-bold text-white">Drop JPG / PNG</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse · max 50 MB</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Image preview canvas ── */}
      {imageFile && imageUrl && !isUploading && !youtubeUrl && (
        <div className="mb-6 rounded-2xl overflow-hidden shadow-xl">
          <VisualizerCanvas audioFile={audioFile} imageUrl={imageUrl} />
        </div>
      )}

      {/* ── Metadata form ── */}
      {!isUploading && !youtubeUrl && (
        <div className="glass-card p-6 mb-6 space-y-4">
          <h2 className="text-base font-bold text-white">YouTube Details</h2>

          {!session ? (
            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign in with Google / YouTube
            </button>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Track name…"
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visibility</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                >
                  <option value="public"   className="bg-slate-900">Public 🌐</option>
                  <option value="unlisted" className="bg-slate-900">Unlisted 🔗</option>
                  <option value="private"  className="bg-slate-900">Private 🔒</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audience</label>
                <select
                  value={madeForKids}
                  onChange={(e) => setMadeForKids(e.target.value)}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                >
                  <option value="no" className="bg-slate-900">No, it’s not made for kids</option>
                  <option value="yes" className="bg-slate-900">Yes, it’s made for kids</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                >
                  <option value="10" className="bg-slate-900">Music</option>
                  <option value="24" className="bg-slate-900">Entertainment</option>
                  <option value="20" className="bg-slate-900">Gaming</option>
                  <option value="27" className="bg-slate-900">Education</option>
                  <option value="22" className="bg-slate-900">People & Blogs</option>
                  <option value="23" className="bg-slate-900">Comedy</option>
                  <option value="28" className="bg-slate-900">Science & Technology</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="music, lofi, chill"
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                />
                <p className="text-[11px] text-slate-500 mt-2">Separate tags with commas.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Add details about your track…"
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40 resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Progress UI ── */}
      {isUploading && (
        <div className="glass-card p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Processing…</h3>
            <button onClick={handleCancel} className="text-xs text-rose-400 hover:underline font-bold">
              Cancel ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mb-6">
            <span>{statusText}</span>
            <span>{Math.round(progress)}%</span>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STEPS.map((s, i) => (
              <div key={i} className={`text-center p-3 rounded-xl border transition-all
                ${i < activeStep  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : i === activeStep ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                : "border-white/5 bg-white/5 text-slate-600"}`}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-[10px] font-bold uppercase tracking-tight leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {youtubeUrl && (
        <div className="glass-card border-emerald-500/30 p-10 text-center mb-6">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-white mb-2">Video Live on YouTube!</h2>
          <p className="text-slate-400 text-sm mb-6">Your track has been published successfully.</p>
          <a
            href={youtubeUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            ▶ Watch on YouTube
          </a>
          <button
            onClick={() => { setAudioFile(null); setImageFile(null); setYoutubeUrl(null); reset(); }}
            className="block mx-auto mt-4 text-xs text-slate-500 hover:text-white"
          >
            Upload another track
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="glass-card border-rose-500/30 bg-rose-500/5 p-4 mb-6 flex items-center gap-3">
          <span className="text-rose-400 text-xl">⚠️</span>
          <p className="text-rose-400 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-slate-500 hover:text-white">✕</button>
        </div>
      )}

      {/* ── Submit button ── */}
      {!isUploading && !youtubeUrl && (
        <button
          onClick={handleUpload}
          disabled={!isReady}
          className={`w-full py-4 rounded-2xl text-lg font-black tracking-wide transition-all
            ${isReady
              ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:from-cyan-400 hover:to-violet-500 shadow-[0_0_40px_-8px_rgba(99,102,241,0.5)] hover:scale-[1.02] active:scale-95"
              : "bg-white/5 text-slate-600 cursor-not-allowed"}`}
        >
          {isReady ? "⚡ Generate & Upload to YouTube" : "Upload Audio + Image to Continue"}
        </button>
      )}

    </div>
  );
}
