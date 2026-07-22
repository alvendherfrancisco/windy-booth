import React from "react";
import { Link } from "react-router-dom";
import { Camera, Check } from "lucide-react";
import StripPreview from "@/components/booth/StripPreview";

export default function StripPicker({ strips, required, selectedIds, onToggle }) {
  const selectedCount = selectedIds.length;
  const enough = strips.length >= required;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#5C5953]">
          Select <b className="text-[#4F46E5]">{selectedCount} of {required}</b> strips
        </p>
        <span className="text-xs text-[#8A8580]">{strips.length} available</span>
      </div>
      {!enough ? (
        <div className="rounded-[18px] border border-dashed border-[#AEB0B5] bg-[#F5F0EA] p-8 text-center">
          <p className="font-bold text-[#2D2D2D]">You need {required} strips for this bundle</p>
          <p className="mt-1 text-sm text-[#8A8580]">
            You have {strips.length}. Create more to unlock this bundle.
          </p>
          <Link
            to="/booth"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#DC3522] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B82E1F]"
          >
            <Camera size={16} />Create more strips
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {strips.map((s) => {
            const on = selectedIds.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => onToggle(s.id)}
                className={`relative rounded-[14px] border p-2 text-left transition ${
                  on ? "border-[#DC3522] ring-1 ring-[#DC3522]" : "border-[#E8E2D8] bg-white hover:border-[#4F46E5]"
                }`}
              >
                <StripPreview template={{ name: "Studio Mono" }} photos={s.photo_urls} />
                <span
                  className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    on ? "bg-[#DC3522] text-white" : "border border-[#E8E2D8] bg-white/80 text-[#8A8580]"
                  }`}
                >
                  {on ? <Check size={11} /> : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}