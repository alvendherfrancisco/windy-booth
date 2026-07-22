import React from "react";
import { Clapperboard, Flower2, Heart, Leaf, Search, Sparkles, Waves } from "lucide-react";

const filters = [
  { label: "All", value: "all", icon: Sparkles },
  { label: "Vendi", value: "Vendi", icon: Heart },
  { label: "Flowers", value: "Seasonal", icon: Flower2 },
  { label: "Kawaii", value: "Kawaii", icon: Waves },
  { label: "Minimal", value: "Minimal", icon: Leaf },
  { label: "Retro", value: "Retro", icon: Clapperboard },
];

export default function TemplateFilters({ category, onCategoryChange, query, onQueryChange }) {
  return (
    <div className="mt-6 space-y-3">
      <label className="flex items-center gap-2 rounded-xl border border-[#E8E2D8] bg-white px-3 py-2.5">
        <Search size={17} className="text-[#8A8580]" />
        <input
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search styles…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#8A8580]"
        />
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onCategoryChange(value)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition ${
              category === value
                ? "border-[#DC3522] bg-[#FDE8E4] text-[#DC3522]"
                : "border-[#E8E2D8] bg-white text-[#5C5953] hover:border-[#DC3522]"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}