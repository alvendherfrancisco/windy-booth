import React from "react";
import { FACE_SVG } from "@/assets/faces/faceData";

// Decorative scattered face doodles, reusing the same cleaned, inlined SVG set
// as the hero card for a consistent brand texture. Inlined SVGs recolor via
// currentColor, so there is no asset/mask to fail. Rendered as a negative-z
// layer behind the host's content; the host must establish a stacking context
// (e.g. via `isolate`).

const VARIANTS = {
  hero: {
    tone: "text-white",
    opacity: 0.35,
    faces: [
      { face: 0, top: "2%", right: "3%", size: 66, rotate: -10 },
      { face: 2, top: "4%", right: "36%", size: 54, rotate: 12 },
      { face: 5, top: "40%", right: "4%", size: 60, rotate: -8 },
      { face: 3, bottom: "2%", right: "6%", size: 64, rotate: 10 },
      { face: 8, bottom: "4%", right: "38%", size: 52, rotate: 14 },
      { face: 7, top: "46%", right: "40%", size: 50, rotate: -12 },
    ],
  },
  empty: {
    tone: "text-[#3a6cbf]",
    opacity: 0.32,
    faces: [
      { face: 1, top: "6%", left: "6%", size: 46, rotate: -12 },
      { face: 4, top: "10%", right: "8%", size: 40, rotate: 10 },
      { face: 7, bottom: "10%", left: "8%", size: 44, rotate: 8 },
      { face: 8, bottom: "14%", right: "8%", size: 42, rotate: -14 },
    ],
  },
  success: {
    tone: "text-[#3a6cbf]",
    opacity: 0.32,
    faces: [
      { face: 0, top: "6%", left: "6%", size: 46, rotate: -10 },
      { face: 5, top: "10%", right: "8%", size: 40, rotate: 12 },
      { face: 3, bottom: "8%", left: "8%", size: 44, rotate: 8 },
      { face: 4, bottom: "12%", right: "8%", size: 42, rotate: -12 },
    ],
  },
};

export default function FaceDoodles({ variant = "hero" }) {
  const v = VARIANTS[variant] || VARIANTS.hero;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${v.tone}`} style={{ zIndex: -1, opacity: v.opacity }} aria-hidden="true">
      {v.faces.map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            transform: `rotate(${p.rotate || 0}deg)`,
          }}
          dangerouslySetInnerHTML={{ __html: FACE_SVG[p.face] }}
        />
      ))}
    </div>
  );
}