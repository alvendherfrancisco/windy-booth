import React from "react";
import { Image } from "@/components/ui/image";

// Each face is its own high-res square PNG on a solid #f06595 background,
// so it blends into the card with no visible edge. Placed individually on
// the card's open right side, sized small, rotated slightly for an organic
// scatter. Hidden on mobile to keep the (full-width, wrapping) text legible.
const DOODLES = [
  { src: "https://media.base44.com/images/public/6a60bb3456cf14775962b360/ea5aa64d6_generated_image.png", top: "6%", right: "5%", size: 62, rotate: -8 },
  { src: "https://media.base44.com/images/public/6a60bb3456cf14775962b360/e434da235_generated_image.png", top: "2%", right: "30%", size: 52, rotate: 12 },
  { src: "https://media.base44.com/images/public/6a60bb3456cf14775962b360/7af779740_generated_image.png", top: "30%", right: "3%", size: 64, rotate: 6 },
  { src: "https://media.base44.com/images/public/6a60bb3456cf14775962b360/80d3ec9dd_generated_image.png", top: "36%", right: "27%", size: 54, rotate: -12 },
  { src: "https://media.base44.com/images/public/6a60bb3456cf14775962b360/e47d63297_generated_image.png", top: "60%", right: "8%", size: 58, rotate: 10 },
  { src: "https://media.base44.com/images/public/6a60bb3456cf14775962b360/b92fc39c6_generated_image.png", top: "68%", right: "29%", size: 50, rotate: -6 },
  { src: "https://media.base44.com/images/public/6a60bb3456cf14775962b360/404510230_generated_image.png", top: "14%", right: "36%", size: 50, rotate: 8 },
  { src: "https://media.base44.com/images/public/6a60bb3456cf14775962b360/e85fb6104_generated_image.png", top: "48%", right: "34%", size: 56, rotate: -10 },
  { src: "https://media.base44.com/images/public/6a60bb3456cf14775962b360/022d20ff4_generated_image.png", top: "80%", right: "20%", size: 50, rotate: 14 }
];

export default function HeroDoodles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {DOODLES.map((d, i) => (
        <Image
          key={i}
          src={d.src}
          fittingType="fill"
          className="absolute"
          style={{
            top: d.top,
            right: d.right,
            width: d.size,
            height: d.size,
            transform: `rotate(${d.rotate}deg)`
          }}
        />
      ))}
    </div>
  );
}