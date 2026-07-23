import html2canvas from "html2canvas";

// Renders a StripPreview DOM element to a PNG and triggers a download.
// Falls back to a direct photo URL if canvas rendering fails (e.g. CORS).
export async function downloadStrip(element, filename = "vendi-strip.png", fallbackUrl) {
  if (!element) return;
  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = filename;
    a.click();
  } catch (e) {
    console.error("downloadStrip failed", e);
    if (fallbackUrl) {
      const a = document.createElement("a");
      a.href = fallbackUrl;
      a.download = filename;
      a.click();
    }
  }
}