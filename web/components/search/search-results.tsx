"use client";

import { useState } from "react";

const results = [
  {
    filename: "Q3_2024_Earnings_Report.pdf",
    category: "Financial Reports",
    date: "Oct 3, 2024",
    pages: "pp. 12–14",
    score: "97%",
    excerpt:
      "...the Q3 revenue figures represent a significant milestone. Total revenue breakdown by segment shows cloud services leading at $1.82B, followed by professional services at $840M and enterprise licensing at $2.08B...",
    highlights: ["Q3 revenue", "revenue breakdown"],
  },
  {
    filename: "Executive_Summary_Q3.pdf",
    category: "Executive Communications",
    date: "Oct 5, 2024",
    pages: "pp. 3–5",
    score: "94%",
    excerpt:
      "...total Q3 revenue of $4.74B with a detailed breakdown by geography and product line. The executive team noted this quarter as a turning point for operating leverage...",
    highlights: ["Q3 revenue", "breakdown"],
  },
  {
    filename: "Annual_Report_2024.pdf",
    category: "Financial Reports",
    date: "Jan 15, 2024",
    pages: "p. 48",
    score: "88%",
    excerpt:
      "...historical revenue breakdown across fiscal quarters demonstrates consistent growth. The FY2024 outlook includes projected Q3 acceleration of 10–14% YoY across all major segments...",
    highlights: ["revenue breakdown", "Q3"],
  },
  {
    filename: "APAC_Regional_Report_Q3.pdf",
    category: "Regional Reports",
    date: "Oct 12, 2024",
    pages: "pp. 6–9",
    score: "82%",
    excerpt:
      "...APAC segment revenue breakdown for Q3 2024 shows Singapore contributing $420M (+38%) and Australia $380M (+24%) as primary growth drivers in the region...",
    highlights: ["revenue breakdown", "Q3"],
  },
];

