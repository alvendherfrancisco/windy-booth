import React from "react";
import { Flower2 } from "lucide-react";

// When a template has a real design asset, render that asset as the strip and
// overlay the user's photos into the three photo slots. Otherwise fall back to
// the brand synthetic layout.
const SLOT_TOPS = ["6%", "33%", "60%"];

export default function StripPreview({ template, photos = [], imgFilter = "none", date, className = "" }) {
  const d = new Date();
  const defaultDate = `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${String(d.getFullYear()).slice(-2)}`;
  const dateStr = date || defaultDate;
  const thumb = template?.thumbnail_url;

  if (thumb) {
    return (
      <div className={`relative mx-auto w-full overflow-hidden rounded-md bg-white shadow-[0_8px_24px_rgba(40,30,20,.12)] ${className}`}>
        <img src={thumb} alt={template?.name || "Vendi strip"} className="block w-full" />
        {photos.slice(0, 3).map((p, i) => (
          <div
            key={i}
            className="absolute overflow-hidden"
            style={{ left: "9%", right: "9%", top: SLOT_TOPS[i], aspectRatio: "1 / 1" }}
          >
            <img src={p} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`mx-auto w-full rounded-md bg-white p-2 shadow-[0_8px_24px_rgba(40,30,20,.12)] ${className}`}>
      <p className="text-center font-heading text-[11px] font-bold tracking-wide text-[#f06595]">@vendhee</p>
      <div className="mt-1.5 space-y-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="aspect-square overflow-hidden bg-[#EFE9DF]">
            {photos[i] && (
              <img src={photos[i]} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter }} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-col items-center gap-0.5">
        <Flower2 size={11} strokeWidth={1.8} className="text-[#f06595]" />
        <p className="text-center font-heading text-[10px] font-bold text-[#f06595]">{dateStr}</p>
      </div>
    </div>
  );
}