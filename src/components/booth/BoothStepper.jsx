import React from "react";
import { Check } from "lucide-react";

const STEPS = ["Design", "Mode", "Capture", "Download"];

export default function BoothStepper({ step }) {
  return (
    <div className="mb-8 flex items-center justify-center">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const done = num < step;
        const active = num === step;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all
                ${done ? "border-[#8AA3BE] bg-[#8AA3BE] text-white"
                  : active ? "border-[#3E5670] bg-[#3E5670] text-white"
                  : "border-[#D8D9DC] bg-white text-[#8B8D93]"}`}>
                {done ? <Check size={14} strokeWidth={3} /> : num}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-[#3E5670]" : done ? "text-[#8AA3BE]" : "text-[#B0B3B8]"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mb-5 h-px w-12 flex-shrink-0 sm:w-16 ${num < step ? "bg-[#8AA3BE]" : "bg-[#D8D9DC]"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}