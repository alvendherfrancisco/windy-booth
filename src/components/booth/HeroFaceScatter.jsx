import React from "react";
import { FACE_URL } from "@/assets/faces";

// Scattered cleaned face doodles on the pink hero card, sized 60-90px so each
// expression/hairstyle reads clearly. Six faces (not nine) to avoid crowding
// once enlarged, clustered in the card's open right side / corners so the
// Camera icon, headline, description and "Begin" button stay legible. Behind
// content (the card establishes a stacking context via `isolate`).
const SCATTER = [
  { face: 0, left: "89%", top: "9%",  size: 84, rotate: -14, op: 0.8 },
  { face: 2, left: "71%", top: "5%",  size: 70, rotate: 12,  op: 0.78 },
  { face: 8, left: "90%", top: "47%", size: 88, rotate: 13,  op: 0.8 },
  { face: 5, left: "69%", top: "40%", size: 76, rotate: -13, op: 0.78 },
  { face: 7, left: "87%", top: "83%", size: 80, rotate: -10, op: 0.8 },
  { face: 4, left: "67%", top: "78%", size: 70, rotate: 14,  op: 0.76 },
];

export default function HeroFaceScatter() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-white" style={{ zIndex: -1 }} aria-hidden="true">
      {SCATTER.map((p, i) => {
        const url = FACE_URL[p.face];
        return (
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
              backgroundColor: "currentColor",
              mask: `url(${url}) center / contain no-repeat`,
              WebkitMask: `url(${url}) center / contain no-repeat`,
            }}
          />
        );
      })}
    </div>
  );
}