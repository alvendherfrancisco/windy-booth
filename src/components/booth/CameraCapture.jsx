import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { filterCss } from "@/components/booth/filterPresets";
import { STRIP_SLOTS } from "@/components/booth/stripSlots";
import StripPreview from "@/components/booth/StripPreview";
import FilterCard from "@/components/booth/FilterCard";

const TIMERS = [3, 5, 10];

const CameraCapture = forwardRef(function CameraCapture(
  { selected, photos, onPhotosChange, filter, onFilterChange, onComplete, onCapturingChange },
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
  const [slotAspect, setSlotAspect] = useState(null);

  // Match the live preview to the strip's photo-slot aspect ratio so users
  // frame exactly what will land in the template.
  useEffect(() => {
    const asset = selected?.thumbnail_url || selected?.canvas_asset_url;
    if (!asset) return;
    const img = new Image();
    img.onload = () => {
      const w = STRIP_SLOTS.width * img.naturalWidth;
      const h = STRIP_SLOTS.heights[0] * img.naturalHeight;
      if (h > 0) setSlotAspect(w / h);
    };
    img.src = asset;
  }, [selected?.id, selected?.thumbnail_url, selected?.canvas_asset_url]);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then(stream => {
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCamError("Camera access denied. Please allow camera access and reload."));
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const captureFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.filter = filterCss(filter);
    // Mirror the frame so the saved strip matches the live (selfie) preview.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve =>
      canvas.toBlob(async blob => {
        const file = new File([blob], `vendi-${Date.now()}.jpg`, { type: "image/jpeg" });
        const result = await base44.integrations.Core.UploadFile({ file });
        resolve(result.file_url);
      }, "image/jpeg", 0.95)
    );
  }, [filter]);

  // Automatic photobooth sequence: countdown -> snap -> brief pause -> repeat
  // until 3 photos, then hand the captured URLs back to the parent to finish.
  const runCapture = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    onCapturingChange?.(true);
    let taken = photos.length;
    const captured = [...photos];
    while (taken < 3) {
      let t = timerVal;
      setCountdown(t);
      await new Promise(res => {
        const id = setInterval(() => {
          t--;
          if (t <= 0) {
            clearInterval(id);
            setCountdown(null);
            res();
          } else setCountdown(t);
        }, 1000);
      });
      setUploadingIdx(taken);
      const url = await captureFrame();
      if (url) {
        captured.push(url);
        onPhotosChange(prev => [...prev, url]);
        taken++;
      }
      setUploadingIdx(null);
      if (taken < 3) await new Promise(r => setTimeout(r, 1200));
    }
    setCapturing(false);
    onCapturingChange?.(false);
    onComplete?.(captured);
  }, [capturing, photos.length, timerVal, captureFrame, onPhotosChange, onComplete, onCapturingChange]);

  useImperativeHandle(ref, () => ({ capture: runCapture }), [runCapture]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        {/* Live Preview card */}
        <div className="flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Live Preview</p>
          {camError ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-[#f1f5fb] p-4 text-center text-sm text-[#94a3b8]">
              {camError}
            </div>
          ) : (
            <div
              className="relative w-full overflow-hidden rounded-xl bg-black"
              style={{ aspectRatio: slotAspect || "4 / 3" }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: "scaleX(-1)", filter: filterCss(filter) }}
              />
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="font-heading text-8xl font-extrabold text-white drop-shadow-lg">
                    {countdown}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border-2 ${
                  i < photos.length ? "border-[#228be6]" : "border-dashed border-[#e2e8f0]"
                } bg-[#f1f5fb]`}
              >
                {photos[i] ? (
                  <img src={photos[i]} alt="" className="h-full w-full object-cover" />
                ) : uploadingIdx === i ? (
                  <span className="text-[10px] text-[#94a3b8]">…</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        {/* Your Strip card */}
        <div className="mx-auto w-full max-w-[180px] flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-4 lg:max-w-none">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Your Strip</p>
          <StripPreview template={selected} photos={photos} />
        </div>
      </div>

      {/* Filter card — locked while a capture sequence is running */}
      <FilterCard filter={filter} onFilterChange={onFilterChange} disabled={capturing} />

      {/* Countdown Timer card — locked while a capture sequence is running */}
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="mb-2 text-sm font-bold text-[#1e1b4b]">Countdown Timer</p>
        <div className="flex gap-2">
          {TIMERS.map(t => (
            <button
              key={t}
              disabled={capturing}
              onClick={() => setTimerVal(t)}
              className={`rounded-lg border px-4 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                timerVal === t
                  ? "border-[#228be6] bg-[#228be6] text-white"
                  : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#228be6]"
              }`}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

export default CameraCapture;