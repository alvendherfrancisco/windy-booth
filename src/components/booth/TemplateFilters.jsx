import React from "react";
import { Clapperboard, Flower2, Heart, Leaf, Search, Sparkles, Waves } from "lucide-react";

const filters = [
  { label: "All",     value: "all",      icon: Sparkles },
  { label: "Vendi",   value: "Vendi",    icon: Heart },
  { label: "Flowers", value: "Seasonal", icon: Flower2 },
  { label: "Kawaii",  value: "Kawaii",   icon: Waves },
  { label: "Minimal", value: "Minimal",  icon: Leaf },
  { label: "Retro",   value: "Retro",    icon: Clapperboard },
];

export default function TemplateFilters({ category, onCategoryChange, query, onQueryChange }) {
  return (
    <div className="mt-6 space-y-3">
      <label className="flex items-center gap-2 rounded-xl border border-[#D8D9DC] bg-white px-3 py-2.5">
        <Search size={17} className="text-[#8B8D93]" />
        <input value={query} onChange={e => onQueryChange(e.target.value)} placeholder="Search styles…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#8B8D93]" />
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(({ label, value, icon: Icon }) => (
          <button key={value} onClick={() => onCategoryChange(value)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition
              ${category === value
                ? "border-[#8AA3BE] bg-[#EFF3F7] text-[#3E5670]"
                : "border-[#D8D9DC] bg-white text-[#55575E] hover:border-[#8AA3BE]"}`}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}