const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Downloads a hosted Live Strip video. On mobile, uses the native share sheet
// so the user can save it straight to their Photos/Gallery app; falls back to
// a plain file download.
export async function downloadVideo(url, filename = "windy-strip.webm") {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: blob.type });

    if (isMobile() && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    console.error("downloadVideo failed", e);
    window.open(url, "_blank");
  }
}