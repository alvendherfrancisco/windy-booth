// Shared photo-slot layout for the strip templates, measured from the
// actual Canva template assets (all 9 share the same 3:1 layout).
// Coordinates are fractions of the strip canvas: left/width relative to
// the canvas width; tops/height relative to the canvas height.
// Slots extend to the outer edge of each photo window so the photo covers
// the template's black border (no black lining around the captured photos).
export const STRIP_SLOTS = {
  left: 0.0293,
  width: 0.9384,
  height: 0.2696,
  tops: [0.0156, 0.2939, 0.5732],
};