"use client";

import { useState } from "react";

const stats = [
  { label: "Total Docs", value: "1,240", icon: "📄", iconBg: "#eef1ff", iconColor: "#6366f1" },
  { label: "Indexed", value: "1,186", icon: "✓", iconBg: "#d1fae5", iconColor: "#10b981" },
  { label: "Processing", value: "42", icon: "⏳", iconBg: "#fef3c7", iconColor: "#d97706" },
  { label: "Failed", value: "12", icon: "✕", iconBg: "#fee2e2", iconColor: "#ef4444" },
];

const documents = [
  { name: "Q3_Earnings_2024.pdf", type: "PDF", size: "2.4 MB", date: "Oct 3, 2024", status: "Indexed" },
  { name: "HR_Policy_Manual_v2.docx", type: "DOCX", size: "1.1 MB", date: "Sep 18, 2024", status: "Indexed" },
  { name: "Annual_Report_2024.pdf", type: "PDF", size: "8.7 MB", date: "Jan 15, 2024", status: "Indexed" },
  { name: "Product_Roadmap_Q4.pptx", type: "PPTX", size: "4.2 MB", date: "Oct 10, 2024", status: "Processing" },
  { name: "APAC_Strategy_2025.pdf", type: "PDF", size: "3.1 MB", date: "Oct 12, 2024", status: "Indexed" },
  { name: "Financial_Model_FY24.xlsx", type: "XLSX", size: "5.6 MB", date: "Sep 30, 2024", status: "Indexed" },
  { name: "Board_Minutes_Sep24.pdf", type: "PDF", size: "0.9 MB", date: "Oct 1, 2024", status: "Failed" },
  { name: "IT_Security_Policy.docx", type: "DOCX", size: "0.7 MB", date: "Aug 22, 2024", status: "Indexed" },
];

const typeStyles: Record<string, { bg: string; color: string }> = {
  PDF: { bg: "#fee2e2", color: "#ef4444" },
  DOCX: { bg: "#dbeafe", color: "#2563eb" },
  XLSX: { bg: "#d1fae5", color: "#059669" },
  PPTX: { bg: "#fef3c7", color: "#d97706" },
};

const statusStyles: Record<string, { bg: string; color: string; dot: string }> = {
  Indexed: { bg: "#d1fae5", color: "#059669", dot: "#10b981" },
  Processing: { bg: "#fef3c7", color: "#d97706", dot: "#f59e0b" },
  Failed: { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
};

export function DocumentLibrary() {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Topbar */}
      <div
        className="flex items-center gap-2 px-[18px] flex-shrink-0"
        style={{ height: 52, background: "#fff", borderBottom: "1px solid #e5e7f2" }}
      >
        <span className="flex-1 text-[15px] font-bold" style={{ color: "#1e1b4b" }}>
          Documents
        </span>
        <button
          className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[12px] font-medium transition-colors"
          style={{ border: "1px solid #e5e7f2", color: "#6b7280" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="6.5" cy="6.5" r="4.1" />
            <line x1="9.3" y1="9.3" x2="14" y2="14" strokeLinecap="round" />
          </svg>
          Search documents
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
          Upload Files
        </button>
        <div
          className="flex items-center justify-center rounded-full cursor-pointer"
          style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6366f1,#a78bfa)" }}
        >
          <span className="text-white font-bold" style={{ fontSize: 10 }}>JD</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[8px] px-4 py-3 flex items-center gap-3"
              style={{ background: "#fff", border: "1px solid #e5e7f2" }}
            >
              <div
                className="flex items-center justify-center rounded-[7px] text-[13px] font-bold flex-shrink-0"
                style={{ width: 34, height: 34, background: stat.iconBg, color: stat.iconColor }}
              >
                {stat.icon}
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#94a3b8", letterSpacing: ".04em" }}>
                  {stat.label}
                </div>
                <div className="text-[22px] font-extrabold tracking-tight" style={{ color: "#1e1b4b", letterSpacing: "-.02em" }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Drop zone */}
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-[10px] py-7 transition-colors cursor-pointer"
          style={{
            border: `1.5px dashed ${dragOver ? "#6366f1" : "#c7d2f6"}`,
            background: dragOver ? "#eef1ff" : "#fff",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 40, height: 40, background: "#eef1ff" }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="1.5">
              <path d="M8 3v10M4 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 13h12" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold" style={{ color: "#1e1b4b" }}>
              Drop files here or{" "}
              <span className="cursor-pointer" style={{ color: "#6366f1" }}>
                browse
              </span>
            </p>
            <p className="text-[11.5px] mt-1" style={{ color: "#94a3b8" }}>
              PDF, DOCX, XLSX, PPTX · Up to 50 MB per file
            </p>
          </div>
        </div>

        {/* Document grid */}
        <div className="grid grid-cols-4 gap-3">
          {documents.map((doc) => {
            const type = typeStyles[doc.type] ?? typeStyles.PDF;
            const status = statusStyles[doc.status] ?? statusStyles.Indexed;
            return (
              <div
                key={doc.name}
                className="rounded-[8px] p-3 cursor-pointer transition-all"
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
                <div className="flex items-start justify-between mb-2">
                  <div
                    className="flex items-center justify-center rounded-[5px] font-bold"
                    style={{ width: 32, height: 32, background: type.bg, color: type.color, fontSize: 8 }}
                  >
                    {doc.type}
                  </div>
                  <button
                    className="flex items-center justify-center rounded-[4px] transition-colors"
                    style={{ width: 24, height: 24, color: "#94a3b8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                    aria-label="More options"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="8" cy="3" r="1.2" />
                      <circle cx="8" cy="8" r="1.2" />
                      <circle cx="8" cy="13" r="1.2" />
                    </svg>
                  </button>
                </div>
                <div
                  className="text-[12px] font-semibold mb-1 truncate"
                  style={{ color: "#1e1b4b" }}
                >
                  {doc.name}
                </div>
                <div className="text-[11px] mb-2" style={{ color: "#94a3b8" }}>
                  {doc.size} · {doc.date}
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="rounded-full"
                    style={{ width: 6, height: 6, background: status.dot }}
                  />
                  <span
                    className="text-[10.5px] font-semibold rounded-[4px] px-[6px] py-[1px]"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
