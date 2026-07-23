import React from "react";
import { FACE_RAW, faceSvgHtml } from "@/assets/faces";

// Small, organically-scattered cleaned face doodles floating on the pink hero
// card as a soft background texture. Sized 29-44px, slight rotation, white at
// ~60-75% opacity, clustered in the card's open right side / top / corners so
// the headline, description and "Begin" button stay legible. Rendered behind
// the content (the card establishes a stacking context via `isolate`).
const SCATTER = [
  { face: 0, left: "90%", top: "6%", size: 40, rotate: -12, op: 0.75 },
  { face: 2, left: "76%", top: "3%", size: 33, rotate: 9, op: 0.7 },
  { face: 5, left: "62%", top: "2%", size: 29, rotate: -6, op: 0.6 },
  { face: 8, left: "91%", top: "38%", size: 44, rotate: 11, op: 0.75 },
  { face: 3, left: "68%", top: "28%", size: 37, rotate: -13, op: 0.7 },
  { face: 6, left: "54%", top: "9%", size: 31, rotate: 7, op: 0.6 },
  { face: 7, left: "90%", top: "72%", size: 42, rotate: -9, op: 0.75 },
  { face: 1, left: "72%", top: "64%", size: 35, rotate: 13, op: 0.7 },
  { face: 4, left: "58%", top: "50%", size: 33, rotate: -7, op: 0.65 },
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
            opacity: p.op,
            transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
          }}
          dangerouslySetInnerHTML={{ __html: faceSvgHtml(FACE_RAW[p.face]) }}
        />
      ))}
    </div>
  );
}