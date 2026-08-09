import React from "react";
import { FILTERS } from "@/components/booth/filterPresets";

export default function FilterCard({ filter, onFilterChange, disabled = false }) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <p className="mb-2 text-sm font-bold text-[#1e1b4b]">Filter</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            disabled={disabled}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
              disabled ? "opacity-50 cursor-not-allowed " : ""
            }${
              filter === f.value
                ? "border-[#228be6] bg-[#228be6] text-white"
                : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#228be6]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}