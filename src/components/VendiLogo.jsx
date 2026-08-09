import React from "react";
import { Image } from "@/components/ui/image";

const LOGO_URL =
  "https://media.base44.com/images/public/6a60bb3456cf14775962b360/5f4d3fa29_windythepoohpost.svg";

// windy the pooh mark — high-resolution SVG (2915px embedded source), rendered
// via the Image component so it stays crisp at any display size. `color` is
// accepted for backward compatibility but unused (the mark is full-color).
export default function VendiLogo({ className = "", size = 28, color }) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src={LOGO_URL}
        alt="windy the pooh"
        fittingType="fit"
        className="h-full w-full object-contain"
      />
    </span>
  );
}