export const FILTERS = [
  { label: "None",    value: "none",    css: "none" },
  { label: "B&W",     value: "bw",      css: "grayscale(100%)" },
  { label: "Sepia",   value: "sepia",   css: "sepia(80%)" },
  { label: "Vintage", value: "vintage", css: "sepia(40%) contrast(90%) brightness(90%)" },
  { label: "Vivid",   value: "vivid",   css: "saturate(180%) contrast(110%)" },
  { label: "Cool",    value: "cool",    css: "hue-rotate(30deg) saturate(120%)" },
  { label: "Warm",    value: "warm",    css: "sepia(20%) saturate(140%) brightness(105%)" },
];

export const filterCss = (value) => FILTERS.find(f => f.value === value)?.css || "none";