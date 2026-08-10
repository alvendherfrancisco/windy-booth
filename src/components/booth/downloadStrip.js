import { composeStrip } from "@/components/booth/stripCompositor";

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Downloads the real, full-resolution strip for the given template + photos.
// Photos already have the filter baked in at upload time, so no filter needs
// to be applied here. On mobile, uses the native share sheet so the user can
// save the image straight to their Photos/Gallery app; falls back to a plain
// file download (and to the first photo if canvas compositing fails, e.g. CORS).
export async function downloadStrip(template, photos, filename = "windy-strip.jpg") {
  try {
    const blob = await composeStrip(template, photos);
    const file = new File([blob], filename, { type: blob.type });

    if (isMobile() && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
        // fall through to a direct file download below
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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