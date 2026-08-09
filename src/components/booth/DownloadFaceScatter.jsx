import React from "react";
import { FACE_SVG } from "@/assets/faces/faceData";

// Face doodles scattered across the download card. The card is narrow
// (max-w-sm) and tall, so eight faces are placed around the perimeter — top
// corners, beside the strip, and bottom corners — keeping the centered
// content (strip, title, buttons) clear. One layout works at every size
// because the card is always max-w-sm.
const SCATTER = [
  { face: 6, left: "15%", top: "4%", rotate: -8 },
  { face: 2, left: "85%", top: "5%", rotate: 7 },
  { face: 8, left: "9%", top: "22%", rotate: -12 },
  { face: 3, left: "91%", top: "24%", rotate: 10 },
  { face: 5, left: "8%", top: "45%", rotate: -6 },
  { face: 7, left: "92%", top: "47%", rotate: 8 },
  { face: 4, left: "14%", top: "93%", rotate: -10 },
  { face: 1, left: "86%", top: "94%", rotate: 12 },
];

const FACE_SIZE = "clamp(44px, 13vw, 58px)";

export default function DownloadFaceScatter() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-white" style={{ zIndex: -1, opacity: 0.8 }} aria-hidden="true">
      {SCATTER.map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: p.left,
            top: p.top,
            width: FACE_SIZE,
            height: FACE_SIZE,
            transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
          }}
          dangerouslySetInnerHTML={{ __html: FACE_SVG[p.face] }}
        />
      ))}
    </div>
  );
}