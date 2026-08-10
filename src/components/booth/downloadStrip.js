import { composeStrip } from "@/components/booth/stripCompositor";

// Downloads the real, full-resolution strip for the given template + photos.
// Photos already have the filter baked in at upload time, so no filter needs
// to be applied here. Falls back to the first photo if canvas compositing
// fails (e.g. CORS).
export async function downloadStrip(template, photos, filename = "windy-strip.png") {
  try {
    const dataUrl = await composeStrip(template, photos);
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