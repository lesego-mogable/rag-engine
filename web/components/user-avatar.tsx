"use client";

import { useSession } from "next-auth/react";

export function UserAvatar({ size = 28 }: { size?: number }) {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div
      className="flex items-center justify-center rounded-full cursor-pointer flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg,#6366f1,#a78bfa)",
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.36 }}>
        {initials}
      </span>
    </div>
  );
}
