import React from "react";

// Soft, diffuse "watercolor" auras in brand colors, scattered across the
// viewport. Fixed to the viewport so they never tile or seam on scroll, and
// pinned to the lowest layer so cards/content stay fully legible on top.
const BLOBS = [
  { top: "-8%", left: "-10%", size: 540, color: "#ffdeeb" }, // pink-1, top-left
  { top: "5%", left: "60%", size: 460, color: "#fff3bf" },   // yellow-1, upper-right
  { top: "45%", left: "-12%", size: 560, color: "#d0ebff" }, // blue-1, lower-left
  { top: "55%", left: "58%", size: 500, color: "#d3f9d8" },  // green-1, lower-right
  { top: "82%", left: "24%", size: 480, color: "#f3d9fa" },  // grape-1, bottom-center
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