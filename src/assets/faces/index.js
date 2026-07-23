// Cleaned, recolorable face doodle SVGs (tightened viewBox, fill="currentColor").
// Imported as raw strings so they inline into the DOM and inherit CSS `color`
// via currentColor — letting the same set render white on the pink hero and
// pink on light empty/success states for a consistent brand texture.
import pigtails from "./pigtails.svg?raw";
import wavy from "./wavy.svg?raw";
import spiky from "./spiky.svg?raw";
import afro from "./afro.svg?raw";
import short from "./short.svg?raw";
import buns from "./buns.svg?raw";
import bangs from "./bangs.svg?raw";
import messy from "./messy.svg?raw";
import pony from "./pony.svg?raw";

export const FACE_RAW = [pigtails, wavy, spiky, afro, short, buns, bangs, messy, pony];

// Inject sizing so an inlined <svg> fills its positioned box.
export function faceSvgHtml(raw) {
  return raw.replace("<svg ", '<svg width="100%" height="100%" style="display:block" ');
}