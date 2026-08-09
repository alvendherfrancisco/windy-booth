import React, { useEffect, useRef, useState } from "react";
import StripPreview from "@/components/booth/StripPreview";

// Print simulation inspired by vendhee-booth/print.js: a printer body with a
// motor buzz, the strip sliding out of the slot, timed status messages, then a
// confetti-petal celebration before handing off to the download step.

const STATUS = [
  { t: 0, text: "Warming up the printer…" },
  { t: 600, text: "Feeding paper…" },
  { t: 1200, text: "Printing…" },
  { t: 2600, text: "Finishing up…" },
];
const PETAL_COLORS = ["#ffdee8", "#cee289", "#f0758a", "#fff0b3", "#d4f0d4"];
const PRINT_DURATION = 2200;

export default function PrintSimulation({ template, photos, onDone }) {
  const paperRef = useRef(null);
  const zoneRef = useRef(null);
  const [status, setStatus] = useState(STATUS[0].text);
  const [printing, setPrinting] = useState(false);
  const [done, setDone] = useState(false);
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const timers = STATUS.map((s) => setTimeout(() => setStatus(s.text), s.t));
    const buzzT = setTimeout(() => setPrinting(true), 400);
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const paper = paperRef.current;
      const zone = zoneRef.current;
      if (!paper || !zone || paper.offsetHeight === 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const stripPx = paper.offsetHeight;
      const elapsed = now - start;
      const t = Math.min(elapsed / PRINT_DURATION, 1);
      let eased;
      if (t < 0.1) eased = (t / 0.1) * (t / 0.1) * 0.05;
      else if (t < 0.92) eased = 0.05 + ((t - 0.1) / 0.82) * 0.88;
      else { const tail = (t - 0.92) / 0.08; eased = 0.93 + tail * (1 - tail) * 0.14 + tail * 0.07; }
      eased = Math.min(eased, 1);
      const translateY = -stripPx * (1 - eased);
      const emerged = stripPx * eased;
      paper.style.transform = `translateY(${translateY.toFixed(1)}px)`;
      zone.style.height = `${emerged.toFixed(1)}px`;
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        setPrinting(false);
        paper.style.transform = "translateY(0)";
        zone.style.height = `${stripPx}px`;
        setStatus("Your strip is ready!");
        setDone(true);
        setPetals(
          Array.from({ length: 18 }, (_, i) => ({
            id: i,
            left: 10 + Math.random() * 80,
            color: PETAL_COLORS[i % PETAL_COLORS.length],
            delay: Math.random() * 0.8,
            dur: 1.6 + Math.random() * 1.2,
            rot: Math.random() * 360,
          }))
        );
        setTimeout(() => setPetals([]), 4200);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      clearTimeout(buzzT);
    };
  }, []);

  return (
    <div className="mx-auto max-w-sm text-center">
      <h1 className="font-heading text-2xl font-extrabold text-[#1e1b4b]">Printing your strip</h1>
      <div className="mt-8 flex flex-col items-center">
        {/* Printer machine */}
        <div
          className={`relative w-56 rounded-t-2xl rounded-b-lg px-5 pb-2 pt-4 ${printing ? "printer-buzz" : ""}`}
          style={{
            background: "linear-gradient(160deg,#f5f0ee 0%,#e8e0dc 60%,#d8d0cc 100%)",
            boxShadow: "0 4px 0 #c8c0bc, 0 8px 24px rgba(58,44,42,.18), inset 0 1px 0 rgba(255,255,255,.7)",
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">Vendi</span>
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5080da]" />
              <span className={`h-1.5 w-1.5 rounded-full bg-[#37b24d] ${printing ? "animate-pulse" : ""}`} />
            </div>
          </div>
          <div className="h-0.5 w-full overflow-hidden rounded bg-black/10">
            <div className="h-full rounded bg-[#5080da]" style={{ width: printing ? "100%" : "0%", transition: "width 2.2s linear" }} />
          </div>
          {/* slot */}
          <div className="mx-auto mt-3 h-1.5 w-40 rounded-full bg-black/30" />
        </div>

        {/* Exit zone + strip paper */}
        <div ref={zoneRef} className="relative w-40" style={{ height: 0, overflow: "hidden" }}>
          <div
            ref={paperRef}
            className={`w-40 overflow-hidden rounded-b-md bg-[#fffef9] ${done ? "strip-glow" : ""}`}
            style={{ transform: "translateY(0)", boxShadow: "2px 8px 22px rgba(58,44,42,.25)" }}
          >
            <StripPreview template={template} photos={photos} />
          </div>
        </div>

        <p className="mt-8 min-h-5 text-sm italic text-[#475569]">{status}</p>

        {done && (
          <button
            onClick={onDone}
            className="mt-6 rounded-full bg-[#5080da] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf]"
          >
            Continue →
          </button>
        )}
      </div>

      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            top: "-5%",
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}