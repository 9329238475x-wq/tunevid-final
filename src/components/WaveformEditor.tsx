"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";

interface WaveformEditorProps {
  audioUrl: string;
  startTime: number;
  endTime: number;
  onRegionChange: (start: number, end: number) => void;
  onReady?: (duration: number) => void;
  onPlayToggle?: (isPlaying: boolean) => void;
  zoom: number;
}

export default function WaveformEditor({
  audioUrl,
  startTime,
  endTime,
  onRegionChange,
  onReady,
  onPlayToggle,
  zoom,
}: WaveformEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const regionRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const regions = RegionsPlugin.create();
    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#10b981",
      progressColor: "#34d399",
      cursorColor: "#34d399",
      barWidth: 2,
      barRadius: 2,
      height: 160,
      plugins: [regions],
    });

    waveSurfer.load(audioUrl);

    waveSurfer.on("ready", () => {
      const duration = waveSurfer.getDuration();
      const safeEnd = Math.min(endTime || duration, duration);
      regionRef.current = regions.addRegion({
        start: startTime,
        end: safeEnd,
        color: "rgba(16, 185, 129, 0.25)",
        drag: true,
        resize: true,
      });
      onRegionChange(startTime, safeEnd);
      onReady?.(duration);
    });

    regions.on("region-updated", (region) => {
      onRegionChange(region.start, region.end);
    });

    waveSurfer.on("play", () => onPlayToggle?.(true));
    waveSurfer.on("pause", () => onPlayToggle?.(false));

    waveSurferRef.current = waveSurfer;

    return () => {
      waveSurfer.destroy();
      waveSurferRef.current = null;
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!waveSurferRef.current || !regionRef.current) return;
    regionRef.current.setOptions({ start: startTime, end: endTime });
  }, [startTime, endTime]);

  useEffect(() => {
    if (!waveSurferRef.current) return;
    waveSurferRef.current.zoom(zoom);
  }, [zoom]);

  return <div ref={containerRef} className="w-full" />;
}
