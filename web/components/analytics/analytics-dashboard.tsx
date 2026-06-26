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
interface RecentDoc { name: string; chunkCount: number | null; embeddingTokens: number | null; updatedAt: string; }

interface Stats {
  totalQueries: number;
  totalChats: number;
  activeUsers: number;
  docsIndexed: number;
  inputTokens: number;
  outputTokens: number;
  totalEmbedTokens: number;
  totalTokens: number;
  chatCost: number;
  embedCost: number;
  totalCost: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  p50Latency: number;
  p95Latency: number;
  dbBytes: number;
  storageBytes: number;
  recentQueries: RecentQuery[];
  recentDocs: RecentDoc[];
  queryVolume: VolumePoint[];
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function fmtBytes(b: number) {
  if (b >= 1_073_741_824) return (b / 1_073_741_824).toFixed(2) + " GB";
  if (b >= 1_048_576) return (b / 1_048_576).toFixed(1) + " MB";
  if (b >= 1024) return (b / 1024).toFixed(0) + " KB";
  return b + " B";
}

function fmtCost(n: number) {
  if (n === 0) return "$0.00";
  if (n < 0.01) return `$${n.toFixed(5)}`;
  return `$${n.toFixed(4)}`;
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

function KpiCard({ label, value, sub, loading }: { label: string; value: string; sub?: string; loading: boolean }) {
  return (
    <div className="rounded-[8px] px-4 py-[14px]" style={{ background: "#fff", border: "1px solid #e5e7f2" }}>
      <div className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#94a3b8" }}>
        {label}
      </div>
      <div className="text-[22px] font-extrabold mb-1" style={{ color: loading ? "#e5e7f2" : "#1e1b4b", letterSpacing: "-.03em" }}>
        {loading ? "—" : value}
      </div>
      {sub && <div className="text-[11px]" style={{ color: "#94a3b8" }}>{loading ? "" : sub}</div>}
    </div>
  );
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

  const chartPath = (() => {
    if (!stats?.queryVolume?.length) return null;
    const pts = stats.queryVolume;
    const maxCount = Math.max(...pts.map((p) => p.count), 1);
    const W = 740, H = 80, PAD = 10;
    const xs = pts.map((_, i) => (i / Math.max(pts.length - 1, 1)) * W);
    const ys = pts.map((p) => PAD + (1 - p.count / maxCount) * (H - PAD * 2));
    const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    return { line, area: `${line} L${W},${H} L0,${H} Z` };
  })();

  const s = stats;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center gap-2 px-[18px] flex-shrink-0" style={{ height: 52, background: "#fff", borderBottom: "1px solid #e5e7f2" }}>
        <span className="flex-1 text-[15px] font-bold" style={{ color: "#1e1b4b" }}>Analytics</span>
        <div style={{ position: "relative" }}>
          <button
            className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[12px] font-medium transition-colors"
            style={{ border: "1px solid #e5e7f2", color: "#6b7280", background: "#fff" }}
            onClick={() => setShowDateDropdown((v) => !v)}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M2 7h12" /><path d="M5 1v3M11 1v3" strokeLinecap="round" />
            </svg>
            {DATE_RANGE_LABELS[dateRange]}
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {showDateDropdown && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#fff", border: "1px solid #e5e7f2", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.10)", zIndex: 10, minWidth: 160 }}>
              {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
                <button key={r} className="w-full text-left px-3 py-[8px] text-[12.5px] font-medium transition-colors"
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

        {/* Row 1 — Activity KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="Total Queries" value={fmtNum(s?.totalQueries ?? 0)} sub="in period" loading={loading} />
          <KpiCard label="Total Chats" value={fmtNum(s?.totalChats ?? 0)} sub="in period" loading={loading} />
          <KpiCard label="Active Users" value={fmtNum(s?.activeUsers ?? 0)} sub="in period" loading={loading} />
          <KpiCard label="Docs Indexed" value={fmtNum(s?.docsIndexed ?? 0)} sub="all time" loading={loading} />
        </div>

        {/* Row 2 — Cost & Token KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="Est. Total Cost" value={fmtCost(s?.totalCost ?? 0)} sub="Azure OpenAI" loading={loading} />
          <KpiCard label="Total Tokens" value={fmtNum(s?.totalTokens ?? 0)} sub={`${fmtNum(s?.inputTokens ?? 0)} in · ${fmtNum(s?.outputTokens ?? 0)} out`} loading={loading} />
          <KpiCard label="Avg Latency" value={s ? `${s.avgLatency} ms` : "—"} sub={s ? `p95: ${s.p95Latency} ms` : ""} loading={loading} />
          <KpiCard label="Storage Used" value={fmtBytes(s?.storageBytes ?? 0)} sub={`DB: ${fmtBytes(s?.dbBytes ?? 0)}`} loading={loading} />
        </div>

        {/* Query Volume chart */}
        <div className="rounded-[8px] px-[18px] py-4" style={{ background: "#fff", border: "1px solid #e5e7f2" }}>
          <div className="flex items-center gap-2 mb-[14px]">
            <span className="flex-1 text-[13.5px] font-bold" style={{ color: "#1e1b4b" }}>Query Volume</span>
            <span className="text-[12px]" style={{ color: "#94a3b8" }}>{DATE_RANGE_LABELS[dateRange]}</span>
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
                <path d="M0,95 L740,95" fill="none" stroke="#e5e7f2" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
              )}
            </svg>
            {!chartPath && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span className="text-[12.5px] font-medium" style={{ color: "#94a3b8" }}>No data for this period</span>
              </div>
            )}
          </div>
        </div>

        {/* Cost breakdown + Latency breakdown */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Cost breakdown */}
          <div className="rounded-[8px] overflow-hidden" style={{ background: "#fff", border: "1px solid #e5e7f2" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid #e5e7f2" }}>
              <span className="text-[13px] font-bold" style={{ color: "#1e1b4b" }}>Cost Breakdown</span>
            </div>
            <div className="px-4 py-3 space-y-3">
              {[
                { label: "Chat completions (input)", tokens: s?.inputTokens ?? 0, cost: ((s?.inputTokens ?? 0) / 1_000_000) * 0.40, color: "#6366f1" },
                { label: "Chat completions (output)", tokens: s?.outputTokens ?? 0, cost: ((s?.outputTokens ?? 0) / 1_000_000) * 1.60, color: "#818cf8" },
                { label: "Embeddings", tokens: s?.totalEmbedTokens ?? 0, cost: ((s?.totalEmbedTokens ?? 0) / 1_000_000) * 0.02, color: "#a5b4fc" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11.5px] font-medium" style={{ color: "#374151" }}>{row.label}</span>
                    <span className="text-[11.5px] font-semibold" style={{ color: "#1e1b4b" }}>{fmtCost(row.cost)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: "#f0f3fc" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: s?.totalCost ? `${Math.min((row.cost / s.totalCost) * 100, 100)}%` : "0%",
                          background: row.color,
                        }}
                      />
                    </div>
                    <span className="text-[10.5px]" style={{ color: "#94a3b8", minWidth: 50, textAlign: "right" }}>{fmtNum(row.tokens)} tokens</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #f0f3fc" }}>
                <span className="text-[12px] font-semibold" style={{ color: "#374151" }}>Total</span>
                <span className="text-[13px] font-bold" style={{ color: "#6366f1" }}>{fmtCost(s?.totalCost ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* Latency breakdown */}
          <div className="rounded-[8px] overflow-hidden" style={{ background: "#fff", border: "1px solid #e5e7f2" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid #e5e7f2" }}>
              <span className="text-[13px] font-bold" style={{ color: "#1e1b4b" }}>Latency</span>
            </div>
            <div className="px-4 py-3 space-y-3">
              {[
                { label: "Average", value: s?.avgLatency ?? 0 },
                { label: "P50 (median)", value: s?.p50Latency ?? 0 },
                { label: "P95", value: s?.p95Latency ?? 0 },
                { label: "Max", value: s?.maxLatency ?? 0 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: "#6b7280" }}>{row.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full overflow-hidden" style={{ width: 80, height: 4, background: "#f0f3fc" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: s?.maxLatency ? `${Math.min((row.value / s.maxLatency) * 100, 100)}%` : "0%",
                          background: row.value > 3000 ? "#ef4444" : row.value > 1500 ? "#f59e0b" : "#10b981",
                        }}
                      />
                    </div>
                    <span className="text-[12px] font-semibold" style={{ color: "#1e1b4b", minWidth: 60, textAlign: "right" }}>
                      {loading ? "—" : `${row.value} ms`}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-2" style={{ borderTop: "1px solid #f0f3fc" }}>
                <div className="flex items-center gap-3 text-[10.5px]" style={{ color: "#94a3b8" }}>
                  <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> &lt;1.5s</span>
                  <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} /> 1.5–3s</span>
                  <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} /> &gt;3s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent queries + Indexed documents */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
          <div className="rounded-[8px] overflow-hidden" style={{ background: "#fff", border: "1px solid #e5e7f2" }}>
            <div className="flex items-center px-4 py-3" style={{ borderBottom: "1px solid #e5e7f2" }}>
              <span className="flex-1 text-[13px] font-bold" style={{ color: "#1e1b4b" }}>Recent Queries</span>
              <Link href="/chat" className="text-[11.5px] font-medium" style={{ color: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}>
                Open chat →
              </Link>
            </div>
            {!s || s.recentQueries.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-[12.5px]" style={{ color: "#94a3b8" }}>No queries yet</span>
              </div>
            ) : (
              s.recentQueries.map((q, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-[10px]"
                  style={{ borderBottom: i < s.recentQueries.length - 1 ? "1px solid #f0f3fc" : "none" }}>
                  <div className="flex items-center justify-center rounded-[5px] flex-shrink-0 mt-[1px]" style={{ width: 22, height: 22, background: "#f0f3fc" }}>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="1.6">
                      <circle cx="6.5" cy="6.5" r="4.1" /><line x1="9.3" y1="9.3" x2="14" y2="14" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium truncate" style={{ color: "#1e1b4b" }}>{q.content}</p>
                    <p className="text-[11px] mt-[2px]" style={{ color: "#94a3b8" }}>{q.chatTitle} · {timeAgo(q.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-[8px] overflow-hidden" style={{ background: "#fff", border: "1px solid #e5e7f2" }}>
            <div className="flex items-center px-4 py-3" style={{ borderBottom: "1px solid #e5e7f2" }}>
              <span className="flex-1 text-[13px] font-bold" style={{ color: "#1e1b4b" }}>Indexed Documents</span>
              <Link href="/documents" className="text-[11.5px] font-medium" style={{ color: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}>
                View all →
              </Link>
            </div>
            {!s || s.recentDocs.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-[12.5px]" style={{ color: "#94a3b8" }}>No documents indexed yet</span>
              </div>
            ) : (
              s.recentDocs.map((d, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-[10px]"
                  style={{ borderBottom: i < s.recentDocs.length - 1 ? "1px solid #f0f3fc" : "none" }}>
                  <div className="flex items-center justify-center rounded-[5px] flex-shrink-0" style={{ width: 22, height: 22, background: "#f0f3fc" }}>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="#6366f1"><path d="M3 1h7.5L14 4.5V15H3V1z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium truncate" style={{ color: "#1e1b4b" }}>{d.name}</p>
                    <p className="text-[11px] mt-[2px]" style={{ color: "#94a3b8" }}>
                      {d.chunkCount ?? 0} chunks · {fmtNum(d.embeddingTokens ?? 0)} tokens · {timeAgo(d.updatedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
