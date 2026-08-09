import React from "react";

// Soft, diffuse "watercolor" auras in brand colors, scattered across the
// viewport. Fixed to the viewport so they never tile or seam on scroll, and
// pinned to the lowest layer so cards/content stay fully legible on top.
const BLOBS = [
  { top: "-8%", left: "-10%", size: 540, color: "#cfe0f6" }, // blue, top-left
  { top: "5%", left: "60%", size: 460, color: "#fbf7c8" },   // yellow, upper-right
  { top: "45%", left: "-12%", size: 560, color: "#dbe4fb" }, // indigo, lower-left
  { top: "55%", left: "58%", size: 500, color: "#e7eefb" },  // light indigo, lower-right
  { top: "82%", left: "24%", size: 480, color: "#f8f2a7" },  // yellow, bottom-center
];

export default function BackgroundBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: -1 }} aria-hidden="true">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at center, ${b.color} 0%, transparent 70%)`,
            opacity: 0.55,
            filter: "blur(64px)",
          }}
        />
      ))}
    </div>
  );
}