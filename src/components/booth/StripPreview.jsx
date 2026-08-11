import React from "react";
import { Image } from "@/components/ui/image";
import { STRIP_SLOTS } from "@/components/booth/stripSlots";

// Renders a strip: the template's design asset with the user's photos
// overlaid into the three measured photo slots (object-cover, centered).
// Templates without a design asset fall back to a plain photo stack.
export default function StripPreview({ template, photos = [], videos = [], imgFilter = "none", className = "" }) {
  const thumb = template?.canvas_asset_url || template?.thumbnail_url;
  const isVideo = videos && videos.length > 0;

  if (!thumb) {
    return (
      <div className={`mx-auto w-full rounded-md bg-white p-2 shadow-[0_8px_24px_rgba(40,30,20,.12)] ${className}`}>
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square overflow-hidden bg-[#EFE9DF]">
              {isVideo ? (
                videos[i] && <video src={videos[i]} poster={photos[i]} autoPlay loop muted playsInline className="h-full w-full object-cover" style={{ filter: imgFilter }} />
              ) : (
                photos[i] && <img src={photos[i]} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ filter: imgFilter }} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative mx-auto w-full aspect-[2/3] overflow-hidden rounded-md bg-white shadow-[0_8px_24px_rgba(40,30,20,.12)] ${className}`}>
      {(isVideo ? videos : photos).slice(0, 3).map((src, i) => (
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
          {isVideo ? (
            <video src={src} poster={photos[i]} autoPlay loop muted playsInline className="h-full w-full object-cover" style={{ filter: imgFilter }} />
          ) : (
            <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ filter: imgFilter }} />
          )}
        </div>
      ))}
      <Image src={thumb} alt={template?.name || "windy the pooh strip"} fittingType="fit" className="absolute inset-0 z-10 h-full w-full" />
    </div>
  );
}