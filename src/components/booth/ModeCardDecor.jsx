import React from "react";

// Five-petal flower tile matching the Windy the Pooh brand banner:
// cream-yellow petals (#FEF9A7) with a medium-blue outline (#5B86E5)
// and a solid blue center, arranged in a staggered grid.
const FLOWER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">' +
  '<g fill="#FEF9A7" stroke="#5B86E5" stroke-width="1.5">' +
  '<g transform="translate(20 20)">' +
  '<ellipse cx="0" cy="-12" rx="8" ry="13"/>' +
  '<ellipse cx="0" cy="-12" rx="8" ry="13" transform="rotate(72)"/>' +
  '<ellipse cx="0" cy="-12" rx="8" ry="13" transform="rotate(144)"/>' +
  '<ellipse cx="0" cy="-12" rx="8" ry="13" transform="rotate(216)"/>' +
  '<ellipse cx="0" cy="-12" rx="8" ry="13" transform="rotate(288)"/>' +
  "</g>" +
  '<g transform="translate(60 60)">' +
  '<ellipse cx="0" cy="-12" rx="8" ry="13"/>' +
  '<ellipse cx="0" cy="-12" rx="8" ry="13" transform="rotate(72)"/>' +
  '<ellipse cx="0" cy="-12" rx="8" ry="13" transform="rotate(144)"/>' +
  '<ellipse cx="0" cy="-12" rx="8" ry="13" transform="rotate(216)"/>' +
  '<ellipse cx="0" cy="-12" rx="8" ry="13" transform="rotate(288)"/>' +
  "</g>" +
  "</g>" +
  '<circle cx="20" cy="20" r="5" fill="#5B86E5"/>' +
  '<circle cx="60" cy="60" r="5" fill="#5B86E5"/>' +
  "</svg>";

const FLOWER_PATTERN = `data:image/svg+xml,${encodeURIComponent(FLOWER_SVG)}`;

export default function ModeCardDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{
        backgroundImage: `url("${FLOWER_PATTERN}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "52px 52px",
        opacity: 0.15,
      }}
    />
  );
}