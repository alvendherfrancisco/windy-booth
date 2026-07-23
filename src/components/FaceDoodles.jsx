import React from "react";

// Simple hand-drawn line-art face doodles — a playful, scattered decorative
// accent used as a signature element across prominent brand moments. Each face
// is a distinct expression, single-weight outline, no fill. Rendered as a
// negative-z layer behind the card's content, so the card must establish a
// stacking context (e.g. via the `isolate` class) for the doodles to show above
// the card background and below the text.

const FACES = [
  // 0 — happy
  () => (<>
    <circle cx="20" cy="20" r="15" />
    <circle cx="14.5" cy="17" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="17" r="1.3" fill="currentColor" stroke="none" />
    <path d="M14 25 Q20 30 26 25" />
  </>),
  // 1 — surprised "o"
  () => (<>
    <circle cx="20" cy="20" r="15" />
    <circle cx="14.5" cy="17" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="17" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="20" cy="26" r="2.4" />
  </>),
  // 2 — content, closed-eye smile
  () => (<>
    <circle cx="20" cy="20" r="15" />
    <path d="M11.5 17.5 Q14.5 14.5 17.5 17.5" />
    <path d="M22.5 17.5 Q25.5 14.5 28.5 17.5" />
    <path d="M14 25 Q20 30 26 25" />
  </>),
  // 3 — curious, raised brow
  () => (<>
    <circle cx="20" cy="20" r="15" />
    <circle cx="14.5" cy="17" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="17" r="1.3" fill="currentColor" stroke="none" />
    <path d="M11 12.5 Q14.5 10 18 12.5" />
    <path d="M17 26 Q20 27.5 23 26" />
  </>),
  // 4 — wink
  () => (<>
    <circle cx="20" cy="20" r="15" />
    <circle cx="14.5" cy="17" r="1.3" fill="currentColor" stroke="none" />
    <path d="M22.5 17.5 Q25.5 14.5 28.5 17.5" />
    <path d="M14 26 Q20 28 27 24" />
  </>),
  // 5 — sleepy
  () => (<>
    <circle cx="20" cy="20" r="15" />
    <path d="M11.5 17.5 Q14.5 15.5 17.5 17.5" />
    <path d="M22.5 17.5 Q25.5 15.5 28.5 17.5" />
    <path d="M17 26 L23 26" />
  </>),
];

const VARIANTS = {
  hero: {
    tone: "text-white opacity-35",
    faces: [
      { face: 0, top: "10%", right: "8%", size: 46, rotate: -10 },
      { face: 2, top: "46%", right: "6%", size: 38, rotate: 12 },
      { face: 4, bottom: "14%", right: "26%", size: 42, rotate: -6 },
      { face: 1, top: "26%", right: "32%", size: 34, rotate: 8 },
      { face: 5, bottom: "34%", right: "8%", size: 36, rotate: 14 },
    ],
  },
  empty: {
    tone: "text-[#d6336c] opacity-45",
    faces: [
      { face: 0, top: "10%", left: "8%", size: 40, rotate: -12 },
      { face: 3, top: "14%", right: "10%", size: 34, rotate: 10 },
      { face: 4, bottom: "12%", left: "12%", size: 38, rotate: 8 },
      { face: 2, bottom: "16%", right: "12%", size: 36, rotate: -14 },
    ],
  },
  success: {
    tone: "text-[#d6336c] opacity-45",
    faces: [
      { face: 0, top: "8%", left: "6%", size: 40, rotate: -10 },
      { face: 1, top: "12%", right: "8%", size: 34, rotate: 12 },
      { face: 5, bottom: "10%", left: "10%", size: 36, rotate: 8 },
      { face: 2, bottom: "14%", right: "10%", size: 38, rotate: -12 },
    ],
  },
};

export default function FaceDoodles({ variant = "hero" }) {
  const v = VARIANTS[variant] || VARIANTS.hero;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: -1 }} aria-hidden="true">
      {v.faces.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 40 40"
          className={`absolute ${v.tone}`}
          style={{
            top: p.top, left: p.left, right: p.right, bottom: p.bottom,
            width: p.size, height: p.size,
            transform: `rotate(${p.rotate || 0}deg)`,
          }}
          fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
        >
          {FACES[p.face]()}
        </svg>
      ))}
    </div>
  );
}