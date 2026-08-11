import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { STRIP_SLOTS } from "@/components/booth/stripSlots";
import StripPreview from "@/components/booth/StripPreview";

const TIMERS = [3, 5, 10];

// Captures three raw (unfiltered) frames from the webcam as local File objects.
// The filter is chosen in a later step and baked into the photos at finish time,
// so capture itself applies no filter. onComplete hands the File[] back to the
// parent; onPhotosChange receives local object URLs for the live thumbnails.
const CLIP_MS = 1500;
const MIME_CANDIDATES = ["video/mp4;codecs=avc1", "video/webm;codecs=vp9", "video/webm"];

const CameraCapture = forwardRef(function CameraCapture(
  { selected, photos, onPhotosChange, onComplete, onVideoComplete, onCapturingChange, imgFilter = "none", live = false, children },
  ref
) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [timerVal, setTimerVal] = useState(3);
  const [countdown, setCountdown] = useState(null);
  const [recording, setRecording] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [camError, setCamError] = useState(null);
  const [slotAspect, setSlotAspect] = useState(null);

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
    // Mirror the frame so the saved strip matches the live (selfie) preview.
    // No filter here — it is applied in the filter step and baked at finish.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve =>
      canvas.toBlob(blob => {
        const file = new File([blob], `vendi-${Date.now()}.jpg`, { type: "image/jpeg" });
        const url = URL.createObjectURL(file);
        resolve({ url, file });
      }, "image/jpeg", 0.95)
    );
  }, []);

  // Records a short muted video clip from the live stream (used in Live Mode)
  // and also grabs a mirrored poster frame for thumbnails/print fallback.
  const captureClip = useCallback(async () => {
    const video = videoRef.current;
    const stream = streamRef.current;
    const canvas = canvasRef.current;
    if (!video || !stream || !canvas) return null;

    const mimeType = MIME_CANDIDATES.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise(resolve => { recorder.onstop = resolve; });
    recorder.start();
    await new Promise(r => setTimeout(r, CLIP_MS));
    recorder.stop();
    await stopped;

    const finalMime = recorder.mimeType || mimeType || "video/webm";
    const ext = finalMime.includes("mp4") ? "mp4" : "webm";
    const videoFile = new File([new Blob(chunks, { type: finalMime })], `vendi-${Date.now()}.${ext}`, { type: finalMime });

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const posterFile = await new Promise(resolve =>
      canvas.toBlob(blob => resolve(new File([blob], `vendi-${Date.now()}.jpg`, { type: "image/jpeg" })), "image/jpeg", 0.9)
    );
    return { posterUrl: URL.createObjectURL(posterFile), posterFile, videoFile };
  }, []);

  const runCapture = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    onCapturingChange?.(true);
    let taken = photos.length;
    const capturedFiles = [];
    const capturedVideos = [];
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
      if (live) {
        setRecording(true);
        const result = await captureClip();
        setRecording(false);
        if (result) {
          capturedFiles.push(result.posterFile);
          capturedVideos.push(result.videoFile);
          onPhotosChange(prev => [...prev, result.posterUrl]);
          taken++;
        }
      } else {
        const result = await captureFrame();
        if (result) {
          capturedFiles.push(result.file);
          onPhotosChange(prev => [...prev, result.url]);
          taken++;
        }
      }
      setUploadingIdx(null);
      if (taken < 3) await new Promise(r => setTimeout(r, 1200));
    }
    setCapturing(false);
    onCapturingChange?.(false);
    onComplete?.(capturedFiles);
    if (live) onVideoComplete?.(capturedVideos);
  }, [capturing, photos.length, timerVal, live, captureFrame, captureClip, onPhotosChange, onComplete, onVideoComplete, onCapturingChange]);

  useImperativeHandle(ref, () => ({ capture: runCapture }), [runCapture]);

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_220px] lg:gap-4">
      {/* Live Preview card — mobile: first, desktop: col 1 row 1 */}
      <div className="order-1 lg:col-start-1 lg:row-start-1 flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-4">
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
              style={{ transform: "scaleX(-1)", filter: imgFilter }}
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="font-heading text-8xl font-extrabold text-white drop-shadow-lg">
                  {countdown}
                </span>
              </div>
            )}
            {recording && (
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-bold text-white">REC</span>
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
                <img src={photos[i]} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter }} />
              ) : uploadingIdx === i ? (
                <span className="text-[10px] text-[#94a3b8]">…</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Countdown Timer — mobile: below camera, desktop: col 1 row 2 */}
      <div className="order-2 lg:col-start-1 lg:row-start-2 rounded-2xl border border-[#e2e8f0] bg-white p-4">
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

      {/* Filter (passed as children) — mobile: below timer, desktop: col 1 row 3 */}
      {children && <div className="order-3 lg:col-start-1 lg:row-start-3">{children}</div>}

      {/* Your Strip card — mobile: last, desktop: col 2 spanning all rows */}
      <div className="order-4 lg:col-start-2 lg:row-start-1 lg:row-span-3 mx-auto w-full max-w-[180px] flex flex-col self-start rounded-2xl border border-[#e2e8f0] bg-white p-4 lg:max-w-none">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Your Strip</p>
        <StripPreview template={selected} photos={photos} imgFilter={imgFilter} />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

export default CameraCapture;