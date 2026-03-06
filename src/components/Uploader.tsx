"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useSession } from "next-auth/react";
import DeadlineProgress from "./DeadlineProgress";
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
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

const fmt = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const STEPS = [
    { label: "Uploading to Server", icon: CloudUpload },
    { label: "AI Processing (Spleeter)", icon: Loader2 },
    { label: "Generating Video (FFmpeg)", icon: Upload },
    { label: "Publishing to YouTube", icon: Youtube },
    { label: "Complete", icon: CheckCircle },
];

export default function Uploader() {
    const { data: session } = useSession();

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [privacyStatus, setPrivacyStatus] = useState("private");
    const [madeForKids, setMadeForKids] = useState("no");
    const [tags, setTags] = useState("");
    const [categoryId, setCategoryId] = useState("10");

    const [isProcessing, setIsProcessing] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [visualProgress, setVisualProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState("");
    const [activeStep, setActiveStep] = useState(0);
    const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        return () => { eventSourceRef.current?.close(); };
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
            interval = setInterval(() => {
                setVisualProgress(prev => {
                    if (prev >= 100) return 100;
                    const diff = progress - prev;
                    const step = diff > 0 ? Math.max(diff * 0.1, 0.1) : 0.02;
                    const next = prev + step;
                    return next > 99.9 && progress < 100 ? 99.9 : next;
                });
            }, 100);
        } else {
            setVisualProgress(progress);
        }
        return () => clearInterval(interval);
    }, [isProcessing, progress]);

    const resetState = useCallback(() => {
        setAudioFile(null);
        setImageFile(null);
        setTitle("");
        setDescription("");
        setPrivacyStatus("private");
        setMadeForKids("no");
        setTags("");
        setCategoryId("10");
        setError(null);
        setYoutubeUrl(null);
        setProgress(0);
        setVisualProgress(0);
        setActiveStep(0);
        setStatusMsg("");
        setIsMinimized(false);
        setIsProcessing(false);
    }, []);

    const combinedDrop = useDropzone({
        maxSize: MAX_SIZE,
        accept: {
            "audio/*": [".mp3", ".wav"],
            "image/*": [".jpg", ".jpeg", ".png"]
        },
        onDrop: (files) => {
            setError(null);
            setYoutubeUrl(null);
            setProgress(0);
            setVisualProgress(0);
            setActiveStep(0);
            setStatusMsg("");
            setIsMinimized(false);

            files.forEach(file => {
                if (file.type.startsWith("audio/")) setAudioFile(file);
                else if (file.type.startsWith("image/")) setImageFile(file);
            });
        }
    });

    const listenSSE = useCallback((id: string) => {
        eventSourceRef.current?.close();
        const es = new EventSource(`${API_BASE}/progress/${id}`);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setProgress(data.progress ?? 0);
                setStatusMsg(data.message ?? "Processing…");
                setActiveStep(Math.max(0, (data.step ?? 1) - 1));
                if (data.youtube_url) setYoutubeUrl(data.youtube_url);
                if (data.progress >= 100) {
                    setIsProcessing(false);
                    es.close();
                    if (!data.youtube_url) {
                        setError(data.message?.startsWith("Error:") ? data.message : "Upload failed. Check backend logs.");
                    }
                }
            } catch { /* ignore */ }
        };
        es.onerror = () => {
            es.close();
            setIsProcessing(false);
            setError("Connection lost. Please try again.");
        };
    }, []);

    const handleSubmit = async () => {
        if (!audioFile || !imageFile) return;
        if (!(session as any)?.accessToken) {
            setError("Please login with YouTube first.");
            return;
        }

        setIsProcessing(true);
        setIsMinimized(false);
        setError(null);
        setYoutubeUrl(null);
        setProgress(1);
        setVisualProgress(0);
        setActiveStep(0);
        setStatusMsg(STEPS[0].label);

        const form = new FormData();
        form.append("audio_file", audioFile);
        form.append("image_file", imageFile);
        form.append("title", title || audioFile.name.replace(/\.[^/.]+$/, ""));
        form.append("description", description);
        form.append("privacy_status", privacyStatus);
        form.append("made_for_kids", madeForKids);
        form.append("tags", tags);
        form.append("category_id", categoryId);
        form.append("youtube_access_token", (session as any).accessToken ?? "");
        form.append("youtube_refresh_token", (session as any).refreshToken ?? "");

        try {
            const res = await axios.post(`${API_BASE}/upload_and_publish`, form, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const uploadPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        const displayPercent = Math.min(Math.round(uploadPercent * 0.25), 24);
                        setProgress(displayPercent);
                        setStatusMsg(`Uploading files: ${uploadPercent}%`);
                    }
                }
            });
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
    };

    const handleCancel = async () => {
        if (!taskId) return;
        try { await axios.post(`${API_BASE}/cancel/${taskId}`); } catch { /* ignore */ }
        eventSourceRef.current?.close();
        setIsProcessing(false);
        setStatusMsg("Cancelled");
        setProgress(0);
    };

    const isReady = !!audioFile && !!imageFile && !!(session as any)?.accessToken;

    return (
        <div className="mx-auto max-w-4xl px-6 pb-16 pt-6 space-y-6 text-zinc-900 dark:text-zinc-100">
            <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Upload to YouTube</h1>
                <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400">
                    Upload audio and artwork, set your video details, and publish to your channel.
                </p>
            </div>

            {!isProcessing && !youtubeUrl && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4 dark:border-zinc-800 dark:bg-zinc-950 card-feature transition-all duration-200">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        <CloudUpload className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                        Upload files
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div
                            {...combinedDrop.getRootProps()}
                            className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500 hover:bg-zinc-50 transition cursor-pointer dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
                        >
                            <input {...combinedDrop.getInputProps()} />
                            <div className="flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-200">
                                <Music className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                                <p className="font-medium">Drop audio or click to browse</p>
                            </div>
                            <p className="text-xs text-zinc-400 mt-2 dark:text-zinc-500">MP3/WAV up to 50MB</p>
                            {audioFile && (
                                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">Selected: {audioFile.name} ({fmt(audioFile.size)})</p>
                            )}
                        </div>
                        <div
                            {...combinedDrop.getRootProps()}
                            className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500 hover:bg-zinc-50 transition cursor-pointer dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
                        >
                            <input {...combinedDrop.getInputProps()} />
                            <div className="flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-200">
                                <ImageIcon className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                                <p className="font-medium">Drop artwork or click to browse</p>
                            </div>
                            <p className="text-xs text-zinc-400 mt-2 dark:text-zinc-500">JPG/PNG up to 50MB</p>
                            {imageFile && (
                                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">Selected: {imageFile.name} ({fmt(imageFile.size)})</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!isProcessing && !youtubeUrl && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4 dark:border-zinc-800 dark:bg-zinc-950 card-elevated transition-all duration-200">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        <AlignLeft className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                        Video details
                    </div>
                    {!session ? (
                        <button
                            onClick={() => { window.location.href = "/api/auth/signin"; }}
                            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                        >
                            <Youtube className="w-4 h-4 text-white" strokeWidth={1.5} />
                            Sign in with YouTube
                        </button>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    <Type className="w-3.5 h-3.5 text-green-500" strokeWidth={1.5} />
                                    Title
                                </label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 input-elevated"
                                    placeholder="Track name"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    <Globe className="w-3.5 h-3.5 text-green-500" strokeWidth={1.5} />
                                    Visibility
                                </label>
                                <select
                                    value={privacyStatus}
                                    onChange={(e) => setPrivacyStatus(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                                >
                                    <option value="public">Public</option>
                                    <option value="unlisted">Unlisted</option>
                                    <option value="private">Private</option>
                                </select>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                                    {privacyStatus === "public" && <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />}
                                    {privacyStatus === "unlisted" && <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />}
                                    {privacyStatus === "private" && <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />}
                                    <span>
                                        {privacyStatus === "public" && "Visible to everyone"}
                                        {privacyStatus === "unlisted" && "Only people with the link"}
                                        {privacyStatus === "private" && "Only you can view"}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    <Lock className="w-3.5 h-3.5 text-green-500" strokeWidth={1.5} />
                                    Audience (COPPA)
                                </label>
                                <select
                                    value={madeForKids}
                                    onChange={(e) => setMadeForKids(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                                >
                                    <option value="no">No, it’s not made for kids</option>
                                    <option value="yes">Yes, it’s made for kids</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    <AlignLeft className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                                    Category
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                                >
                                    <option value="10">Music</option>
                                    <option value="24">Entertainment</option>
                                    <option value="20">Gaming</option>
                                    <option value="27">Education</option>
                                    <option value="22">People & Blogs</option>
                                    <option value="23">Comedy</option>
                                    <option value="28">Science & Technology</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    <TagsIcon className="w-3.5 h-3.5 text-green-500" strokeWidth={1.5} />
                                    Tags
                                </label>
                                <input
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                                    placeholder="music, lofi, chill"
                                />
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Separate tags with commas.</p>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    <AlignLeft className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                                    placeholder="Add details about your track..."
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isProcessing && !youtubeUrl && (
                <button
                    disabled={!isReady}
                    onClick={handleSubmit}
                    className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${isReady
                            ? "bg-emerald-800 text-white hover:bg-emerald-700 btn-depth"
                            : "bg-emerald-800/70 text-white/70 cursor-not-allowed"
                        }`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" strokeWidth={1.5} />
                        {isReady ? "Generate & Publish" : "Upload"}
                    </span>
                </button>
            )}

            {isProcessing && !isMinimized && (
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4 dark:border-zinc-800 dark:bg-zinc-950 card-elevated transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Processing</p>
                        <button onClick={handleCancel} className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">Cancel</button>
                    </div>
                    <DeadlineProgress progress={visualProgress} statusMsg={statusMsg} />
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                        Minimize
                    </button>
                </div>
            )}

            {isProcessing && isMinimized && (
                <div
                    onClick={() => setIsMinimized(false)}
                    className="fixed bottom-6 right-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-md cursor-pointer dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-dark-feature"
                >
                    <p className="text-xs font-semibold text-zinc-900 flex items-center gap-2 dark:text-zinc-100">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                        Processing…
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">{Math.round(visualProgress)}%</p>
                </div>
            )}

            {youtubeUrl && (
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm text-center space-y-3 dark:border-zinc-800 dark:bg-zinc-950 card-feature transition-all duration-200">
                    <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={1.5} />
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Video published</h2>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Your video is live on YouTube.</p>
                    <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white btn-depth"
                    >
                        <Youtube className="w-4 h-4" strokeWidth={1.5} />
                        Watch on YouTube
                    </a>
                    <button onClick={resetState} className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                        Upload another
                    </button>
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}
        </div>
    );
}

