"use client";

import { useState } from "react";

type TabKey = "General" | "Integrations" | "Users & Roles" | "API Keys" | "Audit Log";

const tabs: TabKey[] = ["General", "Integrations", "Users & Roles", "API Keys", "Audit Log"];

interface Integration {
  id: string;
  name: string;
  subtitle: string;
  abbr: string;
  abbrColor: string;
  abbrBg: string;
  status: "connected" | "disconnected" | "connecting";
  detail?: string;
  toggleColor: string;
  thumbRight: boolean;
}

const integrations: Integration[] = [
  {
    id: "sharepoint",
    name: "SharePoint",
    subtitle: "Microsoft 365",
    abbr: "SP",
    abbrColor: "#0078d4",
    abbrBg: "#e8f0fe",
    status: "connected",
    detail: "Connected · 340 files synced",
    toggleColor: "#6366f1",
    thumbRight: true,
  },
  {
    id: "gdrive",
    name: "Google Drive",
    subtitle: "Google Workspace",
    abbr: "GD",
    abbrColor: "#4285f4",
    abbrBg: "#e8f0fe",
    status: "connected",
    detail: "Connected · 128 files synced",
    toggleColor: "#6366f1",
    thumbRight: true,
  },
  {
    id: "confluence",
    name: "Confluence",
    subtitle: "Atlassian",
    abbr: "Co",
    abbrColor: "#0052cc",
    abbrBg: "#e8f0fe",
    status: "disconnected",
    detail: "Not connected",
    toggleColor: "#e5e7f2",
    thumbRight: false,
  },
  {
    id: "onedrive",
    name: "OneDrive",
    subtitle: "Microsoft 365",
    abbr: "OD",
    abbrColor: "#0078d4",
    abbrBg: "#e8f0fe",
    status: "connected",
    detail: "Connected · 95 files synced",
    toggleColor: "#6366f1",
    thumbRight: true,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    subtitle: "Dropbox Business",
    abbr: "Db",
    abbrColor: "#0061ff",
    abbrBg: "#e8f0fe",
    status: "disconnected",
    detail: "Not connected",
    toggleColor: "#e5e7f2",
    thumbRight: false,
  },
  {
    id: "slack",
    name: "Slack",
    subtitle: "Slack Enterprise",
    abbr: "Sl",
    abbrColor: "#4a154b",
    abbrBg: "#f5f0ff",
    status: "disconnected",
    detail: "Not connected",
    toggleColor: "#e5e7f2",
    thumbRight: false,
  },
  {
    id: "teams",
    name: "Teams",
    subtitle: "Microsoft 365",
    abbr: "Ms",
    abbrColor: "#6264a7",
    abbrBg: "#eef1ff",
    status: "connecting",
    detail: "Connecting…",
    toggleColor: "#fef3c7",
    thumbRight: false,
  },
  {
    id: "jira",
    name: "Jira",
    subtitle: "Atlassian",
    abbr: "Ji",
    abbrColor: "#0052cc",
    abbrBg: "#e8f0fe",
    status: "disconnected",
    detail: "Not connected",
    toggleColor: "#e5e7f2",
    thumbRight: false,
  },
];

