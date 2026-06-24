"use client";

interface Source {
  id: number;
  filename: string;
  pages: string;
  excerpt: string;
}

interface SourcesPanelProps {
  sources: Source[];
  onClose: () => void;
}

export function SourcesPanel({ sources, onClose }: SourcesPanelProps) {
  return (
    <aside
      className="flex flex-col flex-shrink-0 overflow-hidden"
      style={{ width: 316, background: "#fff", borderLeft: "1px solid #e5e7f2" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid #e5e7f2" }}
      >
        <span className="text-[13px] font-bold flex-1" style={{ color: "#1e1b4b" }}>
          Sources
        </span>
        <span
          className="flex items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            width: 18,
            height: 18,
            background: "#6366f1",
            color: "#fff",
          }}
        >
          {sources.length}
        </span>
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-[5px] transition-colors ml-1"
          style={{ width: 24, height: 24, color: "#94a3b8" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f0f3fc";
            e.currentTarget.style.color = "#6366f1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94a3b8";
          }}
          aria-label="Close sources"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </button>
      </div>

      {/* Source cards */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
        {sources.map((source) => (
          <div
            key={source.id}
            className="rounded-[8px] p-3 cursor-pointer transition-all"
            style={{ border: "1px solid #e5e7f2", background: "#fff" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#c7d2f6";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(99,102,241,.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7f2";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div className="flex items-start gap-2 mb-2">
              <span
                className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
                style={{
                  width: 18,
                  height: 18,
                  fontSize: 9,
                  background: "#6366f1",
                  color: "#fff",
                  marginTop: 1,
                }}
              >
                {source.id}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[12px] font-semibold truncate"
                  style={{ color: "#1e1b4b" }}
                >
                  {source.filename}
                </div>
                <div className="text-[11px] mt-[2px]" style={{ color: "#94a3b8" }}>
                  {source.pages}
                </div>
              </div>
            </div>
            <p
              className="text-[11.5px] leading-[1.6] line-clamp-3"
              style={{ color: "#4b5563" }}
            >
              {source.excerpt}
            </p>
            <button
              className="text-[11px] font-medium mt-2 transition-colors"
              style={{ color: "#6366f1" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}
            >
              View all passages →
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
