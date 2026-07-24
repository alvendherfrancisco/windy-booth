// Shared photo-slot layout for the strip templates, measured pixel-precise
// from the actual Canva template assets (all 9 share the same 3:1 layout).
// Coordinates are fractions of the strip canvas: left/width relative to
// the canvas width; tops/heights relative to the canvas height.
// Each slot fills its photo window flush to the inner edge of the frame —
// no black lining, no overlap with the decorative border.
export const STRIP_SLOTS = {
  left: 0.0557,
  width: 0.8886,
  heights: [0.2539, 0.2539, 0.2529],
  tops: [0.0244, 0.3027, 0.5811],
};