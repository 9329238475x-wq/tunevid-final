"use client";

import { useEffect, useState } from "react";

interface ProgressData {
  step: number;
  message: string;
  progress: number;
}

/**
 * useProgress - Custom hook to track real-time progress via SSE
 * @param taskId - The task ID to track
 * @param apiBase - API base URL
 * @returns Current progress data
 */
export default function useProgress(taskId: string | null, apiBase: string) {
  const [progressData, setProgressData] = useState<ProgressData>({
    step: 1,
    message: "Starting...",
    progress: 0,
  });

  useEffect(() => {
    if (!taskId) return;

    const eventSource = new EventSource(`${apiBase}/progress/${taskId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Progress update:", data); // Debug logging
        setProgressData(data);

        // Close connection when complete
        if (data.progress >= 100) {
          eventSource.close();
        }
      } catch (error) {
        console.error("Failed to parse progress data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [taskId, apiBase]);

  return progressData;
}
