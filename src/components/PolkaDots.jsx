import React from "react";

const COLORS = ["#e599f7", "#cc5de8", "#ffc078", "#ffa94d", "#fcc2d7", "#74c0fc", "#8ce99a", "#ffe066"];

export default function PolkaDots({ count = 13 }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const r = (i * 2654435761) % 1000;
    const top = i % 2 === 0 ? r % 32 : 68 + (r % 28);
    const left = (r * 7 + i * 41) % 100;
    const size = 6 + (r % 9);
    const color = COLORS[(i + r) % COLORS.length];
    return { top, left, size, color };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: -1 }} aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{ top: `${d.top}%`, left: `${d.left}%`, width: d.size, height: d.size, backgroundColor: d.color, opacity: 0.22 }}
        />
      ))}
    </div>
  );
}