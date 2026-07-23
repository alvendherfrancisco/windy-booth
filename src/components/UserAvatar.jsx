import React from "react";
import { Image } from "@/components/ui/image";

function initialsOf(user) {
  const name = (user?.full_name || user?.email || "").trim();
  if (!name) return "?";
  if (user?.full_name) {
    const parts = user.full_name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return name[0].toUpperCase();
}

const SIZES = {
  sm: "h-9 w-9 text-[11px]",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-2xl",
};

export default function UserAvatar({ user, size = "md", className = "" }) {
  const cls = SIZES[size] || SIZES.md;
  if (user?.avatar_url) {
    return (
      <span className={`relative inline-flex shrink-0 overflow-hidden rounded-full bg-[#EEF2FF] ${cls} ${className}`}>
        <Image
          src={user.avatar_url}
          alt={user?.full_name || "avatar"}
          className="h-full w-full"
          fittingType="fill"
        />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] font-heading font-extrabold text-[#4F46E5] ${cls} ${className}`}
    >
      {initialsOf(user)}
    </span>
  );
}