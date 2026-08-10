import { STRIP_SLOTS } from "@/components/booth/stripSlots";

// Renders a finished strip at the template's full native resolution by
// compositing the design asset + the user's photos directly onto a canvas.
// Photos are drawn with object-cover (center-cropped) into each slot, so any
// source dimensions/aspect ratio fit correctly. The filter CSS is applied
// to the photos only (not the template frame). Returns a PNG data URL.
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

export async function composeStrip(template, photos, filterCssValue = "none") {
  const asset = template?.thumbnail_url || template?.canvas_asset_url;
  if (!asset) throw new Error("no_template_asset");
  const bg = await loadImg(asset);
  const canvas = document.createElement("canvas");
  canvas.width = bg.naturalWidth;
  canvas.height = bg.naturalHeight;
  const ctx = canvas.getContext("2d");
  const slotW = canvas.width * STRIP_SLOTS.width;
  const slotX = canvas.width * STRIP_SLOTS.left;
  // Photos first (behind) with the filter applied, then the template frame on
  // top without filter — the template's transparent windows let the filtered
  // photos show through while its decorative frame/graphics overlay the edges.
  for (let i = 0; i < 3; i++) {
    if (!photos[i]) continue;
    const img = await loadImg(photos[i]);
    const y = canvas.height * STRIP_SLOTS.tops[i];
    const slotH = canvas.height * STRIP_SLOTS.heights[i];
    ctx.filter = filterCssValue;
    drawCover(ctx, img, slotX, y, slotW, slotH);
  }
  ctx.filter = "none";
  ctx.drawImage(bg, 0, 0);
  return canvas.toDataURL("image/png");
}