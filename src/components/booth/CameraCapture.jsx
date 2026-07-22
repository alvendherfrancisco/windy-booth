import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

const FILTERS = [
  { label: "None",    value: "none",    css: "none" },
  { label: "B&W",     value: "bw",      css: "grayscale(100%)" },
  { label: "Sepia",   value: "sepia",   css: "sepia(80%)" },
  { label: "Vintage", value: "vintage", css: "sepia(40%) contrast(90%) brightness(90%)" },
  { label: "Vivid",   value: "vivid",   css: "saturate(180%) contrast(110%)" },
  { label: "Cool",    value: "cool",    css: "hue-rotate(30deg) saturate(120%)" },
  { label: "Warm",    value: "warm",    css: "sepia(20%) saturate(140%) brightness(105%)" },
];

const TIMERS = [3, 5, 10];

const CameraCapture = forwardRef(function CameraCapture(
  { photos, onPhotosChange, filter, onFilterChange },
  ref
) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [timerVal, setTimerVal] = useState(3);
  const [countdown, setCountdown] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [camError, setCamError] = useState(null);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCamError("Camera access denied. Please allow camera access and reload."));
    return () => { active = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const captureFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.filter = FILTERS.find(f => f.value === filter)?.css || "none";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve =>
      canvas.toBlob(async blob => {
        const result = await base44.integrations.Core.UploadFile({ file: blob });
        resolve(result.file_url);
      }, "image/jpeg", 0.92)
    );
  }, [filter]);

  const runCapture = useCallback(async () => {
    if (capturing || photos.length >= 3) return;
    setCapturing(true);
    let t = timerVal;
    setCountdown(t);
    await new Promise(res => {
      const id = setInterval(() => {
        t--;
        if (t <= 0) { clearInterval(id); setCountdown(null); res(); }
        else setCountdown(t);
      }, 1000);
    });
    const idx = photos.length;
    setUploadingIdx(idx);
    const url = await captureFrame();
    if (url) onPhotosChange(prev => [...prev, url]);
    setUploadingIdx(null);
    setCapturing(false);
  }, [capturing, photos.length, timerVal, captureFrame, onPhotosChange]);

  useImperativeHandle(ref, () => ({ capture: runCapture }), [runCapture]);

  const currentFilterCss = FILTERS.find(f => f.value === filter)?.css || "none";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
        {/* Camera panel */}
        <div className="rounded-2xl border border-[#D8D9DC] bg-white p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8B8D93]">Live Preview</p>
          {camError ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-[#F5F6F8] text-sm text-[#8B8D93] text-center p-4">{camError}</div>
          ) : (
            <div className="relative overflow-hidden rounded-xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full"
                style={{ transform: "scaleX(-1)", filter: currentFilterCss }}
              />
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="font-heading text-8xl font-extrabold text-white drop-shadow-lg">{countdown}</span>
                </div>
              )}
            </div>
          )}
          {/* Thumbnails */}
          <div className="mt-3 flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${i < photos.length ? "border-[#8AA3BE]" : "border-dashed border-[#D8D9DC]"} bg-[#F5F6F8] flex items-center justify-center`}>
                {photos[i]
                  ? <img src={photos[i]} alt="" className="h-full w-full object-cover" />
                  : uploadingIdx === i
                  ? <span className="text-[10px] text-[#8B8D93]">…</span>
                  : null}
              </div>
            ))}
          </div>
          {/* Filter row */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold text-[#55575E]">Filter</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map(f => (
                <button key={f.value} onClick={() => onFilterChange(f.value)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === f.value ? "bg-[#8AA3BE] text-white" : "bg-[#F5F6F8] text-[#55575E]"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {/* Timer row */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold text-[#55575E]">Countdown Timer</p>
            <div className="flex gap-2">
              {TIMERS.map(t => (
                <button key={t} onClick={() => setTimerVal(t)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${timerVal === t ? "bg-[#8AA3BE] text-white" : "bg-[#F5F6F8] text-[#55575E]"}`}>
                  {t}s
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Strip preview panel */}
        <div className="rounded-2xl border border-[#D8D9DC] bg-white p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8B8D93]">✦ Your Strip</p>
          <div className="flex flex-col gap-1 overflow-hidden rounded-xl border border-[#D8D9DC]">
            {[0, 1, 2].map(i => (
              <div key={i} className="aspect-[4/3] bg-[#F5F6F8]">
                {photos[i] && <img src={photos[i]} alt="" className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

export default CameraCapture;