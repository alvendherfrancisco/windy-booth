import { composeStrip } from "@/components/booth/stripCompositor";

// Shares the finished strip to Instagram (Story/Feed) via the native share
// sheet when supported. Falls back to saving the image + opening Instagram.
// The filter is already baked into the uploaded photos.
export async function shareToInstagram(template, photos) {
  const blob = await composeStrip(template, photos);
  const file = new File([blob], "windy-strip.jpg", { type: blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        text: "Made with windy the pooh 🌸",
        title: "My windy the pooh strip",
      });
      return "shared";
    } catch (e) {
      if (e && e.name === "AbortError") return "cancelled";
    }
  }
  // Fallback: download the strip and open Instagram so the user can post it.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "windy-strip.jpg";
  a.click();
  URL.revokeObjectURL(url);
  window.open("https://www.instagram.com", "_blank");
  return "fallback";
}