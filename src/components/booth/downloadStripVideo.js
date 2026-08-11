import { composeStripVideo } from "@/components/booth/stripVideoCompositor";

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Composites the recorded clips into a single strip video and downloads it.
// On mobile, uses the native share sheet so it saves straight to the
// Photos/Gallery app. The container format (mp4 vs webm) depends on what the
// device's encoder supports — mp4 is used whenever the browser can produce it.
async function shareOrSave(blob, filename) {
  const file = new File([blob], filename, { type: blob.type });

  if (isMobile() && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  if (isMobile()) {
    // Web Share isn't available/supported for this file — open it in a new
    // tab so the user can long-press "Save to Photos"/"Download video".
    window.open(url, "_blank");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export async function downloadStripVideo(template, videoUrls) {
  try {
    const { blob, ext } = await composeStripVideo(template, videoUrls);
    await shareOrSave(blob, `windy-strip.${ext}`);
  } catch (e) {
    console.error("downloadStripVideo failed, falling back to raw clip", e);
    // Compositing failed (e.g. video decoding issue) — fall back to the
    // first raw recorded clip so the user still gets a video to save.
    const fallbackUrl = videoUrls?.[0];
    if (!fallbackUrl) return;
    try {
      const res = await fetch(fallbackUrl);
      const blob = await res.blob();
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      await shareOrSave(blob, `windy-strip.${ext}`);
    } catch (e2) {
      console.error("downloadStripVideo fallback failed", e2);
    }
  }
}