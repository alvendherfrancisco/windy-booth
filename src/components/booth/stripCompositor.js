import { STRIP_SLOTS } from "@/components/booth/stripSlots";

// Renders a finished strip at the template's full native resolution by
// compositing the design asset + the user's photos directly onto a canvas.
// Photos are drawn with object-cover (center-cropped) into each slot, so any
// source dimensions/aspect ratio fit correctly. The filter is already baked
// into the uploaded photos, so no filter is applied here. Returns a PNG data URL.
function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function drawCover(ctx, img, x, y, w, h) {
  const ir = img.naturalWidth / img.naturalHeight;
  const r = w / h;
  let sw, sh, sx, sy;
  if (ir > r) {
    sh = img.naturalHeight;
    sw = sh * r;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / r;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// Returns a Promise<Blob> (JPEG) of the composited strip. Loading the design
// asset + all photos in parallel (instead of one at a time) and encoding via
// toBlob/JPEG instead of toDataURL/PNG makes this significantly faster.
export async function composeStrip(template, photos) {
  const asset = template?.canvas_asset_url || template?.thumbnail_url;
  if (!asset) throw new Error("no_template_asset");
  const [bg, ...imgs] = await Promise.all([
    loadImg(asset),
    ...[0, 1, 2].map((i) => (photos[i] ? loadImg(photos[i]) : Promise.resolve(null))),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = bg.naturalWidth;
  canvas.height = bg.naturalHeight;
  const ctx = canvas.getContext("2d");
  const slotW = canvas.width * STRIP_SLOTS.width;
  const slotX = canvas.width * STRIP_SLOTS.left;
  // Photos first (behind), then the template frame on top — the template's
  // transparent windows let the photos show through while its decorative
  // frame/graphics overlay the edges.
  for (let i = 0; i < 3; i++) {
    if (!imgs[i]) continue;
    const y = canvas.height * STRIP_SLOTS.tops[i];
    const slotH = canvas.height * STRIP_SLOTS.heights[i];
    drawCover(ctx, imgs[i], slotX, y, slotW, slotH);
  }
  ctx.drawImage(bg, 0, 0);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
}