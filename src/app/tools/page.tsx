"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Headphones,
  Link as LinkIcon,
  Mic,
  MicOff,
  Minimize2,
  Scissors,
  ScissorsLineDashed,
  Search,
  Sparkles,
  UploadCloud,
  Wand2,
  Zap,
} from "lucide-react";
import { staggerContainer, cardVariants } from "@/utils/animations";

// ── Glow map ──
const GLOW_MAP: Record<string, string> = {
  "#3b82f6": "tool-glow-blue",
  "#22c55e": "tool-glow-green",
  "#6366f1": "tool-glow-indigo",
  "#a855f7": "tool-glow-purple",
  "#f97316": "tool-glow-orange",
  "#ef4444": "tool-glow-red",
  "#ec4899": "tool-glow-pink",
  "#06b6d4": "tool-glow-cyan",
  "#14b8a6": "tool-glow-teal",
  "#94a3b8": "tool-glow-slate",
  "#facc15": "tool-glow-yellow",
};

type Category = "All" | "AI" | "Editor" | "Effect" | "Utility";

const CATEGORIES: Category[] = ["All", "AI", "Editor", "Effect", "Utility"];

const TOOL_CARDS = [
  {
    title: "Vocal Remover",
    description: "Separate vocals, drums, bass, and instrumentals with studio-grade AI stem isolation.",
    href: "/tools/vocal-remover",
    icon: MicOff,
    accent: "#3b82f6",
    accentClass: "text-blue-400",
    buttonClass: "bg-blue-600 hover:bg-blue-500",
    category: "AI" as Category,
  },
  {
    title: "BPM & Key Finder",
    description: "Instantly detect tempo and musical key from any track. Perfect for DJs and producers.",
    href: "/tools/bpm-finder",
    icon: Activity,
    accent: "#22c55e",
    accentClass: "text-green-400",
    buttonClass: "bg-green-600 hover:bg-green-500",
    category: "AI" as Category,
  },
  {
    title: "Audio Cutter & Trimmer",
    description: "Precision waveform editor with visual selection. Maintenance upgrades in progress for the next release.",
    href: "/tools/audio-trimmer",
    icon: Scissors,
    accent: "#6366f1",
    accentClass: "text-indigo-400",
    buttonClass: "bg-indigo-600 hover:bg-indigo-500",
    category: "Editor" as Category,
    comingSoon: true,
  },
  {
    title: "Slowed + Reverb",
    description: "Generate dreamy lo-fi slowed + reverb edits with adjustable speed and room size.",
    href: "/tools/slowed-reverb",
    icon: Sparkles,
    accent: "#a855f7",
    accentClass: "text-purple-400",
    buttonClass: "bg-purple-600 hover:bg-purple-500",
    category: "Effect" as Category,
  },
  {
    title: "Audio Converter",
    description: "Convert audio or extract sound from video. Supports MP3, WAV, FLAC, M4A, and OGG.",
    href: "/tools/audio-converter",
    icon: Wand2,
    accent: "#f97316",
    accentClass: "text-orange-400",
    buttonClass: "bg-orange-600 hover:bg-orange-500",
    category: "Utility" as Category,
  },
  {
    title: "Bass Booster",
    description: "Pump deep bass, refine treble, and push volume with presets for car mixes and remixes.",
    href: "/tools/bass-booster",
    icon: Zap,
    accent: "#ef4444",
    accentClass: "text-red-400",
    buttonClass: "bg-red-600 hover:bg-red-500",
    category: "Effect" as Category,
  },
  {
    title: "8D Audio Converter",
    description: "Create immersive 360° spatial audio rotation. Best experienced with headphones.",
    href: "/tools/8d-audio",
    icon: Headphones,
    accent: "#ec4899",
    accentClass: "text-pink-400",
    buttonClass: "bg-pink-600 hover:bg-pink-500",
    category: "Effect" as Category,
  },
  {
    title: "Audio Joiner & Merger",
    description: "Combine multiple tracks into one seamless file with optional crossfade transitions.",
    href: "/tools/audio-merger",
    icon: LinkIcon,
    accent: "#06b6d4",
    accentClass: "text-cyan-400",
    buttonClass: "bg-cyan-600 hover:bg-cyan-500",
    category: "Editor" as Category,
  },
  {
    title: "Audio Compressor",
    description: "Reduce file size for WhatsApp, email, or fast uploads while keeping great quality.",
    href: "/tools/audio-compressor",
    icon: Minimize2,
    accent: "#14b8a6",
    accentClass: "text-teal-400",
    buttonClass: "bg-teal-600 hover:bg-teal-500",
    category: "Utility" as Category,
  },
  {
    title: "AI Noise Reducer",
    description: "Remove hiss, hum, and background noise from recordings with AI-style denoising.",
    href: "/tools/noise-reducer",
    icon: Mic,
    accent: "#94a3b8",
    accentClass: "text-slate-300",
    buttonClass: "bg-slate-600 hover:bg-slate-500",
    category: "AI" as Category,
  },
  {
    title: "Smart Silence Remover",
    description: "Auto-trim silent gaps in podcasts and recordings. Adjustable threshold and duration.",
    href: "/tools/silence-remover",
    icon: ScissorsLineDashed,
    accent: "#facc15",
    accentClass: "text-yellow-300",
    buttonClass: "bg-yellow-500 hover:bg-yellow-400",
    category: "Editor" as Category,
  },
];

