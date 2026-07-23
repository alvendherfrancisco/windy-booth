import React from "react";

// Decorative sticker accents for the Booth "mode" cards, drawn from the
// custom deco SVG set. Low opacity + small scale, pinned to corners so they
// never cover the center icon/label. Cards rotate through the set so the two
// cards don't look identical.
const BASE = "https://media.base44.com/images/public/6a60bb3456cf14775962b360/";

const VARIANTS = {
  camera: [
    { src: BASE + "8965b2c54_deco-01-smiling-star.svg", pos: "top-2.5 left-3", size: 42, rotate: -12, opacity: 0.42 },
    { src: BASE + "204b9d46d_deco-06-sparkle-burst.svg", pos: "top-4 right-3", size: 30, rotate: 8, opacity: 0.4 },
    { src: BASE + "a6acf1697_deco-04-heart-swirl.svg", pos: "bottom-3 right-4", size: 38, rotate: 10, opacity: 0.42 },
  ],
  upload: [
    { src: BASE + "c7738c10f_deco-02-sparkle-diamond.svg", pos: "top-3 right-3", size: 40, rotate: 12, opacity: 0.42 },
    { src: BASE + "1ab14d2e6_deco-07-smiling-star-sparkle.svg", pos: "bottom-3 left-3", size: 42, rotate: -10, opacity: 0.42 },
    { src: BASE + "3e20cb0da_deco-09-heart-cluster.svg", pos: "top-4 left-4", size: 30, rotate: -8, opacity: 0.4 },
  ],
};

export default function ModeCardDecor({ variant }) {
  const items = VARIANTS[variant] || [];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ backgroundImage: "radial-gradient(circle, rgba(230,73,128,0.13) 1.4px, transparent 1.4px)", backgroundSize: "15px 15px" }}>
      {items.map((d, i) => (
        <img
          key={i}
          src={d.src}
          alt=""
          className={`absolute ${d.pos}`}
          style={{ width: d.size, height: d.size, transform: `rotate(${d.rotate}deg)`, opacity: d.opacity }}
        />
      ))}
    </div>
  );
}