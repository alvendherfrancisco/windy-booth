import React from "react";

// Decorative floral background for the Booth "mode" cards. The Windy flower
// SVG is tiled as a subtle repeating pattern so both cards share a cohesive
// brand motif without competing with the centered icon and label.
const FLOWER_SVG =
  "https://media.base44.com/images/public/6a60bb3456cf14775962b360/bfb74da89_windythepoohpost1.svg";

export default function ModeCardDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{
        backgroundImage: `url(${FLOWER_SVG})`,
        backgroundRepeat: "repeat",
        backgroundSize: "46px 46px",
        opacity: 0.13,
      }}
    />
  );
}