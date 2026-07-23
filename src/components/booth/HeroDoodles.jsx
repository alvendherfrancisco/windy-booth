import React from "react";
import { FaceDoodle } from "@/components/FaceDoodles";

// Pure inline-SVG face doodles scattered across the hero card's open right
// side — no image containers, backgrounds, borders or shadows, just the white
// outline linework at reduced opacity floating on the pink card. Two
// identical copies stack vertically and drift upward as a seamless marquee
// (translateY -50% = one copy height). Hidden on mobile so the wrapping text
// keeps the full width.
const PLACEMENT = [
  { face: 0, top: "3%", right: "4%", size: 62, rotate: -10 },
  { face: 1, top: "7%", right: "36%", size: 50, rotate: 12 },
  { face: 2, top: "30%", right: "3%", size: 60, rotate: 6 },
  { face: 3, top: "33%", right: "31%", size: 52, rotate: -12 },
  { face: 4, top: "56%", right: "7%", size: 56, rotate: 10 },
  { face: 5, top: "62%", right: "33%", size: 50, rotate: -6 },
  { face: 6, top: "12%", right: "38%", size: 48, rotate: 8 },
  { face: 7, top: "44%", right: "37%", size: 50, rotate: -10 },
  { face: 8, top: "78%", right: "20%", size: 50, rotate: 14 }
];

function DoodleSet() {
  return PLACEMENT.map((p, i) => (
    <FaceDoodle
      key={i}
      face={p.face}
      className="absolute text-white opacity-70"
      style={{
        top: p.top,
        right: p.right,
        width: p.size,
        height: p.size,
        transform: `rotate(${p.rotate}deg)`
      }}
    />
  ));
}

export default function HeroDoodles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      <div className="doodle-marquee absolute left-0 right-0 top-0" style={{ height: "200%" }}>
        <div className="absolute left-0 right-0 top-0" style={{ height: "50%" }}>
          <DoodleSet />
        </div>
        <div className="absolute left-0 right-0" style={{ top: "50%", height: "50%" }}>
          <DoodleSet />
        </div>
      </div>
    </div>
  );
}