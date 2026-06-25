"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";

interface PendingFile {
  name: string;
  size: string;
  type: string;
}

const typeStyles: Record<string, { bg: string; color: string }> = {
  PDF: { bg: "#fee2e2", color: "#ef4444" },
  DOCX: { bg: "#dbeafe", color: "#2563eb" },
  XLSX: { bg: "#d1fae5", color: "#059669" },
  PPTX: { bg: "#fef3c7", color: "#d97706" },
};

function getFileType(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase() ?? "FILE";
  return ext in typeStyles ? ext : "FILE";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const stats = [
  { label: "Total Docs", value: "0", iconBg: "#eef1ff", iconColor: "#6366f1", icon: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h7.5L14 4.5V15H3V1z" /></svg>
  )},
  { label: "Indexed", value: "0", iconBg: "#d1fae5", iconColor: "#10b981", icon: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8l4 4 8-8"/></svg>
  )},
  { label: "Processing", value: "0", iconBg: "#fef3c7", iconColor: "#d97706", icon: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
  )},
  { label: "Failed", value: "0", iconBg: "#fee2e2", iconColor: "#ef4444", icon: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
  )},
];

export function DocumentLibrary() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList) {
    const newFiles: PendingFile[] = Array.from(fileList).map((f) => ({
      name: f.name,
      size: formatBytes(f.size),
      type: getFileType(f.name),
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.xlsx,.pptx"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

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
          style={{ border: "1px solid #e5e7f2", color: "#6b7280", background: "#fff" }}
          onClick={() => router.push("/search")}
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
          onClick={triggerFileInput}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          Upload Files
        </button>
        <UserAvatar />
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
                className="flex items-center justify-center rounded-[7px] flex-shrink-0"
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
          onDrop={handleDrop}
          onClick={triggerFileInput}
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
              <span
                className="cursor-pointer"
                style={{ color: "#6366f1" }}
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
              >
                browse
              </span>
            </p>
            <p className="text-[11.5px] mt-1" style={{ color: "#94a3b8" }}>
              PDF, DOCX, XLSX, PPTX · Up to 50 MB per file
            </p>
          </div>
        </div>

        {/* Document grid or empty state */}
        {pendingFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 52, height: 52, background: "#eef1ff" }}
            >
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="1.5">
                <path d="M8 3v10M4 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-bold" style={{ color: "#1e1b4b" }}>No documents yet</p>
              <p className="text-[12.5px] mt-1" style={{ color: "#94a3b8" }}>Upload your first document to get started</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {pendingFiles.map((doc, idx) => {
              const type = typeStyles[doc.type] ?? { bg: "#f0f3fc", color: "#64748b" };
              const menuKey = `${doc.name}-${idx}`;
              return (
                <div
                  key={menuKey}
                  className="rounded-[8px] p-3 transition-all"
                  style={{ background: "#fff", border: "1px solid #e5e7f2", position: "relative" }}
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
                    <div style={{ position: "relative" }}>
                      <button
                        className="flex items-center justify-center rounded-[4px] transition-colors"
                        style={{ width: 24, height: 24, color: "#94a3b8" }}
                        onClick={() => setOpenMenuId(openMenuId === menuKey ? null : menuKey)}
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
                      {openMenuId === menuKey && (
                        <div
                          style={{
                            position: "absolute",
                            top: 28,
                            right: 0,
                            background: "#fff",
                            border: "1px solid #e5e7f2",
                            borderRadius: 8,
                            boxShadow: "0 4px 16px rgba(0,0,0,.10)",
                            zIndex: 10,
                            minWidth: 130,
                          }}
                        >
                          {["Download", "Rename", "Delete"].map((opt) => (
                            <button
                              key={opt}
                              className="w-full text-left px-3 py-[7px] text-[12.5px] font-medium transition-colors"
                              style={{ color: opt === "Delete" ? "#ef4444" : "#1e1b4b" }}
                              onClick={() => setOpenMenuId(null)}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f3fc")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[12px] font-semibold mb-1 truncate" style={{ color: "#1e1b4b" }}>
                    {doc.name}
                  </div>
                  <div className="text-[11px] mb-2" style={{ color: "#94a3b8" }}>
                    {doc.size}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="rounded-full" style={{ width: 6, height: 6, background: "#f59e0b" }} />
                    <span
                      className="text-[10.5px] font-semibold rounded-[4px] px-[6px] py-[1px]"
                      style={{ background: "#fef3c7", color: "#d97706" }}
                    >
                      Queued
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
