import React from "react";
import { Search } from "lucide-react";

const TIER_BADGES = [
  { label: "All", value: "all" },
  { label: "Free", value: "free" },
  { label: "Locked", value: "locked" },
];

export default function TemplateFilters({ tier, onTierChange, collection, onCollectionChange, collections, query, onQueryChange, hideTiers = false }) {
  return (
    <div className="mt-6 space-y-3">
      <label className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5">
        <Search size={17} className="text-[#94a3b8]" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search styles…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#94a3b8]"
        />
      </label>
      {!hideTiers && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TIER_BADGES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onTierChange(value)}
              className={`flex shrink-0 items-center rounded-full border px-3 py-2 text-xs font-bold transition ${
                tier === value
                  ? "border-[#228be6] bg-[#e7f5ff] text-[#228be6]"
                  : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#228be6]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {collections.length > 0 && (
        <select
          value={collection}
          onChange={(e) => onCollectionChange(e.target.value)}
          className="w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm font-bold capitalize text-[#475569] outline-none focus:border-[#228be6]"
        >
          <option value="all">All collections</option>
          {collections.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}
    </div>
  );
}