const statusStyle: Record<string, { color: string; dot: string }> = {
  connected: { color: "#10b981", dot: "#10b981" },
  disconnected: { color: "#94a3b8", dot: "#94a3b8" },
  connecting: { color: "#d97706", dot: "#f59e0b" },
};

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<TabKey>("Integrations");

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Topbar */}
      <div
        className="flex items-center gap-2 px-[18px] flex-shrink-0"
        style={{ height: 52, background: "#fff", borderBottom: "1px solid #e5e7f2" }}
      >
        <span className="flex-1 text-[15px] font-bold" style={{ color: "#1e1b4b" }}>
          Settings
        </span>
        <div
          className="flex items-center justify-center rounded-full cursor-pointer"
          style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6366f1,#a78bfa)" }}
        >
          <span className="text-white font-bold" style={{ fontSize: 10 }}>JD</span>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex flex-shrink-0 px-[18px] gap-0"
        style={{ background: "#fff", borderBottom: "1px solid #e5e7f2" }}
      >
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-[14px] py-3 text-[13px] transition-colors"
              style={{
                color: isActive ? "#6366f1" : "#94a3b8",
                fontWeight: isActive ? 600 : 500,
                borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#6b7280"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#94a3b8"; }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-[18px] scrollbar-thin space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div>
            <div className="text-[14px] font-bold" style={{ color: "#1e1b4b" }}>
              Data Source Integrations
            </div>
            <div className="text-[12.5px] mt-[2px]" style={{ color: "#94a3b8" }}>
              Connect external document repositories to automatically sync and index content
            </div>
          </div>
          <button
            className="ml-auto flex-shrink-0 rounded-[6px] px-[14px] py-[7px] text-[12.5px] font-semibold text-white transition-colors"
            style={{ background: "#6366f1" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
          >
            + Add Integration
          </button>
        </div>

        {/* Integration grid */}
        <div className="grid grid-cols-4 gap-[10px]">
          {integrations.map((intg) => {
            const st = statusStyle[intg.status];
            return (
              <div
                key={intg.id}
                className="rounded-[8px] p-[14px] flex flex-col gap-[10px] transition-colors"
                style={{ background: "#fff", border: "1px solid #e5e7f2" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c7d2f6")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7f2")}
              >
                <div className="flex items-center gap-[9px]">
                  <div
                    className="flex items-center justify-center rounded-[8px] flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      background: intg.abbrBg,
                      color: intg.abbrColor,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {intg.abbr}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold" style={{ color: "#1e1b4b" }}>
                      {intg.name}
                    </div>
                    <div className="text-[10.5px]" style={{ color: "#94a3b8" }}>
                      {intg.subtitle}
                    </div>
                  </div>
                  {/* Toggle */}
                  <div
                    className="relative cursor-pointer flex-shrink-0 rounded-full"
                    style={{
                      width: 34,
                      height: 18,
                      background: intg.toggleColor,
                    }}
                  >
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: 12,
                        height: 12,
                        background: "#fff",
                        top: 3,
                        ...(intg.thumbRight ? { right: 3 } : intg.status === "connecting" ? { left: 9 } : { left: 3 }),
                        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: st.color }}>
                  <div className="rounded-full" style={{ width: 6, height: 6, background: st.dot }} />
                  {intg.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sync config */}
        <div
          className="rounded-[8px] px-[18px] py-4"
          style={{ background: "#fff", border: "1px solid #e5e7f2" }}
        >
          <div className="text-[13px] font-bold mb-3" style={{ color: "#1e1b4b" }}>
            Sync Configuration
          </div>
          <div className="space-y-[10px]">
            <div
              className="flex items-center gap-[10px] rounded-[7px] px-3 py-[10px]"
              style={{ border: "1px solid #e5e7f2" }}
            >
              <div className="flex-1">
                <div className="text-[13px] font-semibold" style={{ color: "#1e1b4b" }}>
                  Auto-sync frequency
                </div>
                <div className="text-[11.5px] mt-[1px]" style={{ color: "#94a3b8" }}>
                  How often to check for new and updated documents
                </div>
              </div>
              <button
                className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[12.5px] font-medium transition-colors"
                style={{ border: "1px solid #e5e7f2", color: "#1e1b4b" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                Every 4 hours
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
            </div>
            <div
              className="flex items-center gap-[10px] rounded-[7px] px-3 py-[10px]"
              style={{ border: "1px solid #e5e7f2" }}
            >
              <div className="flex-1">
                <div className="text-[13px] font-semibold" style={{ color: "#1e1b4b" }}>
                  Auto-index new documents
                </div>
                <div className="text-[11.5px] mt-[1px]" style={{ color: "#94a3b8" }}>
                  Automatically index documents when they are synced
                </div>
              </div>
              <div
                className="relative cursor-pointer flex-shrink-0 rounded-full"
                style={{ width: 34, height: 18, background: "#6366f1" }}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 12,
                    height: 12,
                    background: "#fff",
                    top: 3,
                    right: 3,
                    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
