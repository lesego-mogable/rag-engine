"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";

type DateRange = "7d" | "30d" | "90d";

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

interface VolumePoint { date: string; count: number; }
interface RecentQuery { content: string; createdAt: string; chatTitle: string; }
interface RecentDoc { name: string; chunkCount: number | null; updatedAt: string; }

interface Stats {
  totalQueries: number;
  totalChats: number;
  activeUsers: number;
  docsIndexed: number;
  recentQueries: RecentQuery[];
  recentDocs: RecentDoc[];
  queryVolume: VolumePoint[];
}

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (range: DateRange) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?range=${range}`);
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(dateRange); }, [dateRange, fetchStats]);

  // Build SVG path from volume data
  const chartPath = (() => {
    if (!stats?.queryVolume?.length) return null;
    const pts = stats.queryVolume;
    const maxCount = Math.max(...pts.map((p) => p.count), 1);
    const W = 740, H = 80, PAD = 10;
    const xs = pts.map((_, i) => (i / Math.max(pts.length - 1, 1)) * W);
    const ys = pts.map((p) => PAD + (1 - p.count / maxCount) * (H - PAD * 2));
    const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    const area = `${line} L${W},${H} L0,${H} Z`;
    return { line, area, maxCount };
  })();

  const kpis = stats
    ? [
        { label: "Total Queries", value: fmt(stats.totalQueries), sub: `in period` },
        { label: "Docs Indexed", value: fmt(stats.docsIndexed), sub: "all time" },
        { label: "Active Users", value: fmt(stats.activeUsers), sub: "in period" },
        { label: "Total Chats", value: fmt(stats.totalChats), sub: "in period" },
      ]
    : [
        { label: "Total Queries", value: "—", sub: "" },
        { label: "Docs Indexed", value: "—", sub: "" },
        { label: "Active Users", value: "—", sub: "" },
        { label: "Total Chats", value: "—", sub: "" },
      ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ position: "relative" }}>
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
        <UserAvatar />
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
                style={{ color: loading ? "#e5e7f2" : "#1e1b4b", letterSpacing: "-.03em" }}
              >
                {loading ? "—" : kpi.value}
              </div>
              <div className="text-[12px]" style={{ color: "#94a3b8" }}>
                {loading ? "" : kpi.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Query Volume chart */}
        <div
          className="rounded-[8px] px-[18px] py-4"
          style={{ background: "#fff", border: "1px solid #e5e7f2" }}
        >
          <div className="flex items-center gap-2 mb-[14px]">
            <span className="flex-1 text-[13.5px] font-bold" style={{ color: "#1e1b4b" }}>
              Query Volume
            </span>
            <span className="text-[12px]" style={{ color: "#94a3b8" }}>
              {DATE_RANGE_LABELS[dateRange]}
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <svg viewBox="0 0 740 110" style={{ width: "100%", height: "auto", display: "block" }}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              {[95, 70, 45, 20].map((y) => (
                <line key={y} x1="0" y1={y} x2="740" y2={y} stroke="#f0f3fc" strokeWidth="1" />
              ))}
              {chartPath ? (
                <>
                  <path d={chartPath.area} fill="url(#ag1)" />
                  <path d={chartPath.line} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <>
                  <path d="M0,95 L740,95 L740,100 L0,100 Z" fill="url(#ag1)" />
                  <path d="M0,95 L740,95" fill="none" stroke="#e5e7f2" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
                </>
              )}
            </svg>
            {!chartPath && (
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
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
          {/* Recent queries */}
          <div
            className="rounded-[8px] overflow-hidden"
            style={{ background: "#fff", border: "1px solid #e5e7f2" }}
          >
            <div className="flex items-center px-4 py-3" style={{ borderBottom: "1px solid #e5e7f2" }}>
              <span className="flex-1 text-[13px] font-bold" style={{ color: "#1e1b4b" }}>
                Recent Queries
              </span>
              <Link
                href="/chat"
                className="text-[11.5px] font-medium transition-colors"
                style={{ color: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}
              >
                Open chat →
              </Link>
            </div>
            {!stats || stats.recentQueries.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-[12.5px]" style={{ color: "#94a3b8" }}>No queries yet</span>
              </div>
            ) : (
              <div>
                {stats.recentQueries.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-[10px]"
                    style={{ borderBottom: i < stats.recentQueries.length - 1 ? "1px solid #f0f3fc" : "none" }}
                  >
                    <div
                      className="flex items-center justify-center rounded-[5px] flex-shrink-0 mt-[1px]"
                      style={{ width: 22, height: 22, background: "#f0f3fc" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="1.6">
                        <circle cx="6.5" cy="6.5" r="4.1" />
                        <line x1="9.3" y1="9.3" x2="14" y2="14" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium truncate" style={{ color: "#1e1b4b" }}>
                        {q.content}
                      </p>
                      <p className="text-[11px] mt-[2px]" style={{ color: "#94a3b8" }}>
                        {q.chatTitle} · {timeAgo(q.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top documents */}
          <div
            className="rounded-[8px] overflow-hidden"
            style={{ background: "#fff", border: "1px solid #e5e7f2" }}
          >
            <div className="flex items-center px-4 py-3" style={{ borderBottom: "1px solid #e5e7f2" }}>
              <span className="flex-1 text-[13px] font-bold" style={{ color: "#1e1b4b" }}>
                Indexed Documents
              </span>
              <Link
                href="/documents"
                className="text-[11.5px] font-medium transition-colors"
                style={{ color: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}
              >
                View all →
              </Link>
            </div>
            {!stats || stats.recentDocs.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-[12.5px]" style={{ color: "#94a3b8" }}>No documents indexed yet</span>
              </div>
            ) : (
              <div>
                {stats.recentDocs.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-[10px]"
                    style={{ borderBottom: i < stats.recentDocs.length - 1 ? "1px solid #f0f3fc" : "none" }}
                  >
                    <div
                      className="flex items-center justify-center rounded-[5px] flex-shrink-0"
                      style={{ width: 22, height: 22, background: "#f0f3fc" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="#6366f1">
                        <path d="M3 1h7.5L14 4.5V15H3V1z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium truncate" style={{ color: "#1e1b4b" }}>
                        {d.name}
                      </p>
                      <p className="text-[11px] mt-[2px]" style={{ color: "#94a3b8" }}>
                        {d.chunkCount ?? 0} chunks · {timeAgo(d.updatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
