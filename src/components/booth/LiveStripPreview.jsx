import React from "react";

// Plays the already-composited Live Strip video (template + clips baked in
// at 2x speed during capture).
export default function LiveStripPreview({ videoUrl, className = "" }) {
  if (!videoUrl) return null;
  return (
    <video
      src={videoUrl}
      autoPlay
      loop
      muted
      playsInline
      className={`mx-auto w-full rounded-md bg-white shadow-[0_8px_24px_rgba(40,30,20,.12)] ${className}`}
    />
  );
}