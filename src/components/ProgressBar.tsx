"use client";

import { motion } from "framer-motion";
import { springTransition } from "@/utils/animations";

interface ProgressBarProps {
  progress: number; // 0 to 100
  statusText?: string;
  accentColor?: string;
}

/**
 * ProgressBar - Real-time animated progress bar with spring physics
 * Shows smooth filling animation as progress updates
 */
export default function ProgressBar({ 
  progress, 
  statusText = "Processing...", 
  accentColor = "bg-emerald-500" 
}: ProgressBarProps) {
  return (
    <div className="space-y-3">
      {/* Status Text */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {statusText}
        </span>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        {/* Animated Fill */}
        <motion.div
          className={`h-full rounded-full ${accentColor}`}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={springTransition}
        />
        
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Optional: Progress Milestones */}
      {progress > 0 && progress < 100 && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-zinc-500 dark:text-zinc-400"
        >
          {progress < 25 && "🚀 Starting AI processing..."}
          {progress >= 25 && progress < 50 && "🎵 Analyzing audio..."}
          {progress >= 50 && progress < 75 && "🔊 Separating tracks..."}
          {progress >= 75 && progress < 100 && "✨ Almost done..."}
        </motion.p>
      )}
    </div>
  );
}
