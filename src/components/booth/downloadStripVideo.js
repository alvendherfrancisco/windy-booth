import { composeStripVideo } from "@/components/booth/stripVideoCompositor";

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Composites the recorded clips into a single strip video and downloads it.
// On mobile, uses the native share sheet so it saves straight to the
// Photos/Gallery app. The container format (mp4 vs webm) depends on what the
// device's encoder supports — mp4 is used whenever the browser can produce it.
export async function downloadStripVideo(template, videoUrls) {
  try {
    const { blob, ext } = await composeStripVideo(template, videoUrls);
    const filename = `windy-strip.${ext}`;
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
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("downloadStripVideo failed", e);
  }
}