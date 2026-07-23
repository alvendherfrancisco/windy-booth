import React from "react";
import { FACES } from "@/components/FaceDoodles";

// Slow vertical marquee of the brand's hand-drawn face doodles. The nine SVG
// faces are tiled in a single column, duplicated directly below themselves, and
// the strip is translated upward by exactly one column height (-50%) on an
// infinite linear loop — so the restart is seamless (column 2 lands where
// column 1 started). Rendered as a negative-z layer behind the card content;
// the card must use `isolate` for it to show above the card bg and below text.
// `prefers-reduced-motion` pauses the animation (see index.css).

const ROTATIONS = [-10, 12, -8, 10, 14, -12, -6, 8, -14];

export default function FaceDoodleMarquee() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: -1 }} aria-hidden="true">
      <div
        className="doodle-marquee absolute right-5 top-0 flex flex-col items-center text-white"
        style={{ opacity: 0.35 }}
      >
        {[0, 1].map((dup) =>
          FACES.map((Face, i) => (
            <svg
              key={`${dup}-${i}`}
              viewBox="0 0 40 40"
              width={58}
              height={58}
              style={{ marginBottom: 12, transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {Face()}
            </svg>
          ))
        )}
      </div>
    </div>
  );
}