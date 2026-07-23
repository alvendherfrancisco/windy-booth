import React from "react";
import { FACE_SVG } from "@/assets/faces/faceData";

// All nine cleaned face doodles scattered across the full pink hero card.
// Right side: larger (60-90px), open space. Left side: small (42-46px) tucked
// near the camera icon (top-left) and "Begin" button (bottom-left), pushed to
// edges/corners so they clear the icon, headline, description and button.
// Each face gently sways left-right (varied duration + staggered delay) and the
// motion is disabled under prefers-reduced-motion. Inlined SVGs recolor via
// currentColor so there is no asset/mask to fail. Behind content (card uses
// `isolate` to establish a stacking context).
const SCATTER = [
  // right side — larger
  { face: 0, left: "89%", top: "9%",  size: 84, rotate: -14, op: 0.8,  dur: 4.2, delay: 0   },
  { face: 2, left: "73%", top: "6%",  size: 70, rotate: 12,  op: 0.78, dur: 3.4, delay: 0.6 },
  { face: 8, left: "90%", top: "47%", size: 88, rotate: 13,  op: 0.8,  dur: 4.8, delay: 1.1 },
  { face: 5, left: "71%", top: "41%", size: 76, rotate: -13, op: 0.78, dur: 3.8, delay: 0.3 },
  { face: 7, left: "88%", top: "85%", size: 80, rotate: -10, op: 0.8,  dur: 4.5, delay: 0.9 },
  // left side — small, near camera / Begin, tucked to edges
  { face: 3, left: "13%", top: "13%", size: 46, rotate: 8,   op: 0.8,  dur: 3.2, delay: 0.4 },
  { face: 6, left: "31%", top: "5%",  size: 44, rotate: -10, op: 0.78, dur: 3.6, delay: 1.0 },
  { face: 4, left: "42%", top: "88%", size: 46, rotate: -12, op: 0.8,  dur: 3.4, delay: 0.2 },
  { face: 1, left: "26%", top: "90%", size: 42, rotate: 10,  op: 0.78, dur: 4.0, delay: 0.7 },
];

export default function HeroFaceScatter() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-white" style={{ zIndex: -1 }} aria-hidden="true">
      {SCATTER.map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
          }}
        >
          <span
            className="face-sway block h-full w-full"
            style={{ opacity: p.op, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
            dangerouslySetInnerHTML={{ __html: FACE_SVG[p.face] }}
          />
        </span>
      ))}
    </div>
  );
}