import React from "react";

// Decorative accents for the Booth "mode" cards. Both cards scatter all nine
// deco SVGs around the edges so the center icon/label stays clear.
const BASE = "https://media.base44.com/images/public/6a60bb3456cf14775962b360/";

const SCATTER = [
  { src: BASE + "8965b2c54_deco-01-smiling-star.svg", top: "8%", left: "7%", size: 32, rotate: -12, opacity: 0.45 },
  { src: BASE + "204b9d46d_deco-06-sparkle-burst.svg", top: "6%", left: "80%", size: 28, rotate: 10, opacity: 0.42 },
  { src: BASE + "a6acf1697_deco-04-heart-swirl.svg", top: "30%", left: "3%", size: 28, rotate: -8, opacity: 0.4 },
  { src: BASE + "b95379ae3_deco-05-cloud-star.svg", top: "33%", left: "88%", size: 26, rotate: 12, opacity: 0.4 },
  { src: BASE + "c7738c10f_deco-02-sparkle-diamond.svg", top: "78%", left: "6%", size: 34, rotate: -10, opacity: 0.45 },
  { src: BASE + "1ab14d2e6_deco-07-smiling-star-sparkle.svg", top: "82%", left: "40%", size: 30, rotate: 8, opacity: 0.42 },
  { src: BASE + "3e20cb0da_deco-09-heart-cluster.svg", top: "76%", left: "78%", size: 32, rotate: 12, opacity: 0.45 },
  { src: BASE + "7de8dc9af_deco-03-star-cluster.svg", top: "60%", left: "13%", size: 26, rotate: -6, opacity: 0.4 },
  { src: BASE + "40114e597_deco-08-firework.svg", top: "62%", left: "83%", size: 28, rotate: 10, opacity: 0.42 },
];

export default function ModeCardDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {SCATTER.map((d, i) => (
        <img
          key={i}
          src={d.src}
          alt=""
          className="absolute"
          style={{ top: d.top, left: d.left, width: d.size, height: d.size, transform: `rotate(${d.rotate}deg)`, opacity: d.opacity }}
        />
      ))}
    </div>
  );
}