"use client";

import { useState } from "react";
import { SourcesPanel } from "./sources-panel";

const sources = [
  {
    id: 1,
    filename: "Q3_Earnings_2024.pdf",
    pages: "pp. 12–14",
    excerpt:
      "Total Q3 revenue of $4.74B represents a significant YoY increase of 22.3%. Cloud services contributed $1.82B (+31%), while enterprise licensing reached $2.08B.",
  },
  {
    id: 2,
    filename: "Executive_Summary_Q3.pdf",
    pages: "pp. 3–5",
    excerpt:
      "The executive team noted this quarter as a turning point for operating leverage, with EBITDA margins expanding 340bps to 28.6% on disciplined cost management.",
  },
  {
    id: 3,
    filename: "Annual_Report_2024.pdf",
    pages: "p. 48",
    excerpt:
      "Historical revenue breakdown demonstrates consistent growth across all segments, with cloud services now representing 38% of total revenue.",
  },
];

export function ChatView() {
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <div
          className="flex items-center gap-2 px-[18px] flex-shrink-0"
          style={{
            height: 52,
            background: "#fff",
            borderBottom: "1px solid #e5e7f2",
          }}
        >
          <span className="flex-1 text-[15px] font-bold" style={{ color: "#1e1b4b" }}>
            Q3 Revenue Analysis
          </span>
          <button
            className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[12px] font-medium transition-colors"
            style={{ border: "1px solid #e5e7f2", color: "#6b7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 3v10M3 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            History
          </button>
          <button
            className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[12px] font-semibold text-white transition-colors"
            style={{ background: "#6366f1" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
            New Chat
          </button>
          <button className="relative" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <path d="M8 1.5a4.5 4.5 0 014.5 4.5c0 2.5.7 4 1.5 5H2c.8-1 1.5-2.5 1.5-5A4.5 4.5 0 018 1.5z" strokeLinejoin="round" />
              <path d="M6.5 13a1.5 1.5 0 003 0" strokeLinecap="round" />
            </svg>
            <span
              className="absolute rounded-full"
              style={{
                width: 5,
                height: 5,
                background: "#6366f1",
                top: 0,
                right: 0,
              }}
            />
          </button>
          <div
            className="flex items-center justify-center rounded-full cursor-pointer"
            style={{
              width: 28,
              height: 28,
              background: "linear-gradient(135deg,#6366f1,#a78bfa)",
            }}
          >
            <span className="text-white font-bold" style={{ fontSize: 10 }}>JD</span>
          </div>
        </div>

        {/* Chat feed */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin" style={{ background: "#f0f3fc" }}>
          {/* Timestamp divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1" style={{ height: 1, background: "#e5e7f2" }} />
            <span className="text-[11px] font-medium" style={{ color: "#94a3b8" }}>
              Today, 10:42 AM
            </span>
            <div className="flex-1" style={{ height: 1, background: "#e5e7f2" }} />
          </div>

          {/* User message */}
          <div className="flex justify-end mb-4">
            <div
              className="rounded-[14px] rounded-br-[4px] px-[14px] py-[10px] max-w-[70%]"
              style={{ background: "#6366f1" }}
            >
              <p className="text-white text-[13.5px] leading-[1.55]">
                Can you give me a detailed breakdown of Q3 revenue by business segment, including YoY growth rates?
              </p>
            </div>
          </div>

          {/* Lumina response */}
          <div className="mb-4 max-w-[85%]">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex items-center justify-center rounded-[5px] flex-shrink-0"
                style={{
                  width: 22,
                  height: 22,
                  background: "linear-gradient(135deg,#6366f1,#818cf8)",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="white">
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" />
                  <rect x="9.5" y="1" width="5.5" height="5.5" rx="1.5" />
                  <rect x="1" y="9.5" width="5.5" height="5.5" rx="1.5" />
                  <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.5" />
                </svg>
              </div>
              <span className="text-[12.5px] font-semibold" style={{ color: "#1e1b4b" }}>Lumina</span>
              <span className="text-[11px]" style={{ color: "#94a3b8" }}>10:42 AM</span>
            </div>
            <div
              className="rounded-[14px] rounded-tl-[4px] px-[16px] py-[13px]"
              style={{ background: "#fff", border: "1px solid #e5e7f2" }}
            >
              <p className="text-[13.5px] leading-[1.65]" style={{ color: "#374151" }}>
                Based on the Q3 2024 earnings reports
                <SourceBadge num={1} onClick={() => setSourcesOpen(true)} />, here is the complete revenue breakdown by segment:
              </p>
              <div className="mt-3 mb-3 space-y-2">
                {[
                  { label: "Enterprise Licensing", value: "$2.08B", growth: "+18.2%", color: "#6366f1", bg: "#eef1ff" },
                  { label: "Cloud Services", value: "$1.82B", growth: "+31.4%", color: "#10b981", bg: "#d1fae5" },
                  { label: "Professional Services", value: "$840M", growth: "+12.7%", color: "#f59e0b", bg: "#fef3c7" },
                ].map((seg) => (
                  <div
                    key={seg.label}
                    className="flex items-center justify-between rounded-[7px] px-3 py-2"
                    style={{ background: "#f8f9ff", border: "1px solid #e5e7f2" }}
                  >
                    <span className="text-[12.5px] font-medium" style={{ color: "#374151" }}>{seg.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[12.5px] font-bold" style={{ color: "#1e1b4b" }}>{seg.value}</span>
                      <span
                        className="text-[11px] font-semibold rounded-[4px] px-[6px] py-[1px]"
                        style={{ color: seg.color, background: seg.bg }}
                      >
                        {seg.growth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[13.5px] leading-[1.65]" style={{ color: "#374151" }}>
                Total Q3 revenue reached <strong>$4.74B</strong>, representing a 22.3% YoY increase
                <SourceBadge num={2} onClick={() => setSourcesOpen(true)} />. Cloud services remains the highest-growth segment at 31.4%, reflecting continued enterprise adoption
                <SourceBadge num={3} onClick={() => setSourcesOpen(true)} />.
              </p>

              {/* Sources footer */}
              <div
                className="flex items-center gap-2 mt-3 pt-3 flex-wrap"
                style={{ borderTop: "1px solid #e5e7f2" }}
              >
                <span className="text-[11px]" style={{ color: "#94a3b8" }}>Sources:</span>
                {sources.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSourcesOpen(true)}
                    className="flex items-center gap-1 rounded-[4px] px-[6px] py-[2px] text-[11px] font-medium transition-colors"
                    style={{
                      background: "#f0f3fc",
                      border: "1px solid #e5e7f2",
                      color: "#64748b",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#eef1ff";
                      e.currentTarget.style.borderColor = "#c7d2f6";
                      e.currentTarget.style.color = "#6366f1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f0f3fc";
                      e.currentTarget.style.borderColor = "#e5e7f2";
                      e.currentTarget.style.color = "#64748b";
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.6 }}>
                      <path d="M3 1h7.5L14 4.5V15H3V1z" />
                    </svg>
                    {s.filename}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-2 pl-1">
              {[
                { label: "Copy", icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" strokeLinecap="round"/></svg> },
                { label: "Regenerate", icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8a6 6 0 1011.66-2M2 8V4m0 4H6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                { label: "Share", icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="4" r="1.5"/><circle cx="4" cy="8" r="1.5"/><circle cx="12" cy="12" r="1.5"/><path d="M5.5 7l5-2M5.5 9l5 2" strokeLinecap="round"/></svg> },
              ].map((btn) => (
                <button
                  key={btn.label}
                  className="flex items-center gap-1 rounded-[5px] px-[8px] py-[4px] text-[11.5px] font-medium transition-colors"
                  style={{ color: "#94a3b8", background: "transparent" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "#6366f1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#94a3b8";
                  }}
                >
                  {btn.icon}
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{ background: "#fff", borderTop: "1px solid #e5e7f2" }}
        >
          <div
            className="flex items-end gap-3 rounded-[12px] px-4 py-3"
            style={{ border: "1.5px solid #e5e7f2", background: "#fafbff" }}
          >
            <textarea
              rows={1}
              placeholder="Ask about any document in your knowledge base…"
              className="flex-1 resize-none bg-transparent outline-none text-[13.5px] leading-[1.5]"
              style={{ color: "#1e1b4b", minHeight: 22 }}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className="flex items-center justify-center rounded-[6px] transition-colors"
                style={{ width: 28, height: 28, color: "#94a3b8" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                aria-label="Attach file"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13.5 8L7.5 14a4 4 0 01-5.5-5.5l6-6a2.5 2.5 0 013.5 3.5l-6 6a1 1 0 01-1.5-1.5l5.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="flex items-center justify-center rounded-[7px] text-white font-semibold text-[12px] transition-colors"
                style={{ width: 32, height: 32, background: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
                aria-label="Send"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2L2 8l5 2 2 5 5-13z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] mt-2" style={{ color: "#94a3b8" }}>
            Lumina answers from your indexed documents only · 1,240 docs available
          </p>
        </div>
      </div>

      {/* Sources panel toggle strip */}
      {!sourcesOpen && (
        <button
          onClick={() => setSourcesOpen(true)}
          className="flex flex-col items-center justify-center flex-shrink-0 transition-colors"
          style={{
            width: 36,
            background: "#fff",
            borderLeft: "1px solid #e5e7f2",
            color: "#94a3b8",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          aria-label="Show sources"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      )}

      {/* Sources panel */}
      {sourcesOpen && <SourcesPanel sources={sources} onClose={() => setSourcesOpen(false)} />}
    </div>
  );
}

function SourceBadge({ num, onClick }: { num: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-[4px] mx-[2px] font-semibold align-middle transition-colors"
      style={{
        width: 16,
        height: 16,
        fontSize: 9,
        background: "#eef1ff",
        color: "#6366f1",
        border: "1px solid #c7d2f6",
        verticalAlign: "middle",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#6366f1") && (e.currentTarget.style.color = "#fff")}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#eef1ff";
        e.currentTarget.style.color = "#6366f1";
      }}
    >
      {num}
    </button>
  );
}
