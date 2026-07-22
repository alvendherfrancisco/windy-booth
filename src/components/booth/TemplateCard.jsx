import React from "react";
import { LockKeyhole } from "lucide-react";
import StripPreview from "@/components/booth/StripPreview";

export default function TemplateCard({ template, selected, onSelect, locked }) {
  return (
    <button
      onClick={() => onSelect(template)}
      className={`relative rounded-[18px] border p-2 text-left transition ${
        selected
          ? "border-[#DC3522] bg-[#FDE8E4] ring-1 ring-[#DC3522]"
          : "border-[#E8E2D8] bg-white hover:-translate-y-0.5"
      }`}
    >
      <StripPreview template={template} className="max-w-[150px]" />
      <div className="mt-3 flex items-center justify-between px-1">
        <span>
          <b className="block text-sm text-[#2D2D2D]">{template.name}</b>
          <small className="text-[#8A8580]">{template.code}</small>
        </span>
        {locked && (
          <span className="rounded-full bg-[#2D2D2D] p-1.5 text-white">
            <LockKeyhole size={12} />
          </span>
        )}
      </div>
    </button>
  );
}