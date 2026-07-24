import React from "react";
import { STRIP_SLOTS } from "@/components/booth/stripSlots";

// Renders a strip: the template's design asset with the user's photos
// overlaid into the three measured photo slots (object-cover, centered).
// Templates without a design asset fall back to a plain photo stack.
export default function StripPreview({ template, photos = [], imgFilter = "none", className = "" }) {
  const thumb = template?.thumbnail_url || template?.canvas_asset_url;

  if (!thumb) {
    return (
      <div className={`mx-auto w-full rounded-md bg-white p-2 shadow-[0_8px_24px_rgba(40,30,20,.12)] ${className}`}>
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square overflow-hidden bg-[#EFE9DF]">
              {photos[i] && (
                <img src={photos[i]} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter }} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative mx-auto w-full overflow-hidden rounded-md bg-white shadow-[0_8px_24px_rgba(40,30,20,.12)] ${className}`}>
      <img src={thumb} alt={template?.name || "Vendi strip"} className="block w-full" />
      {photos.slice(0, 3).map((p, i) => (
        <div
          key={i}
          className="absolute overflow-hidden"
          style={{
            left: `${STRIP_SLOTS.left * 100}%`,
            width: `${STRIP_SLOTS.width * 100}%`,
            top: `${STRIP_SLOTS.tops[i] * 100}%`,
            height: `${STRIP_SLOTS.heights[i] * 100}%`,
          }}
        >
          <img src={p} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter }} />
        </div>
      ))}
    </div>
  );
}