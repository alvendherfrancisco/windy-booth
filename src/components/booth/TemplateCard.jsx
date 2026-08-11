import React from "react";
import { LockKeyhole } from "lucide-react";
import StripPreview from "@/components/booth/StripPreview";

export default function TemplateCard({ template, selected, onSelect, locked }) {
  return (
    <button
      onClick={() => onSelect(template)}
      className={`relative rounded-[18px] border p-2 text-left transition ${
        selected
          ? "border-[#5080da] bg-[#e3edfb] ring-1 ring-[#5080da]"
          : "border-[#e2e8f0] bg-white"
      }`}
    >
      {template.thumbnail_url ? (
        <img
          src={template.thumbnail_url}
          alt={template.name}
          loading="lazy"
          decoding="async"
          className="mx-auto max-w-[127px] rounded-md bg-[#f1f5fb] shadow-[0_8px_24px_rgba(40,30,20,.12)]"
        />
      ) : (
        <StripPreview template={template} className="max-w-[127px]" />
      )}
      <div className="mt-3 flex items-center justify-between px-1">
        <span>
          <b className="block text-sm text-[#1e1b4b]">{template.name}</b>
          <small className="text-[#94a3b8]">{template.code}</small>
        </span>
        {locked && (
          <span className="rounded-full bg-[#1e1b4b] p-1.5 text-white">
            <LockKeyhole size={12} />
          </span>
        )}
      </div>
    </button>
  );
}