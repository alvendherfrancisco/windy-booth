import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { filterCss } from "@/components/booth/filterPresets";
import StripPreview from "@/components/booth/StripPreview";
import FilterCard from "@/components/booth/FilterCard";

const TIMERS = [3, 5, 10];

const CameraCapture = forwardRef(function CameraCapture(
  { selected, photos, onPhotosChange, filter, onFilterChange },
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

  // Automatic photobooth sequence: countdown -> snap -> brief pause -> repeat until 3 photos.
  const runCapture = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    let taken = photos.length;
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
        onPhotosChange(prev => [...prev, url]);
        taken++;
      }
      setUploadingIdx(null);
      if (taken < 3) await new Promise(r => setTimeout(r, 1200));
    }
    setCapturing(false);
  }, [capturing, photos.length, timerVal, captureFrame, onPhotosChange]);

  useImperativeHandle(ref, () => ({ capture: runCapture }), [runCapture]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        {/* Live Preview card */}
        <div className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8A8580]">Live Preview</p>
          {camError ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-[#F5F0EA] p-4 text-center text-sm text-[#8A8580]">
              {camError}
            </div>
          ) : (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
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
                  i < photos.length ? "border-[#228be6]" : "border-dashed border-[#E8E2D8]"
                } bg-[#F5F0EA]`}
              >
                {photos[i] ? (
                  <img src={photos[i]} alt="" className="h-full w-full object-cover" />
                ) : uploadingIdx === i ? (
                  <span className="text-[10px] text-[#8A8580]">…</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        {/* Your Strip card */}
        <div className="self-start rounded-2xl border border-[#E8E2D8] bg-white p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8A8580]">Your Strip</p>
          <StripPreview template={selected} photos={photos} />
        </div>
      </div>

      {/* Filter card (separate) */}
      <FilterCard filter={filter} onFilterChange={onFilterChange} />

      {/* Countdown Timer card (separate) */}
      <div className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
        <p className="mb-2 text-sm font-bold text-[#2D2D2D]">Countdown Timer</p>
        <div className="flex gap-2">
          {TIMERS.map(t => (
            <button
              key={t}
              onClick={() => setTimerVal(t)}
              className={`rounded-lg border px-4 py-1.5 text-xs font-bold transition ${
                timerVal === t
                  ? "border-[#228be6] bg-[#228be6] text-white"
                  : "border-[#E8E2D8] bg-white text-[#5C5953] hover:border-[#228be6]"
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