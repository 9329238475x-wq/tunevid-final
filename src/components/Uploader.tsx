"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import {
    AlertCircle,
    AlignLeft,
    CheckCircle,
    CloudUpload,
    EyeOff,
    Globe,
    Loader2,
    Lock,
    Tags as TagsIcon,
    Type,
    Upload,
    Youtube,
    X,
    Sparkles,
    Shield,
    Send,
    Minimize2,
    Maximize2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from "lucide-react";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";
const API_BASE = RAW_API_BASE.replace(/\/$/, "");
const LEGACY_API_BASE = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

const fmt = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/* â”€â”€â”€ localStorage helpers for persistent task tracking â”€â”€â”€ */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function Uploader() {
    const { data: session } = useSession();

    // â”€â”€ File state â”€â”€
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

    // â”€â”€ Metadata state â”€â”€
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [privacyStatus, setPrivacyStatus] = useState("private");
    const [madeForKids, setMadeForKids] = useState("no");
    const [tags, setTags] = useState("");
    const [categoryId, setCategoryId] = useState("10");
    const [publishWhenReady, setPublishWhenReady] = useState(false);

    // â”€â”€ Processing state â”€â”€
    const [isProcessing, setIsProcessing] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // â”€â”€ Minimizable UI state â”€â”€
    const [isMinimized, setIsMinimized] = useState(false);

    const eventSourceRef = useRef<EventSource | null>(null);
    const unifiedUploadInputRef = useRef<HTMLInputElement | null>(null);


    /* â”€â”€ SSE progress listener â”€â”€ */
    const listenSSE = useCallback((id: string) => {
        eventSourceRef.current?.close();
        const es = new EventSource(`${API_BASE}/progress/${id}`);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setProgress(data.progress ?? 0);
                setStatusMsg(data.message ?? "Processingâ€¦");
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

    /* â”€â”€ Restore active task on mount (page refresh persistence) â”€â”€ */
    useEffect(() => {
        const savedTask = loadTask();
        if (savedTask) {
            setTaskId(savedTask);
            setIsProcessing(true);
            setStatusMsg("Reconnectingâ€¦");
            setProgress(0);
            listenSSE(savedTask);
        }
        return () => {
            eventSourceRef.current?.close();
        };
    }, [listenSSE]);

    /* â”€â”€ Publish (no file upload, uses pre-uploaded file IDs) â”€â”€ */
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
        setStatusMsg("Starting video generationâ€¦");

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
            const status = axios.isAxiosError(err) ? err.response?.status : undefined;

            // Fallback for older backends that only expose /upload_and_publish.
            if (status === 404 && audioFile && imageFile) {
                try {
                    const legacyForm = new FormData();
                    legacyForm.append("audio_file", audioFile);
                    legacyForm.append("image_file", imageFile);
                    legacyForm.append("title", title || audioFile?.name?.replace(/\.[^/.]+$/, "") || "Untitled");
                    legacyForm.append("description", description);
                    legacyForm.append("privacy_status", privacyStatus);
                    legacyForm.append("made_for_kids", madeForKids);
                    legacyForm.append("tags", tags);
                    legacyForm.append("category_id", categoryId);
                    legacyForm.append("youtube_access_token", (session as any).googleAccessToken ?? "");
                    legacyForm.append("youtube_refresh_token", (session as any).refreshToken ?? "");

                    const legacyRes = await axios.post(`${LEGACY_API_BASE}/upload_and_publish`, legacyForm);
                    const id = legacyRes.data.task_id;
                    setTaskId(id);
                    saveTask(id);
                    listenSSE(id);
                    return;
                } catch (legacyErr) {
                    setIsProcessing(false);
                    if (axios.isAxiosError(legacyErr)) {
                        setError(legacyErr.response?.data?.detail ?? legacyErr.message);
                    } else {
                        setError("Something went wrong. Please try again.");
                    }
                    return;
                }
            }

            setIsProcessing(false);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.detail ?? err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    }, [audioFileId, imageFileId, session, title, description, privacyStatus, madeForKids, tags, categoryId, audioFile, imageFile, listenSSE]);

    // Auto-publish when both files are uploaded and checkbox is checked
    useEffect(() => {
        if (audioUploaded && imageUploaded && publishWhenReady && !isProcessing && !youtubeUrl) {
            handlePublish();
        }
    }, [audioUploaded, imageUploaded, publishWhenReady, isProcessing, youtubeUrl, handlePublish]);

    /* â”€â”€ Upload a single file to server immediately â”€â”€ */
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

    /* â”€â”€ Dropzones (separate for audio and image) â”€â”€ */
    const handleUnifiedUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selected = Array.from(files);
    const audioCandidate = selected.find((f) =>
        f.size <= MAX_SIZE && (f.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|ogg)$/i.test(f.name))
    );
    const imageCandidate = selected.find((f) =>
        f.size <= MAX_SIZE && (f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(f.name))
    );

    if (audioCandidate) {
        setAudioFile(audioCandidate);
        setAudioFileId(null);
        setAudioUploaded(false);
        setAudioUploadProgress(0);
        setError(null);
        setYoutubeUrl(null);
        uploadFileToServer(audioCandidate, "audio");
    }
    if (imageCandidate) {
        setImageFile(imageCandidate);
        setImageFileId(null);
        setImageUploaded(false);
        setImageUploadProgress(0);
        setError(null);
        setYoutubeUrl(null);
        uploadFileToServer(imageCandidate, "image");
    }
    if (!audioCandidate && !imageCandidate) {
        setError("Please select at least one valid audio or image file (max 50 MB).");
    }
}, [uploadFileToServer]);


    /* â”€â”€ Cancel â”€â”€ */
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

    /* â”€â”€ Reset â”€â”€ */
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

    /* â”€â”€ Circular progress ring helper â”€â”€ */
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

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• RENDER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
    return (
        <>
            <div className="mx-auto max-w-4xl px-6 pb-16 pt-2 space-y-5 text-zinc-900 dark:text-zinc-100">

                {/* â”€â”€ Header â”€â”€ */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Upload to YouTube
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1.5 dark:text-zinc-400">
                        Select audio &amp; artwork â€” they upload instantly. Fill in details, then publish.
                    </p>
                </div>

                {!isProcessing && !youtubeUrl && (
                    <>
                        <input
                            ref={unifiedUploadInputRef}
                            type="file"
                            accept=".mp3,.wav,.flac,.m4a,.ogg,.jpg,.jpeg,.png,.webp,audio/*,image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                handleUnifiedUpload(e.target.files);
                                e.currentTarget.value = "";
                            }}
                        />

                        {/* Mobile-first Upload Files card */}
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                <CloudUpload className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                                Uploaded Files
                                {bothUploaded && (
                                    <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle className="h-3.5 w-3.5" /> Ready
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => unifiedUploadInputRef.current?.click()}
                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    <Upload className="h-4 w-4" strokeWidth={1.8} />
                                    Upload files
                                </button>

                                <div className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm ${audioUploaded ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-900/15 dark:text-rose-300"}`}>
                                    <div className="flex min-w-0 items-center gap-2">
                                        {audioUploaded ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                        <span className="truncate">{audioUploaded ? (audioFile?.name || "Audio uploaded") : "Audio not uploaded"}</span>
                                    </div>
                                    <div className="ml-2 flex items-center gap-2">
                                        {audioUploading && <span className="text-xs">{audioUploadProgress}%</span>}
                                        {audioFile && !audioUploading && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAudioFile(null);
                                                    setAudioFileId(null);
                                                    setAudioUploaded(false);
                                                    setAudioUploadProgress(0);
                                                }}
                                                className="rounded p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
                                                aria-label="Remove audio"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm ${imageUploaded ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-900/15 dark:text-rose-300"}`}>
                                    <div className="flex min-w-0 items-center gap-2">
                                        {imageUploaded ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                        <span className="truncate">{imageUploaded ? (imageFile?.name || "Image uploaded") : "Image not uploaded"}</span>
                                    </div>
                                    <div className="ml-2 flex items-center gap-2">
                                        {imageUploading && <span className="text-xs">{imageUploadProgress}%</span>}
                                        {imageFile && !imageUploading && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImageFileId(null);
                                                    setImageUploaded(false);
                                                    setImageUploadProgress(0);
                                                }}
                                                className="rounded p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
                                                aria-label="Remove image"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row">
                            {/* STEP 1: FILE SELECTION (desktop) */}
                            <div className="hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-950 md:block md:w-5/12 md:p-5">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 md:mb-4">
                                    <CloudUpload className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                                    Uploaded Files
                                    {bothUploaded && (
                                        <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 sm:text-xs">
                                            <CheckCircle className="h-3.5 w-3.5" /> Ready
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => unifiedUploadInputRef.current?.click()}
                                        className="mx-auto flex items-center gap-1.5 rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                    >
                                        <Upload className="h-4 w-4" strokeWidth={1.8} />
                                        Upload files
                                    </button>

                                    <div className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm ${audioUploaded ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-900/15 dark:text-rose-300"}`}>
                                        <div className="flex min-w-0 items-center gap-2">
                                            {audioUploaded ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                            <span className="truncate">{audioUploaded ? (audioFile?.name || "Audio uploaded") : "Audio not uploaded"}</span>
                                        </div>
                                        <div className="ml-2 flex items-center gap-2">
                                            {audioUploading && <span className="text-xs">{audioUploadProgress}%</span>}
                                            {audioFile && !audioUploading && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAudioFile(null);
                                                        setAudioFileId(null);
                                                        setAudioUploaded(false);
                                                        setAudioUploadProgress(0);
                                                    }}
                                                    className="rounded p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
                                                    aria-label="Remove audio"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm ${imageUploaded ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-900/15 dark:text-rose-300"}`}>
                                        <div className="flex min-w-0 items-center gap-2">
                                            {imageUploaded ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                            <span className="truncate">{imageUploaded ? (imageFile?.name || "Image uploaded") : "Image not uploaded"}</span>
                                        </div>
                                        <div className="ml-2 flex items-center gap-2">
                                            {imageUploading && <span className="text-xs">{imageUploadProgress}%</span>}
                                            {imageFile && !imageUploading && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImageFile(null);
                                                        setImageFileId(null);
                                                        setImageUploaded(false);
                                                        setImageUploadProgress(0);
                                                    }}
                                                    className="rounded p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
                                                    aria-label="Remove image"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
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
                                            <option value="public">ðŸŒ Public</option>
                                            <option value="unlisted">ðŸ”— Unlisted</option>
                                            <option value="private">ðŸ”’ Private</option>
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
                                            <option value="10">ðŸŽµ Music</option>
                                            <option value="24">ðŸŽ¬ Entertainment</option>
                                            <option value="20">ðŸŽ® Gaming</option>
                                            <option value="27">ðŸ“š Education</option>
                                            <option value="22">ðŸ“ People &amp; Blogs</option>
                                            <option value="23">ðŸ˜‚ Comedy</option>
                                            <option value="25">ðŸ“° News &amp; Politics</option>
                                            <option value="26">ðŸ’¡ Howto &amp; Style</option>
                                            <option value="28">ðŸ”¬ Science &amp; Technology</option>
                                            <option value="1">ðŸŽžï¸ Film &amp; Animation</option>
                                            <option value="2">ðŸš— Autos &amp; Vehicles</option>
                                            <option value="15">ðŸ¾ Pets &amp; Animals</option>
                                            <option value="17">âš½ Sports</option>
                                            <option value="19">âœˆï¸ Travel &amp; Events</option>
                                            <option value="29">ðŸ¤ Nonprofits &amp; Activism</option>
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

                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• PROCESSING PROGRESS (FULL VIEW) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
                                    title="Minimize â€” processing continues in background"
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
                            You can minimize this and continue browsing â€” processing won&apos;t stop
                        </p>
                    </div>
                )}

                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• SUCCESS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                {youtubeUrl && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-8 text-center space-y-4 dark:border-emerald-800/30 dark:bg-emerald-900/5 transition-all duration-200">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Video Published!</h2>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Your video is live on YouTube â€” original quality preserved.
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

                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• ERROR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                {error && (
                    <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-2.5 sm:p-4 dark:border-red-800/30 dark:bg-red-900/10">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <span className="text-red-500 mt-0.5 shrink-0">âš ï¸</span>
                            <p className="flex-1 text-xs text-red-600 dark:text-red-400 sm:text-sm">{error}</p>
                            <button onClick={() => setError(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {error.toLowerCase().includes("youtube permission") ||
                        error.toLowerCase().includes("insufficient") ? (
                            <button
                                onClick={() =>
                                    signIn(
                                        "google",
                                        { callbackUrl: "/create" },
                                        { prompt: "consent", access_type: "offline" }
                                    )
                                }
                                className="inline-flex w-fit items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                            >
                                <Youtube className="w-4 h-4" strokeWidth={1.5} />
                                Reconnect YouTube
                            </button>
                        ) : null}
                    </div>
                )}

                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• PUBLISH BUTTON + CHECKBOX â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
                                            ? "Uploading filesâ€¦"
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

            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MINIMIZED FLOATING TOAST â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
                                    {progress < 70 ? "Generating Videoâ€¦" : progress < 99 ? "Uploading to YouTubeâ€¦" : "Finishingâ€¦"}
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


