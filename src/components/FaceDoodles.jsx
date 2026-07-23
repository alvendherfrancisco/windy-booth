import React from "react";

// Original hand-drawn line-art face doodles — a playful, scattered decorative
// accent used as a signature element across prominent brand moments. Each face
// has a distinct hair silhouette and expression (glasses, pigtails, afro, space
// buns, ponytail, spiky, wavy…), single-weight outline (~2px), no fill, with
// small punctuation accents (!, ?, z) for personality. Rendered as a negative-z
// layer behind the card's content, so the card must establish a stacking
// context (e.g. via the `isolate` class) for the doodles to show above the card
// background and below the text.

const FACES = [
  // 0 — braided pigtails + round glasses + smile
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
  // 1 — wavy shoulder hair + thoughtful (hand near chin) + "?"
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M8 22 Q6 12 12 10 Q15 7 20 9 Q25 7 28 10 Q34 12 32 22" />
    <path d="M8 22 Q7 27 9 30" />
    <path d="M32 22 Q33 27 31 30" />
    <path d="M15 17 Q17 15 19 17" />
    <circle cx="14.5" cy="20" r="1" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="20" r="1" fill="currentColor" stroke="none" />
    <path d="M18 27 Q20 28 22 27" />
    <path d="M22 29 Q26 30 27 33 Q27 35 24 34" />
    <path d="M30 4 Q30 2 32 2 Q34 2 34 4 Q34 5.5 32 6.5 L32 8" />
    <circle cx="32" cy="10" r="0.9" fill="currentColor" stroke="none" />
  </>),
  // 2 — short spiky hair + surprised open mouth + "!!"
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M8 17 L10 10 L12 15 L15 9 L18 14 L20 9 L22 14 L25 9 L28 15 L30 10 L32 17" />
    <circle cx="14.5" cy="20" r="1" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="20" r="1" fill="currentColor" stroke="none" />
    <circle cx="20" cy="27" r="2.3" />
    <path d="M34 3 L34 7" /><circle cx="34" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
    <path d="M37 3 L37 7" /><circle cx="37" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
  </>),
  // 3 — big curly afro + calm closed-eye smile
  () => (<>
    <circle cx="20" cy="22" r="11" />
    <path d="M7 18 Q5 13 8 11 Q9 7 13 8 Q15 5 18 7 Q20 4 22 7 Q25 5 27 8 Q31 7 32 11 Q35 13 33 18" />
    <path d="M14 21 Q16 19 18 21" />
    <path d="M22 21 Q24 19 26 21" />
    <path d="M16 27 Q20 30 24 27" />
  </>),
  // 4 — round short-hair + gentle smile + cheeks
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M9 18 Q12 11 20 11 Q28 11 31 18" />
    <circle cx="14.5" cy="20" r="1" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="20" r="1" fill="currentColor" stroke="none" />
    <path d="M12.5 25 Q13.5 24 14.5 25" />
    <path d="M25.5 25 Q26.5 24 27.5 25" />
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
  // 6 — straight bangs + glasses + "!!" shock
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M9 15 Q14 11 20 11 Q26 11 31 15" />
    <path d="M9 15 Q8 22 11 28" />
    <path d="M31 15 Q32 22 29 28" />
    <circle cx="14.5" cy="21" r="3.2" />
    <circle cx="25.5" cy="21" r="3.2" />
    <path d="M17.7 21 L22.3 21" />
    <circle cx="14.5" cy="21" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="25.5" cy="21" r="0.9" fill="currentColor" stroke="none" />
    <path d="M18 27 Q20 28 22 27" />
    <path d="M3 3 L3 7" /><circle cx="3" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
    <path d="M6 3 L6 7" /><circle cx="6" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
  </>),
  // 7 — small ponytail + wink + tongue out
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M9 17 Q11 10 20 9 Q29 10 31 17" />
    <path d="M31 15 Q36 16 35 22 Q33 24 30 22" />
    <circle cx="14.5" cy="20" r="1" fill="currentColor" stroke="none" />
    <path d="M23 20 Q25 18 27 20" />
    <path d="M16 26 Q20 27 24 26" />
    <path d="M18 27 Q20 32 22 27" />
  </>),
  // 8 — tousled messy hair + sleepy + "z z"
  () => (<>
    <circle cx="20" cy="21" r="12" />
    <path d="M8 17 Q9 13 12 14 Q14 10 16 12 Q19 9 21 12 Q24 10 26 14 Q29 13 32 17" />
    <path d="M14 20 Q16 19 18 20" />
    <path d="M22 20 Q24 19 26 20" />
    <path d="M18 27 L22 27" />
    <path d="M33 3 L36 3 L33 5 L36 5" />
    <path d="M31 6 L34 6 L31 8 L34 8" />
  </>),
];

const VARIANTS = {
  hero: {
    tone: "text-white opacity-35",
    faces: [
      { face: 0, top: "8%", right: "6%", size: 48, rotate: -12 },
      { face: 3, top: "44%", right: "4%", size: 42, rotate: 10 },
      { face: 7, bottom: "12%", right: "24%", size: 46, rotate: -8 },
      { face: 2, top: "26%", right: "30%", size: 38, rotate: 12 },
      { face: 8, bottom: "34%", right: "5%", size: 40, rotate: 14 },
      { face: 5, top: "62%", right: "30%", size: 34, rotate: -10 },
    ],
  },
  empty: {
    tone: "text-[#e64980] opacity-40",
    faces: [
      { face: 1, top: "8%", left: "6%", size: 42, rotate: -12 },
      { face: 4, top: "12%", right: "8%", size: 36, rotate: 10 },
      { face: 7, bottom: "12%", left: "10%", size: 40, rotate: 8 },
      { face: 8, bottom: "16%", right: "10%", size: 38, rotate: -14 },
    ],
  },
  success: {
    tone: "text-[#e64980] opacity-40",
    faces: [
      { face: 0, top: "8%", left: "6%", size: 42, rotate: -10 },
      { face: 5, top: "12%", right: "8%", size: 36, rotate: 12 },
      { face: 3, bottom: "10%", left: "10%", size: 40, rotate: 8 },
      { face: 4, bottom: "14%", right: "10%", size: 38, rotate: -12 },
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