// Bakes a filter into an image File via pixel manipulation (getImageData /
// putImageData) so it works in every browser — no dependency on the Canvas
// ctx.filter property. Returns a new JPEG File with the filter applied.
// For "none" or unknown filters the original file is returned unchanged.

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = 0; s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

const clamp = (v) => Math.min(255, Math.max(0, v));

// Adds subtle random film grain (like a Lightroom grain edit) by jittering each pixel.
function addGrain(d, amount = 18) {
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * amount;
    d[i] = clamp(d[i] + noise);
    d[i + 1] = clamp(d[i + 1] + noise);
    d[i + 2] = clamp(d[i + 2] + noise);
  }
}

const FILTERS = {
  bw: (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      d[i] = d[i + 1] = d[i + 2] = gray;
    }
  },
  sepia: (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      d[i]     = clamp(r + (sr - r) * 0.8);
      d[i + 1] = clamp(g + (sg - g) * 0.8);
      d[i + 2] = clamp(b + (sb - b) * 0.8);
    }
  },
  vintage: (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      let nr = r + (sr - r) * 0.4;
      let ng = g + (sg - g) * 0.4;
      let nb = b + (sb - b) * 0.4;
      nr = (nr - 128) * 0.9 + 128;
      ng = (ng - 128) * 0.9 + 128;
      nb = (nb - 128) * 0.9 + 128;
      nr *= 0.9; ng *= 0.9; nb *= 0.9;
      d[i] = clamp(nr); d[i + 1] = clamp(ng); d[i + 2] = clamp(nb);
    }
    addGrain(d, 20);
  },
  vivid: (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      let nr = gray + (r - gray) * 1.8;
      let ng = gray + (g - gray) * 1.8;
      let nb = gray + (b - gray) * 1.8;
      nr = (nr - 128) * 1.1 + 128;
      ng = (ng - 128) * 1.1 + 128;
      nb = (nb - 128) * 1.1 + 128;
      d[i] = clamp(nr); d[i + 1] = clamp(ng); d[i + 2] = clamp(nb);
    }
  },
  cool: (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const [h, s, l] = rgbToHsl(d[i], d[i + 1], d[i + 2]);
      const newH = (h + 30 / 360) % 1;
      const newS = Math.min(1, s * 1.2);
      const [r, g, b] = hslToRgb(newH, newS, l);
      d[i] = clamp(r); d[i + 1] = clamp(g); d[i + 2] = clamp(b);
    }
  },
  warm: (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      let nr = r + (sr - r) * 0.2;
      let ng = g + (sg - g) * 0.2;
      let nb = b + (sb - b) * 0.2;
      const gray = nr * 0.299 + ng * 0.587 + nb * 0.114;
      nr = gray + (nr - gray) * 1.4;
      ng = gray + (ng - gray) * 1.4;
      nb = gray + (nb - gray) * 1.4;
      nr *= 1.05; ng *= 1.05; nb *= 1.05;
      d[i] = clamp(nr); d[i + 1] = clamp(ng); d[i + 2] = clamp(nb);
    }
  },
};

export async function bakeFilter(file, filterValue) {
  const filterFn = FILTERS[filterValue];
  if (!filterFn) return file;

  const img = new Image();
  const url = URL.createObjectURL(file);
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || 640;
  canvas.height = img.naturalHeight || 480;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  filterFn(imageData.data);
  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.95));
  return new File([blob], `windy-${Date.now()}.jpg`, { type: "image/jpeg" });
}