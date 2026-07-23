// Rainbow polka-dot background for the "This month's sessions" card.
// Tiny (4–8px) scattered dots in all six brand colors (ramp level 3) at low
// opacity, placed only in the card's open bands (top/bottom padding and the
// gaps around the progress bar) so the title, "X / 10" number, "remaining"
// text, progress bar, and upgrade link stay fully legible.
//
// Rendered as a multi-stop background-image so it always sits above the white
// card background-color and below the card's text — no z-index or stacking
// context tricks required (which is what caused the dots to be hidden before).

const COLORS = [
  [250, 162, 193], // pink-3
  [116, 192, 252], // blue-3
  [140, 233, 154], // green-3
  [255, 224, 102], // yellow-3
  [229, 153, 247], // grape-3
  [255, 192, 120], // orange-3
];

const BANDS = [
  { top: [2, 11], left: [4, 94] },   // top padding
  { top: [44, 52], left: [4, 94] },  // gap above progress bar
  { top: [60, 69], left: [4, 94] },  // gap below progress bar
  { top: [86, 96], left: [4, 94] },  // bottom padding
];

let seed = 987654321;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

const dots = [];
BANDS.forEach((band) => {
  for (let k = 0; k < 3; k++) {
    const top = band.top[0] + rand() * (band.top[1] - band.top[0]);
    const left = band.left[0] + rand() * (band.left[1] - band.left[0]);
    const r = 2 + rand() * 2; // 2–4px radius → 4–8px diameter
    const c = COLORS[Math.floor(rand() * COLORS.length)];
    dots.push(
      `radial-gradient(circle at ${left.toFixed(1)}% ${top.toFixed(1)}%, rgba(${c[0]},${c[1]},${c[2]},0.22) ${r.toFixed(1)}px, transparent ${(r + 0.5).toFixed(1)}px)`
    );
  }
});

export const RAINBOW_DOTS_BG = dots.join(", ");