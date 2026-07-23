import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TemplateFilters({ category, onCategoryChange, query, onQueryChange }) {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    base44.entities.Category.list("order")
      .then(setCats)
      .catch(() => setCats([]));
  }, []);

  const filters = [{ label: "All", value: "all" }, ...cats.map((c) => ({ label: c.name, value: c.name }))];

  return (
    <div className="mt-6 space-y-3">
      <label className="flex items-center gap-2 rounded-xl border border-[#E8E2D8] bg-white px-3 py-2.5">
        <Search size={17} className="text-[#8A8580]" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search styles…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#8A8580]"
        />
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onCategoryChange(value)}
            className={`flex shrink-0 items-center rounded-full border px-3 py-2 text-xs font-bold transition ${
              category === value
                ? "border-[#228be6] bg-[#e7f5ff] text-[#228be6]"
                : "border-[#E8E2D8] bg-white text-[#5C5953] hover:border-[#228be6]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}