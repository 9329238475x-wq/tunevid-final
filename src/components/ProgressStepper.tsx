"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ComponentType } from "react";
import {
  UploadCloud,
  Sparkles,
  Film,
  Youtube,
  Loader2,
  CheckCircle,
} from "lucide-react";

type BackendStep =
  | "UPLOADING"
  | "UPLOAD"
  | "UPLOADING_FILES"
  | "AI_PROCESSING"
  | "AI_SEPARATING_AUDIO"
  | "VIDEO_GENERATION"
  | "GENERATING_VIDEO"
  | "YOUTUBE_PUBLISHING"
  | "PUBLISHING_TO_YOUTUBE"
  | "COMPLETE"
  | "COMPLETED"
  | "DONE"
  | string;

export interface ProgressStatus {
  step: BackendStep;
  progress?: number;
}

interface ProgressStepperProps {
  status: ProgressStatus;
  className?: string;
}

type VisualState = "pending" | "active" | "completed";

interface StepDef {
  id: "upload" | "ai" | "video" | "youtube";
  title: string;
  aliases: string[];
  Icon: ComponentType<{ className?: string }>;
}

const STEPS: StepDef[] = [
  {
    id: "upload",
    title: "Uploading Files",
    aliases: ["UPLOADING", "UPLOAD", "UPLOADING_FILES"],
    Icon: UploadCloud,
  },
  {
    id: "ai",
    title: "AI Separating Audio",
    aliases: ["AI_PROCESSING", "AI_SEPARATING_AUDIO"],
    Icon: Sparkles,
  },
  {
    id: "video",
    title: "Generating Video",
    aliases: ["VIDEO_GENERATION", "GENERATING_VIDEO"],
    Icon: Film,
  },
  {
    id: "youtube",
    title: "Publishing to YouTube",
    aliases: ["YOUTUBE_PUBLISHING", "PUBLISHING_TO_YOUTUBE"],
    Icon: Youtube,
  },
];

const TERMINAL_DONE = new Set(["COMPLETE", "COMPLETED", "DONE"]);

function clampPercent(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function getCurrentStepIndex(step: string): number {
  const normalized = step.toUpperCase();
  return STEPS.findIndex((s) => s.aliases.includes(normalized));
}

function getStepState(index: number, currentIndex: number, isDone: boolean): VisualState {
  if (isDone) return "completed";
  if (currentIndex < 0) return index === 0 ? "active" : "pending";
  if (index < currentIndex) return "completed";
  if (index === currentIndex) return "active";
  return "pending";
}

export default function ProgressStepper({ status, className = "" }: ProgressStepperProps) {
  const normalizedStep = (status.step ?? "").toUpperCase();
  const stepProgress = clampPercent(status.progress);
  const isDone = TERMINAL_DONE.has(normalizedStep);
  const currentIndex = getCurrentStepIndex(normalizedStep);

  return (
    <section
      aria-label="Processing progress"
      className={`w-full rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-4 sm:p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur ${className}`}
    >
      <ul className="relative space-y-5 sm:space-y-6">
        {STEPS.map((step, index) => {
          const state = getStepState(index, currentIndex, isDone);
          const isActive = state === "active";
          const isCompleted = state === "completed";
          const isLast = index === STEPS.length - 1;
          const Icon = step.Icon;

          return (
            <li key={step.id} className="relative pl-12 sm:pl-14">
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[18px] top-8 h-[calc(100%+16px)] w-px bg-zinc-800 sm:left-[22px]"
                >
                  <motion.span
                    className="block w-full origin-top bg-gradient-to-b from-emerald-400/90 via-emerald-500/70 to-transparent"
                    initial={false}
                    animate={{
                      height: isCompleted ? "100%" : isActive ? "55%" : "0%",
                      opacity: isCompleted || isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </span>
              )}

              <div className="absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 sm:h-11 sm:w-11">
                <AnimatePresence mode="wait" initial={false}>
                  {isCompleted ? (
                    <motion.span
                      key="completed"
                      initial={{ scale: 0.75, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.75, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle className="h-5 w-5 text-emerald-400 sm:h-5 sm:w-5" />
                    </motion.span>
                  ) : isActive ? (
                    <motion.span
                      key="active"
                      initial={{ scale: 0.75, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.75, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-zinc-100 sm:h-5 sm:w-5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="pending"
                      initial={{ scale: 0.75, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.75, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-5 w-5 text-zinc-500 sm:h-5 sm:w-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <motion.p
                  initial={false}
                  animate={{
                    color: isActive
                      ? "rgb(255 255 255)"
                      : isCompleted
                      ? "rgb(161 161 170)"
                      : "rgb(113 113 122)",
                  }}
                  className="text-sm sm:text-base font-medium tracking-tight"
                >
                  {step.title}
                </motion.p>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="active-progress"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-md"
                    >
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/90">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
                          initial={false}
                          animate={{ width: `${stepProgress}%` }}
                          transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 22,
                            mass: 0.4,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-zinc-400 tabular-nums">{Math.round(stepProgress)}%</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

