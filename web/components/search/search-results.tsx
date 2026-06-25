"use client";

import { useState } from "react";

const ALL_FILTER_OPTIONS = ["PDF", "DOCX", "XLSX", "PPTX", "Last 7 days", "Last 30 days", "Last 90 days"];

export function SearchResults() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  function handleSearch() {
    setSubmittedQuery(query.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  function toggleFilter(filter: string) {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  }

  function clearAllFilters() {
    setActiveFilters([]);
  }

  const availableFilterOptions = ALL_FILTER_OPTIONS.filter((f) => !activeFilters.includes(f));

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
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-[13.5px] font-medium"
              style={{ color: "#1e1b4b" }}
              placeholder="Search your documents…"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSubmittedQuery(""); }}
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
            onClick={handleSearch}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
          >
            Search
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-[6px] flex-wrap" style={{ position: "relative" }}>
          <span className="text-[12px] font-medium" style={{ color: "#64748b" }}>Filter:</span>
          <button
            className="rounded-full px-[10px] py-[4px] text-[12px] font-medium transition-colors"
            style={{ background: "#fff", border: "1px solid #e5e7f2", color: "#64748b" }}
            onClick={clearAllFilters}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c7d2f6"; e.currentTarget.style.color = "#6366f1"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7f2"; e.currentTarget.style.color = "#64748b"; }}
          >
            All Types
          </button>
          {activeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className="flex items-center gap-1 rounded-full px-[10px] py-[4px] text-[12px] font-semibold"
              style={{ background: "#eef1ff", border: "1px solid #c7d2f6", color: "#4f46e5" }}
            >
              {filter}{" "}
              <span style={{ opacity: 0.6 }}>✕</span>
            </button>
          ))}
          <div style={{ position: "relative" }}>
            <button
              className="rounded-full px-[10px] py-[4px] text-[12px] font-medium transition-colors"
              style={{ background: "#fff", border: "1px solid #e5e7f2", color: "#6366f1" }}
              onClick={() => setShowFilterDropdown((v) => !v)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#eef1ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              + Add filter
            </button>
            {showFilterDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  background: "#fff",
                  border: "1px solid #e5e7f2",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,.10)",
                  zIndex: 10,
                  minWidth: 160,
                }}
              >
                {availableFilterOptions.length === 0 ? (
                  <div className="px-3 py-[8px] text-[12px]" style={{ color: "#94a3b8" }}>All filters active</div>
                ) : (
                  availableFilterOptions.map((opt) => (
                    <button
                      key={opt}
                      className="w-full text-left px-3 py-[7px] text-[12.5px] font-medium transition-colors"
                      style={{ color: "#1e1b4b" }}
                      onClick={() => { toggleFilter(opt); setShowFilterDropdown(false); }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f3fc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      {opt}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-1 text-[12px] font-medium" style={{ color: "#94a3b8" }}>
            <span className="font-semibold" style={{ color: "#1e1b4b" }}>0 results</span>
            &nbsp;·&nbsp; Sort:
            <button
              className="font-semibold transition-colors"
              style={{ color: "#6366f1" }}
              onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}
            >
              Relevance {sortDir === "desc" ? "↓" : "↑"}
            </button>
          </div>
        </div>

        {/* Results area */}
        {!submittedQuery ? (
          /* Empty: no query entered */
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 52, height: 52, background: "#eef1ff" }}
            >
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="1.6">
                <circle cx="6.5" cy="6.5" r="4.1" />
                <line x1="9.3" y1="9.3" x2="14" y2="14" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-bold" style={{ color: "#1e1b4b" }}>Search your knowledge base</p>
              <p className="text-[12.5px] mt-1" style={{ color: "#94a3b8" }}>
                Enter a search term above to find relevant documents
              </p>
            </div>
          </div>
        ) : (
          /* Empty: query submitted but no results */
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 52, height: 52, background: "#f0f3fc" }}
            >
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="#94a3b8" strokeWidth="1.6">
                <circle cx="6.5" cy="6.5" r="4.1" />
                <line x1="9.3" y1="9.3" x2="14" y2="14" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-bold" style={{ color: "#1e1b4b" }}>
                No results for &ldquo;{submittedQuery}&rdquo;
              </p>
              <p className="text-[12.5px] mt-1" style={{ color: "#94a3b8" }}>
                Try different search terms or adjust your filters
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
