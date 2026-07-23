import React from "react";

export default function StickyAction({ children }) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-[#E8E2D8] md:bottom-0 md:left-20 bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-5xl px-4 py-4 md:px-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </div>
    </div>);

}