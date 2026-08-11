import { STRIP_SLOTS } from "@/components/booth/stripSlots";

// Composites the 3 recorded video clips into the strip layout (template
// design overlaid on top, same slots as the photo compositor) and records
// the result at 2x playback speed into a single downloadable webm video.
function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function loadVideo(src) {
  return new Promise((res, rej) => {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.muted = true;
    v.playsInline = true;
    v.src = src;
    v.onloadedmetadata = () => res(v);
    v.onerror = rej;
  });
}

function drawCover(ctx, media, w0, h0, x, y, w, h) {
  const ir = w0 / h0;
  const r = w / h;
  let sw, sh, sx, sy;
  if (ir > r) { sh = h0; sw = sh * r; sx = (w0 - sw) / 2; sy = 0; }
  else { sw = w0; sh = sw / r; sx = 0; sy = (h0 - sh) / 2; }
  ctx.drawImage(media, sx, sy, sw, sh, x, y, w, h);
}

// Returns a Promise<Blob> (webm) of the final strip video, playing the 3
// clips (mirrored to match the selfie preview) at 2x speed.
export async function compositeLiveStrip(template, videoUrls) {
  const asset = template?.canvas_asset_url || template?.thumbnail_url;
  if (!asset) throw new Error("no_template_asset");
  const [bg, ...videos] = await Promise.all([
    loadImg(asset),
    ...[0, 1, 2].map(i => (videoUrls[i] ? loadVideo(videoUrls[i]) : Promise.resolve(null))),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = bg.naturalWidth;
  canvas.height = bg.naturalHeight;
  const ctx = canvas.getContext("2d");
  const slotW = canvas.width * STRIP_SLOTS.width;
  const slotX = canvas.width * STRIP_SLOTS.left;

  videos.forEach(v => { if (v) v.playbackRate = 2; });
  await Promise.all(videos.map(v => (v ? v.play().catch(() => {}) : null)));

  const mimeType = MediaRecorder.isTypeSupported("video/mp4")
    ? "video/mp4"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
  const outputType = mimeType.startsWith("video/mp4") ? "video/mp4" : "video/webm";
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  const donePromise = new Promise(resolve => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: outputType }));
  });

  // Recorded webm clips often report duration as Infinity (MediaRecorder container
  // quirk), so don't rely on video.duration — each clip was recorded for a fixed
  // length in CameraCapture, so use that known length instead.
  const CLIP_DURATION_MS = 1200;
  const recordMs = CLIP_DURATION_MS / 2; // halved for 2x speed

  recorder.start();
  let raf;
  const draw = () => {
    for (let i = 0; i < 3; i++) {
      const v = videos[i];
      if (!v) continue;
      const y = canvas.height * STRIP_SLOTS.tops[i];
      const slotH = canvas.height * STRIP_SLOTS.heights[i];
      ctx.save();
      ctx.translate(slotX + slotW, y);
      ctx.scale(-1, 1);
      drawCover(ctx, v, v.videoWidth, v.videoHeight, 0, 0, slotW, slotH);
      ctx.restore();
    }
    ctx.drawImage(bg, 0, 0);
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);

  setTimeout(() => {
    cancelAnimationFrame(raf);
    videos.forEach(v => v && v.pause());
    recorder.stop();
  }, recordMs);

  return donePromise;
}