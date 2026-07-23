import React from "react";

// Vendi mark — the same flower glyph used in the sidebar, recolorable via currentColor
// so it adapts to its container (e.g. white on the pink auth square).
export default function VendiLogo({ className = "", size = 28, color = "currentColor" }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`} aria-hidden="true">
      <ion-icon name="flower-outline" style={{ fontSize: size, color }} />
    </span>
  );
}