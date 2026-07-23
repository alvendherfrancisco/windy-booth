import React from "react";
import { Flower2 } from "lucide-react";

export default function StripPreview({ template, photos = [], imgFilter = "none", date, className = "" }) {
  const d = new Date();
  const defaultDate = `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${String(d.getFullYear()).slice(-2)}`;
  const dateStr = date || defaultDate;
  return (
    <div className={`mx-auto w-full rounded-md bg-white p-2 shadow-[0_8px_24px_rgba(40,30,20,.12)] ${className}`}>
      <p className="text-center font-heading text-[11px] font-bold tracking-wide text-[#f783ac]">
        {template?.name || "Vendi"}
      </p>
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
        <Flower2 size={11} strokeWidth={1.8} className="text-[#f783ac]" />
        <p className="text-center font-heading text-[10px] font-bold text-[#f783ac]">{dateStr}</p>
      </div>
    </div>
  );
}