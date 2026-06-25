"use client";

import { useState } from "react";
import Link from "next/link";

type DateRange = "7d" | "30d" | "90d";

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

const kpis = [
  { label: "Total Queries" },
  { label: "Docs Indexed" },
  { label: "Active Users" },
  { label: "Avg Response" },
];

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  function handleExport() {
    showToast("No data to export");
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e1b4b",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            padding: "8px 16px",
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0,0,0,.18)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Topbar */}
      <div
        className="flex items-center gap-2 px-[18px] flex-shrink-0"
        style={{ height: 52, background: "#fff", borderBottom: "1px solid #e5e7f2" }}
      >
        <span className="flex-1 text-[15px] font-bold" style={{ color: "#1e1b4b" }}>
          Analytics
        </span>

        {/* Date range dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[12px] font-medium transition-colors"
            style={{ border: "1px solid #e5e7f2", color: "#6b7280", background: "#fff" }}
            onClick={() => setShowDateDropdown((v) => !v)}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="12" height="10" rx="1.5" />
              <path d="M2 7h12" />
              <path d="M5 1v3M11 1v3" strokeLinecap="round" />
            </svg>
            {DATE_RANGE_LABELS[dateRange]}
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {showDateDropdown && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                background: "#fff",
                border: "1px solid #e5e7f2",
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,.10)",
                zIndex: 10,
                minWidth: 160,
              }}
            >
              {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
                <button
                  key={r}
                  className="w-full text-left px-3 py-[8px] text-[12.5px] font-medium transition-colors"
                  style={{ color: dateRange === r ? "#6366f1" : "#1e1b4b", fontWeight: dateRange === r ? 600 : 500 }}
                  onClick={() => { setDateRange(r); setShowDateDropdown(false); }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f3fc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  {DATE_RANGE_LABELS[r]}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="rounded-[6px] px-[10px] py-[5px] text-[12px] font-semibold text-white transition-colors"
          style={{ background: "#6366f1" }}
          onClick={handleExport}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
        >
          Export
        </button>
        <div
          className="flex items-center justify-center rounded-full cursor-pointer"
          style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6366f1,#a78bfa)" }}
        >
          <span className="text-white font-bold" style={{ fontSize: 10 }}>JD</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-[18px] scrollbar-thin space-y-4">
        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-[8px] px-4 py-[14px]"
              style={{ background: "#fff", border: "1px solid #e5e7f2" }}
            >
              <div
                className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: "#94a3b8", letterSpacing: ".04em" }}
              >
                {kpi.label}
              </div>
              <div
                className="text-[26px] font-extrabold mb-1"
                style={{ color: "#1e1b4b", letterSpacing: "-.03em" }}
              >
                —
              </div>
              <div className="flex items-center gap-1 text-[12px]">
                <span style={{ color: "#94a3b8" }}>No data yet</span>
              </div>
            </div>
          ))}
        </div>

        {/* Area chart */}
        <div
          className="rounded-[8px] px-[18px] py-4"
          style={{ background: "#fff", border: "1px solid #e5e7f2" }}
        >
          <div className="flex items-center gap-2 mb-[14px]">
            <span className="flex-1 text-[13.5px] font-bold" style={{ color: "#1e1b4b" }}>
              Query Volume
            </span>
            <span className="text-[12px]" style={{ color: "#94a3b8" }}>Jan – Dec 2024</span>
          </div>
          <div style={{ position: "relative" }}>
            <svg viewBox="0 0 740 110" style={{ width: "100%", height: "auto", display: "block" }}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.07} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <line x1="0" y1="95" x2="740" y2="95" stroke="#f0f3fc" strokeWidth="1" />
              <line x1="0" y1="70" x2="740" y2="70" stroke="#f0f3fc" strokeWidth="1" />
              <line x1="0" y1="45" x2="740" y2="45" stroke="#f0f3fc" strokeWidth="1" />
              <line x1="0" y1="20" x2="740" y2="20" stroke="#f0f3fc" strokeWidth="1" />
              {/* Flat baseline */}
              <path d="M0,95 L740,95 L740,100 L0,100 Z" fill="url(#ag1)" />
              <path
                d="M0,95 L740,95"
                fill="none"
                stroke="#e5e7f2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 4"
              />
            </svg>
            {/* Overlay text */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <span className="text-[12.5px] font-medium" style={{ color: "#94a3b8" }}>
                No data for this period
              </span>
            </div>
          </div>
          <div className="flex justify-between mt-[6px]">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
              <span key={m} className="text-[10px]" style={{ color: "#94a3b8" }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
          {/* Recent queries */}
          <div
            className="rounded-[8px] overflow-hidden"
            style={{ background: "#fff", border: "1px solid #e5e7f2" }}
          >
            <div
              className="flex items-center px-4 py-3"
              style={{ borderBottom: "1px solid #e5e7f2" }}
            >
              <span className="flex-1 text-[13px] font-bold" style={{ color: "#1e1b4b" }}>
                Recent Queries
              </span>
              <Link
                href="/search"
                className="text-[11.5px] font-medium transition-colors"
                style={{ color: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}
              >
                View all →
              </Link>
            </div>
            <div className="flex items-center justify-center py-10">
              <span className="text-[12.5px]" style={{ color: "#94a3b8" }}>No queries yet</span>
            </div>
          </div>

          {/* Top documents */}
          <div
            className="rounded-[8px] overflow-hidden"
            style={{ background: "#fff", border: "1px solid #e5e7f2" }}
          >
            <div className="px-4 py-3" style={{ borderBottom: "1px solid #e5e7f2" }}>
              <span className="text-[13px] font-bold" style={{ color: "#1e1b4b" }}>
                Top Documents
              </span>
            </div>
            <div className="flex items-center justify-center py-10">
              <span className="text-[12.5px]" style={{ color: "#94a3b8" }}>No documents queried yet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
