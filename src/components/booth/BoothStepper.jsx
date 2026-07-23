import React from "react";
import { Check } from "lucide-react";

const STEPS = ["Design", "Mode", "Capture", "Download"];

export default function BoothStepper({ step }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const done = num < step;
        const active = num === step;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold transition ${
                  active
                    ? "border-[#f06595] bg-[#f06595] text-white"
                    : done
                    ? "border-[#40c057] bg-[#40c057] text-white"
                    : "border-[#E8E2D8] bg-white text-[#8A8580]"
                }`}
              >
                {done ? <Check size={11} strokeWidth={3} /> : num}
              </div>
              <span
                className={`hidden text-[10px] font-bold uppercase tracking-wider sm:inline ${
                  active ? "text-[#f06595]" : done ? "text-[#40c057]" : "text-[#BFB9AE]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 h-px w-6 sm:w-8 ${num < step ? "bg-[#40c057]" : "bg-[#E8E2D8]"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}