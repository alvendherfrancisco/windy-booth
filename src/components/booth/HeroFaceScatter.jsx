import React from "react";
import { FACE_SVG } from "@/assets/faces/faceData";

// Six face doodles on the pink hero card, each at the same 84px. Positions were
// generated with a seeded PRNG over the card's true open region (everything that
// clears the camera icon, "Start a new booth" headline, the description line,
// and the "Begin" button), with a 106px min center distance (~22px gaps) and a
// check that no three faces share a 20px y-band or x-band — so nothing reads as
// a grid row/column. The hero card is short (~200px), so 9 at this size would
// crowd; six keeps varied expressions comfortable. Slight random rotation
// (-15°..15°) per face. Static — no animation. Inlined SVGs recolor via
// currentColor (no asset/mask to fail). Behind content (card uses `isolate`).
const SCATTER = [
  { face: 6, left: "62.26%", top: "22.17%", rotate: -3 },
  { face: 2, left: "79.16%", top: "25.95%", rotate: 5 },
  { face: 8, left: "91.31%", top: "67.67%", rotate: 11 },
  { face: 3, left: "74.67%", top: "78.48%", rotate: 12 },
  { face: 5, left: "45.29%", top: "33.94%", rotate: 0 },
  { face: 7, left: "57.78%", top: "77.09%", rotate: 7 },
];

// On mobile the card is nearly full viewport width, so the desktop percentage
// layout (tuned for a wide two-column card) lands several faces directly over
// the headline/description text. This mobile-only set keeps faces smaller and
// confined to a safe strip on the right edge, clear of all text and the
// "Begin" button (bottom-left).
const MOBILE_SCATTER = [
  { face: 6, left: "78%", top: "10%", rotate: -4 },
  { face: 2, left: "95%", top: "34%", rotate: 6 },
  { face: 8, left: "80%", top: "58%", rotate: -8 },
  { face: 3, left: "96%", top: "86%", rotate: 10 },
];

export default function HeroFaceScatter() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden text-white md:block" style={{ zIndex: -1, opacity: 0.8 }} aria-hidden="true">
        {SCATTER.map((p, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: p.left,
              top: p.top,
              width: 84,
              height: 84,
              transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
            }}
            dangerouslySetInnerHTML={{ __html: FACE_SVG[p.face] }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-white md:hidden" style={{ zIndex: -1, opacity: 0.8 }} aria-hidden="true">
        {MOBILE_SCATTER.map((p, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: p.left,
              top: p.top,
              width: 56,
              height: 56,
              transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
            }}
            dangerouslySetInnerHTML={{ __html: FACE_SVG[p.face] }}
          />
        ))}
      </div>
    </>
  );
}