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
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

const fmt = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

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

    const eventSourceRef = useRef<EventSource | null>(null);

    // Image preview URL
    const imagePreviewUrl = useMemo(
        () => (imageFile ? URL.createObjectURL(imageFile) : null),
        [imageFile]
    );

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
            eventSourceRef.current?.close();
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
            es.close();
            setIsProcessing(false);
            setError("Connection lost. Please try again.");
        };
    }, []);

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
            // Upload immediately
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
            // Upload immediately
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
        setStatusMsg("Cancelled");
        setProgress(0);
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
        setTaskId(null);
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
        <div className="mx-auto max-w-4xl px-6 pb-16 pt-2 space-y-5 text-zinc-900 dark:text-zinc-100">

            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Upload to YouTube
                </h1>
                <p className="text-sm text-zinc-500 mt-1.5 dark:text-zinc-400">
                    Select audio & artwork — they upload instantly. Fill in details, then publish.
                </p>
            </div>

            {/* ═══════════════ STEP 1: FILE SELECTION ═══════════════ */}
            {!isProcessing && !youtubeUrl && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-200">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                        <CloudUpload className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
                        Upload Files
                        {bothUploaded && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" /> All files ready
                            </span>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* ── Audio Dropzone ── */}
                        <div className="relative">
                            <div
                                {...audioDz.getRootProps()}
                                className={`rounded-xl border-2 border-dashed p-5 text-center transition-all cursor-pointer
                                    ${audioDz.isDragActive
                                        ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10"
                                        : audioUploaded
                                            ? "border-emerald-300 bg-emerald-50/30 dark:border-emerald-800/50 dark:bg-emerald-900/5"
                                            : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700"
                                    }`}
                            >
                                <input {...audioDz.getInputProps()} />

                                {audioFile ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <FileAudio className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
                                            {audioUploaded && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate px-2">{audioFile.name}</p>
                                        <p className="text-xs text-zinc-400">{fmt(audioFile.size)}</p>

                                        {/* Upload progress */}
                                        {audioUploading && (
                                            <div className="mt-2">
                                                <div className="relative h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300 ease-out"
                                                        style={{ width: `${audioUploadProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-zinc-400 mt-1">{audioUploadProgress}% uploaded</p>
                                            </div>
                                        )}
                                        {audioUploaded && (
                                            <p className="text-[10px] text-emerald-500 font-medium">✓ Uploaded to server</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2 py-2">
                                        <Music className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" strokeWidth={1.2} />
                                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Drop audio file</p>
                                        <p className="text-[11px] text-zinc-400">MP3, WAV, FLAC · max 50MB</p>
                                    </div>
                                )}
                            </div>
                            {audioFile && !audioUploading && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setAudioFile(null); setAudioFileId(null); setAudioUploaded(false); setAudioUploadProgress(0); }}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
                                >
                                    <X className="w-3 h-3 text-zinc-500" />
                                </button>
                            )}
                        </div>

                        {/* ── Image Dropzone ── */}
                        <div className="relative">
                            <div
                                {...imageDz.getRootProps()}
                                className={`rounded-xl border-2 border-dashed p-5 text-center transition-all cursor-pointer
                                    ${imageDz.isDragActive
                                        ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10"
                                        : imageUploaded
                                            ? "border-emerald-300 bg-emerald-50/30 dark:border-emerald-800/50 dark:bg-emerald-900/5"
                                            : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700"
                                    }`}
                            >
                                <input {...imageDz.getInputProps()} />

                                {imageFile && imagePreviewUrl ? (
                                    <div className="space-y-2">
                                        <img
                                            src={imagePreviewUrl}
                                            alt="cover"
                                            className="w-16 h-16 mx-auto rounded-lg object-cover shadow-sm"
                                        />
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate px-2">{imageFile.name}</p>
                                        <p className="text-xs text-zinc-400">{fmt(imageFile.size)}</p>

                                        {imageUploading && (
                                            <div className="mt-2">
                                                <div className="relative h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300 ease-out"
                                                        style={{ width: `${imageUploadProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-zinc-400 mt-1">{imageUploadProgress}% uploaded</p>
                                            </div>
                                        )}
                                        {imageUploaded && (
                                            <p className="text-[10px] text-emerald-500 font-medium">✓ Uploaded to server</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2 py-2">
                                        <ImageIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" strokeWidth={1.2} />
                                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Drop artwork</p>
                                        <p className="text-[11px] text-zinc-400">JPG, PNG, WebP · max 50MB</p>
                                    </div>
                                )}
                            </div>
                            {imageFile && !imageUploading && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImageFileId(null); setImageUploaded(false); setImageUploadProgress(0); }}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
                                >
                                    <X className="w-3 h-3 text-zinc-500" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ STEP 2: VIDEO DETAILS ═══════════════ */}
            {!isProcessing && !youtubeUrl && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-200">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                        <AlignLeft className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
                        Video Details
                    </div>

                    {!session ? (
                        <button
                            onClick={() => signIn("google")}
                            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                        >
                            <Youtube className="w-4 h-4" strokeWidth={1.5} />
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
                                    <option value="24">🎭 Entertainment</option>
                                    <option value="20">🎮 Gaming</option>
                                    <option value="27">📚 Education</option>
                                    <option value="22">📝 People & Blogs</option>
                                    <option value="23">😂 Comedy</option>
                                    <option value="25">📰 News & Politics</option>
                                    <option value="26">🎨 Howto & Style</option>
                                    <option value="28">🔬 Science & Technology</option>
                                    <option value="1">🎬 Film & Animation</option>
                                    <option value="2">🚗 Autos & Vehicles</option>
                                    <option value="15">🐾 Pets & Animals</option>
                                    <option value="17">⚽ Sports</option>
                                    <option value="19">✈️ Travel & Events</option>
                                    <option value="29">🏛️ Nonprofits & Activism</option>
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
            )}

            {/* ═══════════════ PROCESSING PROGRESS ═══════════════ */}
            {isProcessing && (
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-200">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <CircleProgress pct={progress} size={48} stroke={3} />
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {progress < 70 ? "Generating Video" : progress < 99 ? "Uploading to YouTube" : "Finishing Up"}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{statusMsg}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="text-xs text-zinc-400 hover:text-red-500 transition font-medium"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Modern progress bar */}
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
                            className="absolute inset-y-0 left-0 rounded-full animate-pulse opacity-40"
                            style={{
                                width: `${progress}%`,
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                            }}
                        />
                    </div>

                    {/* Steps timeline */}
                    <div className="mt-4 flex items-center gap-1">
                        {["Preparing", "Rendering HD", "Uploading", "Done"].map((label, i) => {
                            const stepProgress = [0, 10, 70, 100];
                            const isActive = progress >= stepProgress[i] && progress < (stepProgress[i + 1] ?? 101);
                            const isDone = progress >= (stepProgress[i + 1] ?? 100);
                            return (
                                <div key={i} className="flex-1 text-center">
                                    <div
                                        className={`h-1 rounded-full mb-1.5 transition-all duration-300 ${isDone
                                            ? "bg-emerald-500"
                                            : isActive
                                                ? "bg-emerald-400/60"
                                                : "bg-zinc-200 dark:bg-zinc-800"
                                            }`}
                                    />
                                    <p className={`text-[9px] font-medium transition-colors ${isDone
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : isActive
                                            ? "text-zinc-700 dark:text-zinc-300"
                                            : "text-zinc-400 dark:text-zinc-600"
                                        }`}>
                                        {label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
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
                        Your 1080p HD video is live on YouTube.
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
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 dark:border-red-800/30 dark:bg-red-900/10">
                    <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
                    <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
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
                                        1080P HD
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
    );
}
