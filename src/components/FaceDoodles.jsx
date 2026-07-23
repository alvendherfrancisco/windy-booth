import React from "react";

// Original hand-drawn line-art face doodles — a playful, scattered decorative
// accent used as a signature element across prominent brand moments. Nine
// distinct characters with varied hair silhouettes (pigtails, blunt bangs,
// afro, space buns, messy tufts…), accessories (round + square glasses), and
// expressive punctuation accents (!, ?, z). Single-weight outline (~2px), no
// fill. Rendered as a negative-z layer behind the card's content, so the card
// must establish a stacking context (e.g. via the `isolate` class) for the
// doodles to show above the card background and below the text.

export const FACES = [
  // 0 — pigtails + round glasses + subtle smile
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M8.5 19 Q9 9 20 8 Q31 9 31.5 19" />
    <path d="M8 20 Q4 23 6 28 Q3 30 6 33" />
    <path d="M32 20 Q36 23 34 28 Q37 30 34 33" />
    <circle cx="14.5" cy="20.5" r="3.2" />
    <circle cx="25.5" cy="20.5" r="3.2" />
    <path d="M17.7 20.5 L22.3 20.5" />
    <circle cx="14.5" cy="20.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="20.5" r="0.9" fill="currentColor" stroke="none" />
    <path d="M15 27.5 Q20 31 25 27.5" />
  </>),
  // 1 — blunt bangs + hand on chin + thinking + "?"
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M9 15 Q14 13 20 13 Q26 13 31 15" />
    <path d="M9 15 Q8 22 11 28" />
    <path d="M31 15 Q32 22 29 28" />
    <path d="M13 18 Q15 16 17 17" />
    <circle cx="14.5" cy="20.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="20.5" r="1" fill="currentColor" stroke="none" />
    <path d="M18 27 Q20 27.5 22 27" />
    <path d="M23 29 Q27 30 28 33 Q28 35 25 34" />
    <path d="M30 4 Q30 2 32 2 Q34 2 34 4 Q34 5.5 32 6.5 L32 8" />
    <circle cx="32" cy="10" r="0.9" fill="currentColor" stroke="none" />
  </>),
  // 2 — surprised + wide eyes + "o" mouth + "!!"
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M9 18 Q12 12 20 12 Q28 12 31 18" />
    <circle cx="14.5" cy="20" r="1.6" />
    <circle cx="25.5" cy="20" r="1.6" />
    <circle cx="20" cy="27" r="2.3" />
    <path d="M34 3 L34 7" /><circle cx="34" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
    <path d="M37 3 L37 7" /><circle cx="37" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
  </>),
  // 3 — big curly afro + winking
  () => (<>
    <circle cx="20" cy="22" r="11" />
    <path d="M7 18 Q5 13 8 11 Q9 7 13 8 Q15 5 18 7 Q20 4 22 7 Q25 5 27 8 Q31 7 32 11 Q35 13 33 18" />
    <circle cx="14.5" cy="21" r="1" fill="currentColor" stroke="none" />
    <path d="M22 21 Q24 19 26 21" />
    <path d="M16 27 Q20 29 24 27" />
  </>),
  // 4 — relaxed, eyes closed, peaceful smile
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M9 18 Q12 12 20 12 Q28 12 31 18" />
    <path d="M14 20 Q16 18 18 20" />
    <path d="M22 20 Q24 18 26 20" />
    <path d="M16 27 Q20 30 24 27" />
  </>),
  // 5 — space buns + "o" surprised mouth
  () => (<>
    <circle cx="20" cy="22" r="11" />
    <circle cx="11" cy="9" r="3.5" />
    <circle cx="29" cy="9" r="3.5" />
    <path d="M11 12 Q15 9 20 10 Q25 9 29 12" />
    <circle cx="14.5" cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="20" cy="28" r="2" />
  </>),
  // 6 — square glasses + sharp brows + serious + "!!!"
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M9 17 Q12 11 20 11 Q28 11 31 17" />
    <path d="M12 16 L17 17" />
    <path d="M23 17 L28 16" />
    <rect x="11.5" y="18.5" width="6" height="5" rx="1" />
    <rect x="22.5" y="18.5" width="6" height="5" rx="1" />
    <path d="M17.5 21 L22.5 21" />
    <circle cx="14.5" cy="21" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="21" r="0.9" fill="currentColor" stroke="none" />
    <path d="M17 28 L23 28" />
    <path d="M2 3 L2 7" /><circle cx="2" cy="8.5" r="0.7" fill="currentColor" stroke="none" />
    <path d="M5 3 L5 7" /><circle cx="5" cy="8.5" r="0.7" fill="currentColor" stroke="none" />
    <path d="M8 3 L8 7" /><circle cx="8" cy="8.5" r="0.7" fill="currentColor" stroke="none" />
  </>),
  // 7 — short messy hair + wide happy smile + "!!"
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M9 17 L11 14 L13 16 L15 13 L17 15 L20 13 L23 15 L25 13 L27 16 L29 14 L31 17" />
    <circle cx="14.5" cy="20" r="1" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="20" r="1" fill="currentColor" stroke="none" />
    <path d="M14 26 Q20 32 26 26" />
    <path d="M34 3 L34 7" /><circle cx="34" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
    <path d="M37 3 L37 7" /><circle cx="37" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
  </>),
  // 8 — tousled messy hair + sleepy yawn + "z z z"
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M8 17 Q9 13 12 14 Q14 10 16 12 Q19 9 21 12 Q24 10 26 14 Q29 13 32 17" />
    <path d="M14 20 Q16 19 18 20" />
    <path d="M22 20 Q24 19 26 20" />
    <ellipse cx="20" cy="28" rx="2.4" ry="3" />
    <path d="M35 2 L38 2 L35 4 L38 4" />
    <path d="M32 5 L35 5 L32 7 L35 7" />
    <path d="M29 8 L32 8 L29 10 L32 10" />
  </>),
];

const VARIANTS = {
  hero: {
    tone: "text-white opacity-35",
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
    tone: "text-[#e64980] opacity-40",
    faces: [
      { face: 1, top: "6%", left: "6%", size: 46, rotate: -12 },
      { face: 4, top: "10%", right: "8%", size: 40, rotate: 10 },
      { face: 7, bottom: "10%", left: "8%", size: 44, rotate: 8 },
      { face: 8, bottom: "14%", right: "8%", size: 42, rotate: -14 },
    ],
  },
  success: {
    tone: "text-[#e64980] opacity-40",
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
          fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        >
          {FACES[p.face]()}
        </svg>
      ))}
    </div>
  );
}