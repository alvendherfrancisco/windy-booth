import React from "react";
import { Check } from "lucide-react";
import { BUNDLES, includedItems } from "@/components/printshop/data";

export default function BundleGrid({ selected, onSelect }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {BUNDLES.map((b) => {
        const active = selected?.id === b.id;
        return (
          <button
            key={b.id}
            onClick={() => onSelect(b)}
            className={`rounded-[18px] border p-5 text-left transition ${
              active
                ? "border-[#DC3522] bg-[#FDE8E4] ring-1 ring-[#DC3522]"
                : "border-[#E8E2D8] bg-white hover:border-[#4F46E5]"
            }`}
          >
            <div className="flex items-center justify-between">
              <b className="font-heading text-lg font-extrabold text-[#2D2D2D]">{b.id}</b>
              {active && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DC3522] text-white">
                  <Check size={13} />
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-[#8A8580]">{b.blurb}</p>
            <p className="mt-4 font-heading text-2xl font-extrabold text-[#2D2D2D]">
              ₱{b.price}
              <span className="text-sm font-normal text-[#8A8580]"> / {b.strips} strips</span>
            </p>
            <ul className="mt-3 space-y-1">
              {includedItems(b).map((it) => (
                <li key={it} className="flex items-center gap-1.5 text-xs text-[#5C5953]">
                  <span className="h-1 w-1 rounded-full bg-[#4F46E5]" />
                  {it}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}