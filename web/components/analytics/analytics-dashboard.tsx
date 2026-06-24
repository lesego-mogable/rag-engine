"use client";

const kpis = [
  {
    label: "Total Queries",
    value: "8,492",
    change: "↑ 18.4%",
    sub: "vs last month",
    up: true,
  },
  {
    label: "Docs Indexed",
    value: "1,240",
    change: "↑ 54",
    sub: "new this month",
    up: true,
  },
  {
    label: "Active Users",
    value: "284",
    change: "↑ 12.1%",
    sub: "vs last month",
    up: true,
  },
  {
    label: "Avg Response",
    value: "1.8s",
    change: "↓ 0.3s",
    sub: "improvement",
    up: true,
  },
];

const recentQueries = [
  { query: "Q3 revenue breakdown by segment", user: "Jane Doe", docs: 6, time: "1.2s" },
  { query: "What is our vacation policy?", user: "Mark Chen", docs: 2, time: "0.8s" },
  { query: "APAC expansion milestones 2025", user: "Sarah Kim", docs: 4, time: "1.5s" },
  { query: "Product roadmap Q4 priorities", user: "Tom Walsh", docs: 3, time: "1.1s" },
  { query: "IT security protocols for remote work", user: "Lisa Park", docs: 5, time: "1.8s" },
];

const topDocs = [
  { name: "Q3_Earnings_2024.pdf", type: "PDF", count: 342 },
  { name: "HR_Policy_Manual_v2.docx", type: "DOCX", count: 218 },
  { name: "Annual_Report_2024.pdf", type: "PDF", count: 194 },
  { name: "Product_Roadmap_Q4.pptx", type: "PPTX", count: 167 },
  { name: "Board_Minutes_Sep24.pdf", type: "PDF", count: 98 },
];

const typeColors: Record<string, { bg: string; color: string }> = {
  PDF: { bg: "#fee2e2", color: "#ef4444" },
  DOCX: { bg: "#dbeafe", color: "#2563eb" },
  PPTX: { bg: "#fef3c7", color: "#d97706" },
};

export function AnalyticsDashboard() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Topbar */}
      <div
        className="flex items-center gap-2 px-[18px] flex-shrink-0"
        style={{ height: 52, background: "#fff", borderBottom: "1px solid #e5e7f2" }}
      >
        <span className="flex-1 text-[15px] font-bold" style={{ color: "#1e1b4b" }}>
          Analytics
        </span>
        <button
          className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[12px] font-medium transition-colors"
          style={{ border: "1px solid #e5e7f2", color: "#6b7280" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="10" rx="1.5" />
            <path d="M2 7h12" />
            <path d="M5 1v3M11 1v3" strokeLinecap="round" />
          </svg>
          Last 30 days
          <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
        <button
          className="rounded-[6px] px-[10px] py-[5px] text-[12px] font-semibold text-white transition-colors"
          style={{ background: "#6366f1" }}
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
                {kpi.value}
              </div>
              <div className="flex items-center gap-1 text-[12px]">
                <span className="font-semibold" style={{ color: "#10b981" }}>{kpi.change}</span>
                <span style={{ color: "#94a3b8" }}>{kpi.sub}</span>
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
          <svg viewBox="0 0 740 110" style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <line x1="0" y1="95" x2="740" y2="95" stroke="#f0f3fc" strokeWidth="1" />
            <line x1="0" y1="70" x2="740" y2="70" stroke="#f0f3fc" strokeWidth="1" />
            <line x1="0" y1="45" x2="740" y2="45" stroke="#f0f3fc" strokeWidth="1" />
            <line x1="0" y1="20" x2="740" y2="20" stroke="#f0f3fc" strokeWidth="1" />
            <path
              d="M0,73 L67,66 L134,60 L201,64 L268,51 L335,44 L402,53 L469,35 L536,28 L603,32 L670,18 L740,10 L740,100 L0,100 Z"
              fill="url(#ag1)"
            />
            <path
              d="M0,73 L67,66 L134,60 L201,64 L268,51 L335,44 L402,53 L469,35 L536,28 L603,32 L670,18 L740,10"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="740" cy="10" r="4" fill="#6366f1" />
            <circle cx="670" cy="18" r="3.5" fill="#6366f1" opacity={0.6} />
          </svg>
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
              <button
                className="text-[11.5px] font-medium transition-colors"
                style={{ color: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}
              >
                View all →
              </button>
            </div>
            <div>
              {recentQueries.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-[9px] transition-colors"
                  style={{ borderBottom: i < recentQueries.length - 1 ? "1px solid #f5f6fb" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[12.5px] font-medium truncate"
                      style={{ color: "#1e1b4b" }}
                    >
                      {row.query}
                    </div>
                    <div className="text-[11px] mt-[1px]" style={{ color: "#94a3b8" }}>
                      {row.user} · {row.docs} docs used
                    </div>
                  </div>
                  <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: "#64748b" }}>
                    {row.time}
                  </span>
                </div>
              ))}
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
            <div className="p-2">
              {topDocs.map((doc) => {
                const t = typeColors[doc.type] ?? typeColors.PDF;
                return (
                  <div
                    key={doc.name}
                    className="flex items-center gap-2 p-2 rounded-[5px] cursor-pointer transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      className="flex items-center justify-center rounded-[5px] flex-shrink-0"
                      style={{ width: 28, height: 28, background: t.bg, color: t.color, fontSize: 7, fontWeight: 700 }}
                    >
                      {doc.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold truncate" style={{ color: "#1e1b4b" }}>
                        {doc.name}
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-semibold rounded-[6px] px-[6px] py-[2px]"
                      style={{ color: "#6366f1", background: "#eef1ff" }}
                    >
                      {doc.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
