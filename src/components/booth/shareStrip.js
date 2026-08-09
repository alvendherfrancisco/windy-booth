import { composeStrip } from "@/components/booth/stripCompositor";

function dataUrlToFile(dataUrl, filename) {
  const [meta, b64] = dataUrl.split(",");
  const mime = (meta.match(/data:(.*?);/) || [, "image/png"])[1];
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

// Shares the finished strip to Instagram (Story/Feed) via the native share
// sheet when supported. Falls back to saving the image + opening Instagram.
export async function shareToInstagram(template, photos) {
  const dataUrl = await composeStrip(template, photos);
  const file = dataUrlToFile(dataUrl, "vendi-strip.png");
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
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "vendi-strip.png";
  a.click();
  window.open("https://www.instagram.com", "_blank");
  return "fallback";
}