// Rainbow polka-dot background for the "This month's sessions" card.
// Uniform-size solid pastel dots in all six brand colors (ramp level 2–3),
// scattered irregularly across the whole card on a jittered grid (no obvious
// grid or repeating sequence) with airy spacing — slightly looser than the
// reference so it never feels crowded. Rendered as a multi-stop
// background-image so it always sits above the white card color and below the
// card's text (no z-index/stacking-context tricks).

const COLORS = [
  [252, 194, 215], // pink-2
  [250, 162, 193], // pink-3
  [165, 216, 255], // blue-2
  [116, 192, 252], // blue-3
  [178, 242, 187], // green-2
  [140, 233, 154], // green-3
  [255, 236, 153], // yellow-2
  [255, 224, 102], // yellow-3
  [238, 190, 250], // grape-2
  [229, 153, 247], // grape-3
  [255, 216, 168], // orange-2
  [255, 192, 120], // orange-3
];

const COLS = 8;
const ROWS = 4;

let seed = 42424242;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

const dots = [];
for (let c = 0; c < COLS; c++) {
  for (let r = 0; r < ROWS; r++) {
    if (rand() < 0.25) continue; // skip some cells for irregular, airy spacing
    const cx = (c + 0.5) / COLS * 100;
    const cy = (r + 0.5) / ROWS * 100;
    const jx = (rand() - 0.5) * (100 / COLS) * 0.6;
    const jy = (rand() - 0.5) * (100 / ROWS) * 0.6;
    const left = Math.max(3, Math.min(97, cx + jx));
    const top = Math.max(3, Math.min(97, cy + jy));
    const col = COLORS[Math.floor(rand() * COLORS.length)];
    dots.push(
      `radial-gradient(circle at ${left.toFixed(1)}% ${top.toFixed(1)}%, rgba(${col[0]},${col[1]},${col[2]},0.78) 3.5px, transparent 4px)`
    );
  }
}

export const RAINBOW_DOTS_BG = dots.join(", ");