function highlightText(text: string, highlights: string[]) {
  let result = text;
  const parts: React.ReactNode[] = [];
  let remaining = text;

  const regex = new RegExp(`(${highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const splitParts = remaining.split(regex);

  return splitParts.map((part, i) => {
    const isHighlight = highlights.some((h) => h.toLowerCase() === part.toLowerCase());
    return isHighlight ? (
      <mark
        key={i}
        style={{ background: "#fef9c3", color: "#92400e", padding: "0 2px", borderRadius: 2 }}
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    );
  });
}

export function SearchResults() {
  const [query, setQuery] = useState("Q3 revenue breakdown");
  const [activeFilters, setActiveFilters] = useState<string[]>(["PDF", "Last 90 days"]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Topbar */}
      <div
        className="flex items-center gap-2 px-[18px] flex-shrink-0"
        style={{ height: 52, background: "#fff", borderBottom: "1px solid #e5e7f2" }}
      >
        <span className="flex-1 text-[15px] font-bold" style={{ color: "#1e1b4b" }}>
          Search
        </span>
        <div
          className="flex items-center justify-center rounded-full cursor-pointer"
          style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6366f1,#a78bfa)" }}
        >
          <span className="text-white font-bold" style={{ fontSize: 10 }}>JD</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-[18px] scrollbar-thin space-y-[14px]">
        {/* Search bar */}
        <div className="flex gap-2">
          <div
            className="flex-1 flex items-center gap-[10px] rounded-[9px] px-[14px] py-[10px]"
            style={{
              background: "#fff",
              border: "1.5px solid #6366f1",
              boxShadow: "0 0 0 3px rgba(99,102,241,.08)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="1.7">
              <circle cx="6.5" cy="6.5" r="4.1" />
              <line x1="9.3" y1="9.3" x2="14" y2="14" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[13.5px] font-medium"
              style={{ color: "#1e1b4b" }}
              placeholder="Search your documents…"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="flex items-center justify-center rounded-[4px]"
                style={{ width: 18, height: 18, background: "#f0f3fc" }}
                aria-label="Clear"
              >
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="3" y1="3" x2="13" y2="13" />
                  <line x1="13" y1="3" x2="3" y2="13" />
                </svg>
              </button>
            )}
          </div>
          <button
            className="rounded-[8px] px-[18px] py-[10px] text-[13px] font-semibold text-white transition-colors"
            style={{ background: "#6366f1" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
          >
            Search
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-[6px] flex-wrap">
          <span className="text-[12px] font-medium" style={{ color: "#64748b" }}>Filter:</span>
          <button
            className="rounded-full px-[10px] py-[4px] text-[12px] font-medium transition-colors"
            style={{ background: "#fff", border: "1px solid #e5e7f2", color: "#64748b" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#c7d2f6";
              e.currentTarget.style.color = "#6366f1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7f2";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            All Types
          </button>
          {["PDF", "Last 90 days"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilters((f) => f.filter((x) => x !== filter))}
              className="flex items-center gap-1 rounded-full px-[10px] py-[4px] text-[12px] font-semibold"
              style={{ background: "#eef1ff", border: "1px solid #c7d2f6", color: "#4f46e5" }}
            >
              {filter}{" "}
              <span style={{ opacity: 0.6 }}>✕</span>
            </button>
          ))}
          <button
            className="rounded-full px-[10px] py-[4px] text-[12px] font-medium transition-colors"
            style={{ background: "#fff", border: "1px solid #e5e7f2", color: "#6366f1" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#eef1ff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            + Add filter
          </button>
          <div className="ml-auto flex items-center gap-1 text-[12px] font-medium" style={{ color: "#94a3b8" }}>
            <span className="font-semibold" style={{ color: "#1e1b4b" }}>128 results</span>
            &nbsp;·&nbsp; Sort:
            <button
              className="font-semibold transition-colors"
              style={{ color: "#6366f1" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}
            >
              Relevance ↓
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-[10px]">
          {results.map((result, i) => (
            <div
              key={i}
              className="rounded-[8px] px-4 py-[14px] cursor-pointer transition-all"
              style={{ background: "#fff", border: "1px solid #e5e7f2" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#c7d2f6";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(99,102,241,.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7f2";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="flex items-start gap-[10px] mb-2">
                <div
                  className="flex items-center justify-center rounded-[6px] flex-shrink-0"
                  style={{ width: 30, height: 30, background: "#fee2e2", fontSize: 8, fontWeight: 700, color: "#ef4444" }}
                >
                  PDF
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-bold mb-[2px]" style={{ color: "#1e1b4b" }}>
                    {result.filename}
                  </div>
                  <div className="text-[11px]" style={{ color: "#94a3b8" }}>
                    {result.category} · {result.date} · {result.pages}
                  </div>
                </div>
                <div
                  className="text-[11.5px] font-bold rounded-[8px] px-2 py-[3px] flex-shrink-0"
                  style={{ color: "#6366f1", background: "#eef1ff" }}
                >
                  {result.score}
                </div>
              </div>
              <p className="text-[12.5px] leading-[1.65]" style={{ color: "#4b5563" }}>
                {highlightText(result.excerpt, result.highlights)}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-1 pt-1">
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className="flex items-center justify-center rounded-[6px] text-[12.5px] font-medium transition-colors"
              style={{
                width: 32,
                height: 32,
                background: page === 1 ? "#6366f1" : "transparent",
                color: page === 1 ? "#fff" : "#64748b",
                fontWeight: page === 1 ? 600 : 500,
              }}
              onMouseEnter={(e) => { if (page !== 1) e.currentTarget.style.background = "#f0f3fc"; }}
              onMouseLeave={(e) => { if (page !== 1) e.currentTarget.style.background = "transparent"; }}
            >
              {page}
            </button>
          ))}
          <span className="px-1 text-[12px]" style={{ color: "#94a3b8" }}>···</span>
          <button
            className="flex items-center justify-center rounded-[6px] text-[12.5px] font-medium"
            style={{ width: 32, height: 32, color: "#64748b" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f3fc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            13
          </button>
          <button
            className="flex items-center justify-center rounded-[6px] transition-colors"
            style={{ width: 32, height: 32, color: "#64748b" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f3fc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Next page"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
