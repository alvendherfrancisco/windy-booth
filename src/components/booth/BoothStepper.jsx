import React from "react";
import { Check } from "lucide-react";

const STEPS = ["Design", "Mode", "Capture", "Print", "Download"];

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
                    ? "border-[#5080da] bg-[#5080da] text-white"
                    : done
                    ? "border-[#228be6] bg-[#228be6] text-white"
                    : "border-[#e2e8f0] bg-white text-[#94a3b8]"
                }`}
              >
                {done ? <Check size={11} strokeWidth={3} /> : num}
              </div>
              <span
                className={`hidden text-[10px] font-bold uppercase tracking-wider sm:inline ${
                  active ? "text-[#5080da]" : done ? "text-[#228be6]" : "text-[#BFB9AE]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 h-px w-6 sm:w-8 ${num < step ? "bg-[#228be6]" : "bg-[#e2e8f0]"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}