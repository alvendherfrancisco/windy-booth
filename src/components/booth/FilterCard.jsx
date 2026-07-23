import React from "react";
import { FILTERS } from "@/components/booth/filterPresets";

export default function FilterCard({ filter, onFilterChange }) {
  return (
    <div className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
      <p className="mb-2 text-sm font-bold text-[#2D2D2D]">Filter</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
              filter === f.value
                ? "border-[#f783ac] bg-[#f783ac] text-white"
                : "border-[#E8E2D8] bg-white text-[#5C5953] hover:border-[#f783ac]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}