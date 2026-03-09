"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useSession, signIn } from "next-auth/react";
import {
    AlignLeft,
    CheckCircle,
    CloudUpload,
    EyeOff,
    Globe,
    Image as ImageIcon,
    Loader2,
    Lock,
    Music,
    Tags as TagsIcon,
    Type,
    Upload,
    Youtube,
    X,
    FileAudio,
    FileImage,
    Sparkles,
    Shield,
    Clock,
    Send,
    Minimize2,
    Maximize2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

const fmt = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/* ─── localStorage helpers for persistent task tracking ─── */
const STORAGE_KEY = "tunevid_active_task";

function saveTask(taskId: string) {
    try { localStorage.setItem(STORAGE_KEY, taskId); } catch { }
}
function loadTask(): string | null {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function clearTask() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
}

/* ───────────────────────── component ───────────────────────── */
export default function Uploader() {
    const { data: session } = useSession();

    // ── File state ──
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioFileId, setAudioFileId] = useState<string | null>(null);
    const [imageFileId, setImageFileId] = useState<string | null>(null);
    const [audioUploadProgress, setAudioUploadProgress] = useState(0);
    const [imageUploadProgress, setImageUploadProgress] = useState(0);
    const [audioUploading, setAudioUploading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [audioUploaded, setAudioUploaded] = useState(false);
    const [imageUploaded, setImageUploaded] = useState(false);

    // ── Metadata state ──
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [privacyStatus, setPrivacyStatus] = useState("private");
    const [madeForKids, setMadeForKids] = useState("no");
    const [tags, setTags] = useState("");
    const [categoryId, setCategoryId] = useState("10");
    const [publishWhenReady, setPublishWhenReady] = useState(false);

    // ── Processing state ──
    const [isProcessing, setIsProcessing] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ── Minimizable UI state ──
    const [isMinimized, setIsMinimized] = useState(false);

    const eventSourceRef = useRef<EventSource | null>(null);

    // Image preview URL
    const imagePreviewUrl = useMemo(
        () => (imageFile ? URL.createObjectURL(imageFile) : null),
        [imageFile]
    );

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        };
    }, [imagePreviewUrl]);


    /* ── SSE progress listener ── */
    const listenSSE = useCallback((id: string) => {
        eventSourceRef.current?.close();
        const es = new EventSource(`${API_BASE}/progress/${id}`);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setProgress(data.progress ?? 0);
                setStatusMsg(data.message ?? "Processing…");
                if (data.youtube_url) setYoutubeUrl(data.youtube_url);
                if (data.progress >= 100) {
                    setIsProcessing(false);
                    setIsMinimized(false);
                    clearTask();
                    es.close();
                    if (!data.youtube_url) {
                        setError(
                            data.message?.startsWith("Error:")
                                ? data.message
                                : "Upload failed. Check backend logs."
                        );
                    }
                }
            } catch {
                /* ignore */
            }
        };
        es.onerror = () => {
            // Try to reconnect once after a short delay
            es.close();
            setTimeout(() => {
                const savedTask = loadTask();
                if (savedTask) {
                    const retryEs = new EventSource(`${API_BASE}/progress/${savedTask}`);
                    eventSourceRef.current = retryEs;
                    retryEs.onmessage = es.onmessage;
                    retryEs.onerror = () => {
                        retryEs.close();
                        setIsProcessing(false);
                        setIsMinimized(false);
                        clearTask();
                        setError("Connection lost. Please try again.");
                    };
                } else {
                    setIsProcessing(false);
                    setIsMinimized(false);
                    setError("Connection lost. Please try again.");
                }
            }, 2000);
        };
    }, []);

    /* ── Restore active task on mount (page refresh persistence) ── */
    useEffect(() => {
        const savedTask = loadTask();
        if (savedTask) {
            setTaskId(savedTask);
            setIsProcessing(true);
            setStatusMsg("Reconnecting…");
            setProgress(0);
            listenSSE(savedTask);
        }
        return () => {
            eventSourceRef.current?.close();
        };
    }, [listenSSE]);

    /* ── Publish (no file upload, uses pre-uploaded file IDs) ── */
    const handlePublish = useCallback(async () => {
        if (!audioFileId || !imageFileId) return;
        if (!(session as any)?.googleAccessToken) {
            setError("Please login with YouTube first.");
            return;
        }

        setIsProcessing(true);
        setError(null);
        setYoutubeUrl(null);
        setProgress(2);
        setStatusMsg("Starting video generation…");

        const form = new FormData();
        form.append("audio_file_id", audioFileId);
        form.append("image_file_id", imageFileId);
        form.append("title", title || audioFile?.name?.replace(/\.[^/.]+$/, "") || "Untitled");
        form.append("description", description);
        form.append("privacy_status", privacyStatus);
        form.append("made_for_kids", madeForKids);
        form.append("tags", tags);
        form.append("category_id", categoryId);
        form.append("youtube_access_token", (session as any).googleAccessToken ?? "");
        form.append("youtube_refresh_token", (session as any).refreshToken ?? "");

        try {
            const res = await axios.post(`${API_BASE}/api/publish`, form);
            const id = res.data.task_id;
            setTaskId(id);
            saveTask(id);
            listenSSE(id);
        } catch (err) {
            setIsProcessing(false);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.detail ?? err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    }, [audioFileId, imageFileId, session, title, description, privacyStatus, madeForKids, tags, categoryId, audioFile, listenSSE]);

    // Auto-publish when both files are uploaded and checkbox is checked
    useEffect(() => {
        if (audioUploaded && imageUploaded && publishWhenReady && !isProcessing && !youtubeUrl) {
            handlePublish();
        }
    }, [audioUploaded, imageUploaded, publishWhenReady, isProcessing, youtubeUrl, handlePublish]);

    /* ── Upload a single file to server immediately ── */
    const uploadFileToServer = useCallback(
        async (file: File, fileType: "audio" | "image") => {
            const setUploading = fileType === "audio" ? setAudioUploading : setImageUploading;
            const setProgressFn = fileType === "audio" ? setAudioUploadProgress : setImageUploadProgress;
            const setFileId = fileType === "audio" ? setAudioFileId : setImageFileId;
            const setUploaded = fileType === "audio" ? setAudioUploaded : setImageUploaded;

            setUploading(true);
            setProgressFn(0);
            setUploaded(false);
            setError(null);

            const form = new FormData();
            form.append("file", file);
            form.append("file_type", fileType);

            try {
                const res = await axios.post(`${API_BASE}/api/upload-file`, form, {
                    onUploadProgress: (e) => {
                        if (e.total) {
                            const pct = Math.round((e.loaded / e.total) * 100);
                            setProgressFn(pct);
                        }
                    },
                });
                setFileId(res.data.file_id);
                setProgressFn(100);
                setUploaded(true);
            } catch (err) {
                setError(
                    axios.isAxiosError(err)
                        ? err.response?.data?.detail ?? err.message
                        : "File upload failed. Please try again."
                );
                setProgressFn(0);
            } finally {
                setUploading(false);
            }
        },
        []
    );

    /* ── Dropzones (separate for audio and image) ── */
    const audioDz = useDropzone({
        maxSize: MAX_SIZE,
        multiple: false,
        accept: { "audio/*": [".mp3", ".wav", ".flac", ".m4a", ".ogg"] },
        onDrop: (files) => {
            const f = files[0];
            if (!f) return;
            setAudioFile(f);
            setAudioFileId(null);
            setAudioUploaded(false);
            setAudioUploadProgress(0);
            setError(null);
            setYoutubeUrl(null);
            uploadFileToServer(f, "audio");
        },
    });

    const imageDz = useDropzone({
        maxSize: MAX_SIZE,
        multiple: false,
        accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
        onDrop: (files) => {
            const f = files[0];
            if (!f) return;
            setImageFile(f);
            setImageFileId(null);
            setImageUploaded(false);
            setImageUploadProgress(0);
            setError(null);
            setYoutubeUrl(null);
            uploadFileToServer(f, "image");
        },
    });


    /* ── Cancel ── */
    const handleCancel = async () => {
        if (!taskId) return;
        try {
            await axios.post(`${API_BASE}/cancel/${taskId}`);
        } catch {
            /* ignore */
        }
        eventSourceRef.current?.close();
        setIsProcessing(false);
        setIsMinimized(false);
        setStatusMsg("Cancelled");
        setProgress(0);
        clearTask();
    };

    /* ── Reset ── */
    const resetAll = () => {
        setAudioFile(null);
        setImageFile(null);
        setAudioFileId(null);
        setImageFileId(null);
        setAudioUploadProgress(0);
        setImageUploadProgress(0);
        setAudioUploading(false);
        setImageUploading(false);
        setAudioUploaded(false);
        setImageUploaded(false);
        setTitle("");
        setDescription("");
        setPrivacyStatus("private");
        setMadeForKids("no");
        setTags("");
        setCategoryId("10");
        setPublishWhenReady(false);
        setError(null);
        setYoutubeUrl(null);
        setProgress(0);
        setStatusMsg("");
        setIsProcessing(false);
        setIsMinimized(false);
        setTaskId(null);
        clearTask();
    };

    const bothUploaded = audioUploaded && imageUploaded;
    const isReady = bothUploaded && !!(session as any)?.googleAccessToken;

    /* ── Circular progress ring helper ── */
    const CircleProgress = ({ pct, size = 44, stroke = 3.5 }: { pct: number; size?: number; stroke?: number }) => {
        const r = (size - stroke) / 2;
        const c = 2 * Math.PI * r;
        const offset = c - (pct / 100) * c;
        return (
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-zinc-200 dark:text-zinc-800" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth={stroke}
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>
        );
    };

    /* ═══════════════════════════ RENDER ═══════════════════════════ */
    return (
        <>
            <div className="mx-auto max-w-4xl px-6 pb-16 pt-2 space-y-5 text-zinc-900 dark:text-zinc-100">

                {/* ── Header ── */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Upload to YouTube
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1.5 dark:text-zinc-400">
                        Select audio &amp; artwork — they upload instantly. Fill in details, then publish.
                    </p>
                </div>

                {!isProcessing && !youtubeUrl && (
                    <div className="flex flex-col gap-4 md:flex-row">
                        {/* STEP 1: FILE SELECTION */}
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-950 md:w-5/12 md:p-5">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 md:mb-4">
                                <CloudUpload className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                                Uploaded Files
                                {bothUploaded && (
                                    <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 sm:text-xs">
                                        <CheckCircle className="h-3.5 w-3.5" /> Ready
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                {/* Audio Dropzone */}
                                <div className="relative">
                                    <div
                                        {...audioDz.getRootProps()}
                                        className={`min-h-[120px] cursor-pointer rounded-xl border-2 border-dashed p-3 transition-all sm:min-h-[132px]
                                            ${audioDz.isDragActive
                                                ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10"
                                                : audioUploaded
                                                    ? "border-emerald-300 bg-emerald-50/30 dark:border-emerald-800/50 dark:bg-emerald-900/5"
                                                    : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700"
                                            }`}
                                    >
                                        <input {...audioDz.getInputProps()} />

                                        {audioFile ? (
                                            <div className="flex h-full flex-col justify-between gap-2">
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-0.5 rounded-md bg-emerald-50 p-1.5 dark:bg-emerald-900/20">
                                                        <FileAudio className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p title={audioFile.name} className="max-w-full truncate text-xs font-medium text-zinc-900 dark:text-zinc-100 sm:text-sm">
                                                            {audioFile.name}
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] text-zinc-400 sm:text-xs">{fmt(audioFile.size)}</p>
                                                    </div>
                                                </div>

                                                {audioUploading && (
                                                    <div>
                                                        <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                                            <div
                                                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 ease-out"
                                                                style={{ width: `${audioUploadProgress}%` }}
                                                            />
                                                        </div>
                                                        <p className="mt-1 text-[10px] text-zinc-400">{audioUploadProgress}% uploaded</p>
                                                    </div>
                                                )}
                                                {audioUploaded && (
                                                    <p className="text-[10px] font-medium text-emerald-500">Uploaded</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
                                                <Music className="h-6 w-6 text-zinc-300 dark:text-zinc-600 sm:h-7 sm:w-7" strokeWidth={1.2} />
                                                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:text-sm">Add audio</p>
                                                <p className="text-[10px] text-zinc-400 sm:text-[11px]">MP3/WAV/FLAC</p>
                                            </div>
                                        )}
                                    </div>
                                    {audioFile && !audioUploading && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setAudioFile(null); setAudioFileId(null); setAudioUploaded(false); setAudioUploadProgress(0); }}
                                            className="absolute right-2 top-2 rounded-full bg-zinc-100 p-1 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                        >
                                            <X className="h-3 w-3 text-zinc-500" />
                                        </button>
                                    )}
                                </div>

                                {/* Image Dropzone */}
                                <div className="relative">
                                    <div
                                        {...imageDz.getRootProps()}
                                        className={`min-h-[120px] cursor-pointer rounded-xl border-2 border-dashed p-3 transition-all sm:min-h-[132px]
                                            ${imageDz.isDragActive
                                                ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10"
                                                : imageUploaded
                                                    ? "border-emerald-300 bg-emerald-50/30 dark:border-emerald-800/50 dark:bg-emerald-900/5"
                                                    : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700"
                                            }`}
                                    >
                                        <input {...imageDz.getInputProps()} />

                                        {imageFile && imagePreviewUrl ? (
                                            <div className="flex h-full flex-col justify-between gap-2">
                                                <div className="flex items-start gap-2">
                                                    <img
                                                        src={imagePreviewUrl}
                                                        alt="cover"
                                                        className="h-16 w-16 rounded-lg object-cover shadow-sm sm:h-20 sm:w-20"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p title={imageFile.name} className="max-w-full truncate text-xs font-medium text-zinc-900 dark:text-zinc-100 sm:text-sm">
                                                            {imageFile.name}
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] text-zinc-400 sm:text-xs">{fmt(imageFile.size)}</p>
                                                    </div>
                                                </div>

                                                {imageUploading && (
                                                    <div>
                                                        <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                                            <div
                                                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 ease-out"
                                                                style={{ width: `${imageUploadProgress}%` }}
                                                            />
                                                        </div>
                                                        <p className="mt-1 text-[10px] text-zinc-400">{imageUploadProgress}% uploaded</p>
                                                    </div>
                                                )}
                                                {imageUploaded && (
                                                    <p className="text-[10px] font-medium text-emerald-500">Uploaded</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
                                                <ImageIcon className="h-6 w-6 text-zinc-300 dark:text-zinc-600 sm:h-7 sm:w-7" strokeWidth={1.2} />
                                                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:text-sm">Add artwork</p>
                                                <p className="text-[10px] text-zinc-400 sm:text-[11px]">JPG/PNG/WebP</p>
                                            </div>
                                        )}
                                    </div>
                                    {imageFile && !imageUploading && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setImageFile(null); setImageFileId(null); setImageUploaded(false); setImageUploadProgress(0); }}
                                            className="absolute right-2 top-2 rounded-full bg-zinc-100 p-1 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                        >
                                            <X className="h-3 w-3 text-zinc-500" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* STEP 2: VIDEO DETAILS */}
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-950 md:w-7/12 md:p-5">
                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                <AlignLeft className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                                Video Details
                            </div>

                            {!session ? (
                                <button
                                    onClick={() => signIn("google")}
                                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                                >
                                    <Youtube className="h-4 w-4" strokeWidth={1.5} />
                                    Sign in with YouTube
                                </button>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Title */}
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                            <Type className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                                            Title
                                        </label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-emerald-800"
                                            placeholder="Track name"
                                        />
                                    </div>

                                    {/* Visibility */}
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                            <Globe className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                                            Visibility
                                        </label>
                                        <select
                                            value={privacyStatus}
                                            onChange={(e) => setPrivacyStatus(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-emerald-800"
                                        >
                                            <option value="public">🌐 Public</option>
                                            <option value="unlisted">🔗 Unlisted</option>
                                            <option value="private">🔒 Private</option>
                                        </select>
                                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 pl-0.5">
                                            {privacyStatus === "public" && <><Globe className="w-3 h-3" /><span>Visible to everyone</span></>}
                                            {privacyStatus === "unlisted" && <><EyeOff className="w-3 h-3" /><span>Only people with the link</span></>}
                                            {privacyStatus === "private" && <><Lock className="w-3 h-3" /><span>Only you can view</span></>}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                            <AlignLeft className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                                            Description
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-emerald-800 resize-none"
                                            placeholder="Add details about your track..."
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                            <TagsIcon className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                                            Tags
                                        </label>
                                        <input
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-emerald-800"
                                            placeholder="music, lofi, chill, remix"
                                        />
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pl-0.5">Separate tags with commas</p>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                                            Category
                                        </label>
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-emerald-800"
                                        >
                                            <option value="10">🎵 Music</option>
                                            <option value="24">🎬 Entertainment</option>
                                            <option value="20">🎮 Gaming</option>
                                            <option value="27">📚 Education</option>
                                            <option value="22">📝 People &amp; Blogs</option>
                                            <option value="23">😂 Comedy</option>
                                            <option value="25">📰 News &amp; Politics</option>
                                            <option value="26">💡 Howto &amp; Style</option>
                                            <option value="28">🔬 Science &amp; Technology</option>
                                            <option value="1">🎞️ Film &amp; Animation</option>
                                            <option value="2">🚗 Autos &amp; Vehicles</option>
                                            <option value="15">🐾 Pets &amp; Animals</option>
                                            <option value="17">⚽ Sports</option>
                                            <option value="19">✈️ Travel &amp; Events</option>
                                            <option value="29">🤝 Nonprofits &amp; Activism</option>
                                        </select>
                                    </div>

                                    {/* Audience (COPPA) */}
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                            <Shield className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                                            Made for Kids? (COPPA)
                                        </label>
                                        <select
                                            value={madeForKids}
                                            onChange={(e) => setMadeForKids(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-emerald-800"
                                        >
                                            <option value="no">No, it&apos;s not made for kids</option>
                                            <option value="yes">Yes, it&apos;s made for kids</option>
                                        </select>
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pl-0.5 leading-relaxed">
                                            As per YouTube/COPPA compliance, select if content is directed at children under 13
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ PROCESSING PROGRESS (FULL VIEW) ═══════════════ */}
                {isProcessing && !isMinimized && (
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-300 animate-in fade-in">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <CircleProgress pct={progress} size={52} stroke={3} />
                                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        {progress < 70 ? "Generating Video" : progress < 99 ? "Uploading to YouTube" : "Finishing Up"}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{statusMsg}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsMinimized(true)}
                                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition font-medium rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    title="Minimize — processing continues in background"
                                >
                                    <Minimize2 className="w-3.5 h-3.5" />
                                    Minimize
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="text-xs text-zinc-400 hover:text-red-500 transition font-medium rounded-md px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/10"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${progress}%`,
                                    background: "linear-gradient(90deg, #22c55e 0%, #10b981 40%, #059669 100%)",
                                }}
                            />
                            {/* Shimmer effect */}
                            <div
                                className="absolute inset-0 rounded-full opacity-30"
                                style={{
                                    background: "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
                                    animation: "shimmer 2s infinite linear",
                                }}
                            />
                        </div>
                        <style jsx>{`
                            @keyframes shimmer {
                                0% { transform: translateX(-100%); }
                                100% { transform: translateX(100%); }
                            }
                        `}</style>

                        <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
                            You can minimize this and continue browsing — processing won&apos;t stop
                        </p>
                    </div>
                )}

                {/* ═══════════════ SUCCESS ═══════════════ */}
                {youtubeUrl && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-8 text-center space-y-4 dark:border-emerald-800/30 dark:bg-emerald-900/5 transition-all duration-200">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Video Published!</h2>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Your video is live on YouTube — original quality preserved.
                        </p>
                        <a
                            href={youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition shadow-sm"
                        >
                            <Youtube className="w-4 h-4" strokeWidth={1.5} />
                            Watch on YouTube
                        </a>
                        <div>
                            <button
                                onClick={resetAll}
                                className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium"
                            >
                                Upload another track
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════ ERROR ═══════════════ */}
                {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 sm:gap-3 sm:p-4 dark:border-red-800/30 dark:bg-red-900/10">
                        <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
                        <p className="flex-1 text-xs text-red-600 dark:text-red-400 sm:text-sm">{error}</p>
                        <button onClick={() => setError(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ═══════════════ PUBLISH BUTTON + CHECKBOX ═══════════════ */}
                {!isProcessing && !youtubeUrl && (
                    <div className="space-y-3">
                        <button
                            disabled={!isReady}
                            onClick={handlePublish}
                            className={`w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${isReady
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md active:scale-[0.99]"
                                : "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-900 dark:text-zinc-600"
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isReady ? (
                                    <>
                                        <Send className="w-4 h-4" strokeWidth={1.5} />
                                        Publish to YouTube
                                        <span className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight">
                                            ORIGINAL QUALITY
                                        </span>
                                    </>
                                ) : !session ? (
                                    "Sign in with YouTube to continue"
                                ) : !bothUploaded ? (
                                    <>
                                        <Loader2 className={`w-4 h-4 ${(audioUploading || imageUploading) ? "animate-spin" : ""}`} strokeWidth={1.5} />
                                        {audioUploading || imageUploading
                                            ? "Uploading files…"
                                            : "Select audio & image to continue"}
                                    </>
                                ) : (
                                    "Publish to YouTube"
                                )}
                            </span>
                        </button>

                        {/* Publish when ready checkbox */}
                        <label className="flex items-center gap-2 cursor-pointer group pl-1">
                            <input
                                type="checkbox"
                                checked={publishWhenReady}
                                onChange={(e) => setPublishWhenReady(e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-emerald-600 cursor-pointer"
                            />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition select-none">
                                Publish automatically when uploads are complete
                            </span>
                        </label>
                    </div>
                )}
            </div>

            {/* ═══════════════ MINIMIZED FLOATING TOAST ═══════════════ */}
            {isProcessing && isMinimized && (
                <div
                    className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
                    style={{ maxWidth: "340px" }}
                >
                    <div className="rounded-2xl border border-zinc-200 bg-white/95 backdrop-blur-xl shadow-2xl shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900/95 dark:shadow-black/30 overflow-hidden">
                        {/* Mini progress bar at top */}
                        <div className="h-1 bg-zinc-100 dark:bg-zinc-800">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${progress}%`,
                                    background: "linear-gradient(90deg, #22c55e, #059669)",
                                }}
                            />
                        </div>

                        <div className="px-4 py-3 flex items-center gap-3">
                            {/* Mini circle progress */}
                            <div className="relative shrink-0">
                                <CircleProgress pct={progress} size={36} stroke={2.5} />
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-zinc-700 dark:text-zinc-300">
                                    {Math.round(progress)}%
                                </span>
                            </div>

                            {/* Status text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                    {progress < 70 ? "Generating Video…" : progress < 99 ? "Uploading to YouTube…" : "Finishing…"}
                                </p>
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{statusMsg}</p>
                            </div>

                            {/* Expand button */}
                            <button
                                onClick={() => setIsMinimized(false)}
                                className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition"
                                title="Expand"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
