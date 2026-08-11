import { STRIP_SLOTS } from "@/components/booth/stripSlots";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function loadVideo(src) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.src = src;
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject(new Error("video_load_failed"));
    video.load();
  });
}

function drawCover(ctx, media, mw, mh, x, y, w, h) {
  const ir = mw / mh;
  const r = w / h;
  let sw, sh, sx, sy;
  if (ir > r) { sh = mh; sw = sh * r; sx = (mw - sw) / 2; sy = 0; }
  else { sw = mw; sh = sw / r; sx = 0; sy = (mh - sh) / 2; }
  ctx.drawImage(media, sx, sy, sw, sh, x, y, w, h);
}

const RECORD_MS = 3000;
const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

function pickMimeType() {
  return MIME_CANDIDATES.find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";
}

// Composites the template + the three recorded video clips into a single
// looping strip video, by drawing each clip's current frame onto a canvas
// and re-encoding via MediaRecorder. Uses mp4 when the device's encoder
// supports it, otherwise falls back to webm. Returns { blob, ext }.
export async function composeStripVideo(template, videoUrls) {
  const asset = template?.canvas_asset_url || template?.thumbnail_url;
  if (!asset) throw new Error("no_template_asset");
  const [bg, ...videos] = await Promise.all([
    loadImage(asset),
    ...[0, 1, 2].map((i) => (videoUrls[i] ? loadVideo(videoUrls[i]) : Promise.resolve(null))),
  ]);
  await Promise.all(videos.map((v) => v && v.play().catch(() => {})));

  const canvas = document.createElement("canvas");
  canvas.width = bg.naturalWidth;
  canvas.height = bg.naturalHeight;
  const ctx = canvas.getContext("2d");
  const slotW = canvas.width * STRIP_SLOTS.width;
  const slotX = canvas.width * STRIP_SLOTS.left;

  const mimeType = pickMimeType();
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  let raf;
  const draw = () => {
    for (let i = 0; i < 3; i++) {
      const v = videos[i];
      if (!v) continue;
      const y = canvas.height * STRIP_SLOTS.tops[i];
      const slotH = canvas.height * STRIP_SLOTS.heights[i];
      drawCover(ctx, v, v.videoWidth, v.videoHeight, slotX, y, slotW, slotH);
    }
    ctx.drawImage(bg, 0, 0);
    raf = requestAnimationFrame(draw);
  };

  const stopped = new Promise((resolve) => { recorder.onstop = resolve; });
  recorder.start();
  draw();
  await new Promise((r) => setTimeout(r, RECORD_MS));
  cancelAnimationFrame(raf);
  recorder.stop();
  await stopped;
  videos.forEach((v) => v && v.pause());

  const finalMime = recorder.mimeType || mimeType || "video/webm";
  const blob = new Blob(chunks, { type: finalMime });
  const ext = finalMime.includes("mp4") ? "mp4" : "webm";
  return { blob, ext };
}