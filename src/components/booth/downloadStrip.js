import { composeStrip } from "@/components/booth/stripCompositor";

// Downloads the real, full-resolution strip for the given template + photos.
// The filter CSS is applied during compositing so the downloaded image matches
// what the user sees on screen. Falls back to the first photo if canvas
// compositing fails (e.g. CORS).
export async function downloadStrip(template, photos, filterCssValue = "none", filename = "windy-strip.png") {
  try {
    const dataUrl = await composeStrip(template, photos, filterCssValue);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  } catch (e) {
    console.error("downloadStrip failed", e);
    if (photos?.[0]) {
      const a = document.createElement("a");
      a.href = photos[0];
      a.download = filename;
      a.click();
    }
  }
}