export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredTools = useMemo(() => {
    return TOOL_CARDS.filter((tool) => {
      const matchesSearch =
        search === "" ||
        tool.title.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tools</p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          TuneVid Creative Suite
        </h1>
        <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400 max-w-2xl">
          13+ professional audio tools crafted for creators. Pick a tool and start producing in seconds.
        </p>
      </div>

      {/* Featured Hero Tool */}
      <Link
        href="/create"
        className="group relative block overflow-hidden rounded-2xl border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white shadow-lg dark:border-emerald-500/30 dark:bg-gradient-to-br dark:from-emerald-950/60 dark:via-zinc-950 dark:to-zinc-950"
      >
        {/* Featured badge */}
        <div className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400">
          <Sparkles className="h-3 w-3" strokeWidth={2} /> Featured
        </div>

        {/* Glow orb */}
        <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-emerald-500 blur-3xl opacity-0 transition duration-500 group-hover:opacity-20 dark:group-hover:opacity-30" />

        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent dark:via-emerald-500/30" />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-400">
              <UploadCloud className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">YouTube Video Uploader</h2>
              <p className="text-xs text-emerald-600/60 dark:text-emerald-300/60">Featured Workflow</p>
            </div>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Upload audio + artwork and publish a YouTube-ready bass-reactive visualizer video instantly.
            Secure OAuth publishing with full metadata control.
          </p>
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white transition group-hover:bg-emerald-500">
            Open Uploader
          </span>
        </div>
      </Link>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 input-elevated"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${activeCategory === cat
                ? "bg-emerald-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tool Cards Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-16 text-sm text-zinc-500 dark:text-zinc-400">
          No tools found matching &quot;{search}&quot;. Try a different search.
        </div>
      ) : (
        <motion.div
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filteredTools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ── ToolCard Component ──
type ToolCardProps = {
  title: string;
  description: string;
  href: string;
  icon: typeof UploadCloud;
  accent: string;
  accentClass: string;
  buttonClass: string;
  category: Category;
  comingSoon?: boolean;
};

function ToolCard({
  title,
  description,
  href,
  icon: Icon,
  accent,
  accentClass,
  buttonClass,
  category,
  comingSoon = false,
}: ToolCardProps) {
  const glowClass = GLOW_MAP[accent] || "tool-glow-blue";

  const CATEGORY_COLORS: Record<Category, string> = {
    All: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
    AI: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
    Editor: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    Effect: "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300",
    Utility: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
  };

  const cardClass = [
    "group relative overflow-hidden rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 flex flex-col h-full",
    comingSoon ? "opacity-85" : "hover:-translate-y-1.5",
    "border-zinc-200 bg-white shadow-sm",
    "dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:shadow-dark-elevated",
    glowClass,
  ].join(" ");

  const cardContent = (
    <>
        {/* Accent hover gradient */}
        <div
          className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at top right, ${accent}22, transparent 60%)` }}
        />

        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent dark:block hidden" />

        {/* Blurred accent orb */}
        <div
          className="absolute right-6 top-6 h-16 w-16 rounded-full blur-2xl opacity-0 transition duration-300 group-hover:opacity-50 dark:group-hover:opacity-70"
          style={{ backgroundColor: accent }}
        />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={[
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl border",
                  "border-zinc-200 bg-zinc-50",
                  "dark:border-zinc-800 dark:bg-zinc-900/80",
                  accentClass,
                ].join(" ")}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
                {/* Category tag */}
                <span className={`inline-block mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CATEGORY_COLORS[category]}`}>
                  {category}
                </span>
                {comingSoon && (
                  <span className="ml-2 inline-block mt-0.5 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-300 leading-relaxed line-clamp-2">{description}</p>

          <div>
            <span
              className={[
                "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-white transition",
                comingSoon ? "bg-zinc-500 dark:bg-zinc-700" : buttonClass,
                "dark:shadow-dark-button",
              ].join(" ")}
            >
              {comingSoon ? "Coming Soon" : "Open Tool"}
            </span>
          </div>
        </div>
    </>
  );

  return (
    <motion.div
      variants={cardVariants}
      className="h-full"
    >
      {comingSoon ? (
        <div className={cardClass}>{cardContent}</div>
      ) : (
        <Link href={href} className={cardClass}>
          {cardContent}
        </Link>
      )}
    </motion.div>
  );
}
