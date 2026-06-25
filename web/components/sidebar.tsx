"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
        <rect x="1" y="1" width="5.5" height="5.5" rx="1" />
        <rect x="9.5" y="1" width="5.5" height="5.5" rx="1" />
        <rect x="1" y="9.5" width="5.5" height="5.5" rx="1" />
        <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
        <path d="M2 2h12a1 1 0 011 1v8a1 1 0 01-1 1H5L2 14V3a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0, opacity: 0.85 }}>
        <path d="M3 1h7.5L14 4.5V15H3V1z" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Search",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ flexShrink: 0 }}>
        <circle cx="6.5" cy="6.5" r="4.1" />
        <line x1="9.3" y1="9.3" x2="14" y2="14" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="2.4" />
        <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showUserMenu) return;
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUserMenu]);

  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{ width: 218, background: "#14142b" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-[14px] pt-[15px] pb-3">
        <div
          className="flex items-center justify-center flex-shrink-0 rounded-[6px]"
          style={{ width: 27, height: 27, background: "linear-gradient(135deg,#6366f1,#818cf8)" }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
            <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" />
            <rect x="9.5" y="1" width="5.5" height="5.5" rx="1.5" />
            <rect x="1" y="9.5" width="5.5" height="5.5" rx="1.5" />
            <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.5" />
          </svg>
        </div>
        <span className="text-white font-bold text-[14px] tracking-tight">Lumina</span>
        <span
          className="ml-auto text-white font-bold rounded-[3px] px-[5px] py-[1.5px]"
          style={{ background: "#6366f1", fontSize: "8.5px" }}
        >
          AI
        </span>
      </div>

      <div className="mx-3 mb-2" style={{ height: 1, background: "rgba(255,255,255,.07)" }} />

      {/* New Chat */}
      <div className="px-[10px] pb-2">
        <Link
          href="/chat"
          className="flex items-center justify-center gap-[6px] rounded-[6px] py-[7px] px-[10px] font-semibold text-[12px] transition-colors"
          style={{
            border: "1px solid rgba(99,102,241,.3)",
            background: "rgba(99,102,241,.15)",
            color: "#a5b4fc",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,.25)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,102,241,.15)")}
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          New Chat
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-[1px] px-2 flex-1">
        <div
          className="px-2 pb-[5px] pt-[3px] font-semibold uppercase tracking-widest"
          style={{ fontSize: "9.5px", color: "rgba(255,255,255,.2)", letterSpacing: ".1em" }}
        >
          Workspace
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-[5px] px-[9px] py-[6px] text-[12.5px] font-medium transition-colors"
              style={
                isActive
                  ? { background: "rgba(99,102,241,.18)", color: "#e0e7ff", fontWeight: 600 }
                  : { color: "rgba(255,255,255,.45)" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,.07)";
                  e.currentTarget.style.color = "rgba(255,255,255,.8)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,.45)";
                }
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Recent chats (only shown on chat page) */}
        {pathname.startsWith("/chat") && (
          <>
            <div
              className="px-2 pb-[5px] pt-4 font-semibold uppercase tracking-widest"
              style={{ fontSize: "9.5px", color: "rgba(255,255,255,.2)", letterSpacing: ".1em" }}
            >
              Recent
            </div>
            <div
              className="px-[9px] py-[5px] text-left"
              style={{ fontSize: "11.5px", color: "rgba(255,255,255,.28)", fontWeight: 400 }}
            >
              No recent chats
            </div>
          </>
        )}
      </nav>

      {/* User footer */}
      <div
        className="px-[10px] py-[9px]"
        style={{ borderTop: "1px solid rgba(255,255,255,.07)", position: "relative" }}
        ref={userMenuRef}
      >
        {/* User menu popup */}
        {showUserMenu && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 4px)",
              left: 10,
              right: 10,
              background: "#1e1b4b",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              boxShadow: "0 -4px 16px rgba(0,0,0,.3)",
              zIndex: 20,
              overflow: "hidden",
            }}
          >
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-[9px] text-[12.5px] font-medium transition-colors w-full"
              style={{ color: "rgba(255,255,255,.75)" }}
              onClick={() => setShowUserMenu(false)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="2.4" />
                <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7" strokeLinecap="round" />
              </svg>
              Account Settings
            </Link>
            <div style={{ height: 1, background: "rgba(255,255,255,.07)" }} />
            <button
              className="flex items-center gap-2 px-3 py-[9px] text-[12.5px] font-medium transition-colors w-full text-left"
              style={{ color: "rgba(255,255,255,.75)" }}
              onClick={() => setShowUserMenu(false)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2h3a1 1 0 011 1v10a1 1 0 01-1 1h-3" />
                <path d="M7 11l4-3-4-3v6z" />
              </svg>
              Sign Out
            </button>
          </div>
        )}

        <button
          className="flex items-center gap-2 rounded-[5px] px-2 py-[6px] w-full transition-colors"
          onClick={() => setShowUserMenu((v) => !v)}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 27, height: 27, background: "linear-gradient(135deg,#6366f1,#a78bfa)" }}
          >
            <span className="text-white font-bold" style={{ fontSize: 10 }}>JD</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[12px] font-semibold truncate" style={{ color: "#e0e7ff" }}>Jane Doe</div>
            <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,.32)" }}>Finance Analyst</div>
          </div>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10l4-4 4 4" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
