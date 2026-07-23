import React from "react";
import { FACE_SVG } from "@/assets/faces/faceData";

// All nine cleaned face doodles on the pink hero card, each at the same 60px.
// Positions were generated with a seeded PRNG over an L-shaped open region that
// clears the left content block (camera icon + headline + description top-left,
// "Begin" button bottom-left), with a 68px min center distance (8px gaps) and an
// 18px min vertical stagger so no two faces read as a row/column. Slight random
// rotation (-15°..15°) per face for a sticker feel. Static — no animation.
// Inlined SVGs recolor via currentColor (no asset/mask to fail). Behind content
// (the card establishes a stacking context via `isolate`).
const SCATTER = [
  { face: 0, left: "53.78%", top: "21.58%", rotate: -5 },
  { face: 1, left: "28.04%", top: "78.96%", rotate: -9 },
  { face: 2, left: "67.41%", top: "48.07%", rotate: 4 },
  { face: 3, left: "94.35%", top: "66.37%", rotate: -12 },
  { face: 4, left: "78.34%", top: "39.03%", rotate: -8 },
  { face: 5, left: "52.13%", top: "56.52%", rotate: -1 },
  { face: 6, left: "91.14%", top: "30.33%", rotate: -11 },
  { face: 7, left: "70.38%", top: "14.06%", rotate: 13 },
  { face: 8, left: "73.59%", top: "86.33%", rotate: 12 },
];

export default function HeroFaceScatter() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-white" style={{ zIndex: -1, opacity: 0.8 }} aria-hidden="true">
      {SCATTER.map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: p.left,
            top: p.top,
            width: 60,
            height: 60,
            transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
          }}
          dangerouslySetInnerHTML={{ __html: FACE_SVG[p.face] }}
        />
      ))}
    </div>
  );
}