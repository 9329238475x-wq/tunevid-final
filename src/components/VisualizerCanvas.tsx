"use client";

import { useEffect, useRef } from "react";

type Props = {
  audioFile: File | null;
  imageUrl: string | null;
  barColor?: string;
  template?: string;
};

// Simple image preview canvas — no templates, no animations
// Just shows the uploaded image with a subtle vignette
export default function VisualizerCanvas({ audioFile, imageUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef  = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageUrl) { imageRef.current = null; return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      drawPreview();
    };
  }, [imageUrl]);

  function drawPreview() {
    const canvas = canvasRef.current;
    const img    = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    // Draw image
    ctx.drawImage(img, 0, 0, W, H);

    // Subtle dark vignette
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.85);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // "TuneVid" watermark bottom right
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.textAlign = "right";
    ctx.fillText("TuneVid.com", W - 14, H - 14);
  }

  // Redraw when image changes
  useEffect(() => { drawPreview(); }, [imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      width={960} height={540}
      className="w-full rounded-2xl bg-black"
      style={{ aspectRatio: "16/9" }}
    />
  );
}
