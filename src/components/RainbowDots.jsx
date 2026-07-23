import React from "react";

const COLORS = ["#faa2c1", "#74c0fc", "#8ce99a", "#ffe066", "#e599f7", "#ffc078"];

// Open background bands of the "This month's sessions" card, intentionally
// avoiding the title + remaining text (top-left), the big number (top-right),
// the progress bar (middle band), and the upgrade link (bottom-left).
const BANDS = [
  { top: [2, 11], left: [4, 94], count: 3 },    // top padding
  { top: [33, 39], left: [4, 94], count: 3 },   // gap above progress bar
  { top: [48, 54], left: [4, 94], count: 3 },   // gap below progress bar
  { top: [60, 70], left: [63, 94], count: 2 },  // right of the upgrade link
  { top: [80, 95], left: [4, 94], count: 3 },   // bottom padding
];

let seed = 987654321;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

const DOTS = [];
BANDS.forEach((band) => {
  for (let k = 0; k < band.count; k++) {
    DOTS.push({
      top: band.top[0] + rand() * (band.top[1] - band.top[0]),
      left: band.left[0] + rand() * (band.left[1] - band.left[0]),
      size: 4 + Math.floor(rand() * 5), // 4–8px
      color: COLORS[Math.floor(rand() * COLORS.length)],
    });
  }
});

export default function RainbowDots() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: -1 }} aria-hidden="true">
      {DOTS.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{ top: `${d.top}%`, left: `${d.left}%`, width: d.size, height: d.size, backgroundColor: d.color, opacity: 0.26 }}
        />
      ))}
    </div>
  );
}