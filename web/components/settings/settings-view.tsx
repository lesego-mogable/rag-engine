"use client";

import { useState } from "react";
import { UserAvatar } from "@/components/user-avatar";

type TabKey = "General" | "Integrations" | "Users & Roles" | "API Keys" | "Audit Log";

const tabs: TabKey[] = ["General", "Integrations", "Users & Roles", "API Keys", "Audit Log"];

interface Integration {
  id: string;
  name: string;
  subtitle: string;
  abbr: string;
  abbrColor: string;
  abbrBg: string;
  initialStatus: "connected" | "disconnected" | "connecting";
}

const integrationsList: Integration[] = [
  { id: "sharepoint", name: "SharePoint", subtitle: "Microsoft 365", abbr: "SP", abbrColor: "#0078d4", abbrBg: "#e8f0fe", initialStatus: "connected" },
  { id: "gdrive", name: "Google Drive", subtitle: "Google Workspace", abbr: "GD", abbrColor: "#4285f4", abbrBg: "#e8f0fe", initialStatus: "connected" },
  { id: "confluence", name: "Confluence", subtitle: "Atlassian", abbr: "Co", abbrColor: "#0052cc", abbrBg: "#e8f0fe", initialStatus: "disconnected" },
  { id: "onedrive", name: "OneDrive", subtitle: "Microsoft 365", abbr: "OD", abbrColor: "#0078d4", abbrBg: "#e8f0fe", initialStatus: "connected" },
  { id: "dropbox", name: "Dropbox", subtitle: "Dropbox Business", abbr: "Db", abbrColor: "#0061ff", abbrBg: "#e8f0fe", initialStatus: "disconnected" },
  { id: "slack", name: "Slack", subtitle: "Slack Enterprise", abbr: "Sl", abbrColor: "#4a154b", abbrBg: "#f5f0ff", initialStatus: "disconnected" },
  { id: "teams", name: "Teams", subtitle: "Microsoft 365", abbr: "Ms", abbrColor: "#6264a7", abbrBg: "#eef1ff", initialStatus: "disconnected" },
  { id: "jira", name: "Jira", subtitle: "Atlassian", abbr: "Ji", abbrColor: "#0052cc", abbrBg: "#e8f0fe", initialStatus: "disconnected" },
];

const statusStyle: Record<string, { color: string; dot: string }> = {
  connected: { color: "#10b981", dot: "#10b981" },
  disconnected: { color: "#94a3b8", dot: "#94a3b8" },
  connecting: { color: "#d97706", dot: "#f59e0b" },
};

type SyncFreq = "1h" | "4h" | "12h" | "24h";
const SYNC_FREQ_LABELS: Record<SyncFreq, string> = {
  "1h": "Every 1 hour",
  "4h": "Every 4 hours",
  "12h": "Every 12 hours",
  "24h": "Every 24 hours",
};

interface ApiKey {
  id: string;
  masked: string;
}

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<TabKey>("Integrations");

  // Integration states
  const [integrationConnected, setIntegrationConnected] = useState<Record<string, boolean>>(
    Object.fromEntries(integrationsList.map((i) => [i.id, i.initialStatus === "connected"]))
  );

  // Sync config
  const [syncFreq, setSyncFreq] = useState<SyncFreq>("4h");
  const [showSyncDropdown, setShowSyncDropdown] = useState(false);
  const [autoIndex, setAutoIndex] = useState(true);

  // Add integration modal
  const [showAddModal, setShowAddModal] = useState(false);

  // General tab
  const [workspaceName, setWorkspaceName] = useState("Lumina RAG Engine");
  const [darkTheme, setDarkTheme] = useState(false);

  // API Keys tab
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  function generateKey() {
    const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
    setApiKeys((prev) => [...prev, { id: crypto.randomUUID(), masked: `sk-...${rand}` }]);
  }

  function revokeKey(id: string) {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function toggleIntegration(id: string) {
    setIntegrationConnected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ position: "relative" }}>
      {/* Add Integration Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.35)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "28px 32px",
              minWidth: 360,
              boxShadow: "0 8px 40px rgba(0,0,0,.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[15px] font-bold flex-1" style={{ color: "#1e1b4b" }}>Add Integration</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex items-center justify-center rounded-[5px] transition-colors"
                style={{ width: 28, height: 28, color: "#94a3b8" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f3fc"; e.currentTarget.style.color = "#6366f1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="3" y1="3" x2="13" y2="13" />
                  <line x1="13" y1="3" x2="3" y2="13" />
                </svg>
              </button>
            </div>
            <p className="text-[13px]" style={{ color: "#94a3b8" }}>Integration marketplace coming soon.</p>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div
        className="flex items-center gap-2 px-[18px] flex-shrink-0"
        style={{ height: 52, background: "#fff", borderBottom: "1px solid #e5e7f2" }}
      >
        <span className="flex-1 text-[15px] font-bold" style={{ color: "#1e1b4b" }}>
          Settings
        </span>
        <UserAvatar />
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

        {/* GENERAL TAB */}
        {activeTab === "General" && (
          <div className="space-y-4">
            <div>
              <div className="text-[14px] font-bold mb-[2px]" style={{ color: "#1e1b4b" }}>General Settings</div>
              <div className="text-[12.5px]" style={{ color: "#94a3b8" }}>Configure your workspace preferences</div>
            </div>
            <div
              className="rounded-[8px] px-[18px] py-4"
              style={{ background: "#fff", border: "1px solid #e5e7f2" }}
            >
              <div className="space-y-[10px]">
                {/* Workspace name */}
                <div
                  className="flex items-center gap-[10px] rounded-[7px] px-3 py-[10px]"
                  style={{ border: "1px solid #e5e7f2" }}
                >
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold" style={{ color: "#1e1b4b" }}>Workspace Name</div>
                    <div className="text-[11.5px] mt-[1px]" style={{ color: "#94a3b8" }}>The display name for this workspace</div>
                  </div>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="rounded-[6px] px-3 py-[6px] text-[13px] font-medium outline-none"
                    style={{
                      border: "1px solid #e5e7f2",
                      color: "#1e1b4b",
                      background: "#fafbff",
                      minWidth: 200,
                    }}
                  />
                </div>
                {/* Theme */}
                <div
                  className="flex items-center gap-[10px] rounded-[7px] px-3 py-[10px]"
                  style={{ border: "1px solid #e5e7f2" }}
                >
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold" style={{ color: "#1e1b4b" }}>Theme</div>
                    <div className="text-[11.5px] mt-[1px]" style={{ color: "#94a3b8" }}>Choose light or dark mode</div>
                  </div>
                  <button
                    onClick={() => setDarkTheme((v) => !v)}
                    className="relative cursor-pointer flex-shrink-0 rounded-full transition-colors"
                    style={{ width: 34, height: 18, background: darkTheme ? "#6366f1" : "#e5e7f2", border: "none", padding: 0 }}
                  >
                    <div
                      className="absolute rounded-full transition-all"
                      style={{
                        width: 12,
                        height: 12,
                        background: "#fff",
                        top: 3,
                        left: darkTheme ? "auto" : 3,
                        right: darkTheme ? 3 : "auto",
                        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                      }}
                    />
                  </button>
                  <span className="text-[12px] font-medium" style={{ color: "#64748b", marginLeft: 4 }}>
                    {darkTheme ? "Dark" : "Light"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === "Integrations" && (
          <>
            {/* Header */}
            <div className="flex items-center gap-2">
              <div>
                <div className="text-[14px] font-bold" style={{ color: "#1e1b4b" }}>Data Source Integrations</div>
                <div className="text-[12.5px] mt-[2px]" style={{ color: "#94a3b8" }}>
                  Connect external document repositories to automatically sync and index content
                </div>
              </div>
              <button
                className="ml-auto flex-shrink-0 rounded-[6px] px-[14px] py-[7px] text-[12.5px] font-semibold text-white transition-colors"
                style={{ background: "#6366f1" }}
                onClick={() => setShowAddModal(true)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
              >
                + Add Integration
              </button>
            </div>

            {/* Integration grid */}
            <div className="grid grid-cols-4 gap-[10px]">
              {integrationsList.map((intg) => {
                const isConnected = integrationConnected[intg.id];
                const status = isConnected ? "connected" : "disconnected";
                const st = statusStyle[status];
                const detail = isConnected ? "Connected · 0 files synced" : "Not connected";
                const toggleBg = isConnected ? "#6366f1" : "#e5e7f2";
                const thumbRight = isConnected;

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
                        style={{ width: 36, height: 36, background: intg.abbrBg, color: intg.abbrColor, fontSize: 10, fontWeight: 800 }}
                      >
                        {intg.abbr}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-bold" style={{ color: "#1e1b4b" }}>{intg.name}</div>
                        <div className="text-[10.5px]" style={{ color: "#94a3b8" }}>{intg.subtitle}</div>
                      </div>
                      {/* Toggle */}
                      <div
                        className="relative cursor-pointer flex-shrink-0 rounded-full"
                        style={{ width: 34, height: 18, background: toggleBg }}
                        onClick={() => toggleIntegration(intg.id)}
                      >
                        <div
                          className="absolute rounded-full"
                          style={{
                            width: 12,
                            height: 12,
                            background: "#fff",
                            top: 3,
                            ...(thumbRight ? { right: 3 } : { left: 3 }),
                            boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: st.color }}>
                      <div className="rounded-full" style={{ width: 6, height: 6, background: st.dot }} />
                      {detail}
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
              <div className="text-[13px] font-bold mb-3" style={{ color: "#1e1b4b" }}>Sync Configuration</div>
              <div className="space-y-[10px]">
                {/* Sync frequency */}
                <div
                  className="flex items-center gap-[10px] rounded-[7px] px-3 py-[10px]"
                  style={{ border: "1px solid #e5e7f2" }}
                >
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold" style={{ color: "#1e1b4b" }}>Auto-sync frequency</div>
                    <div className="text-[11.5px] mt-[1px]" style={{ color: "#94a3b8" }}>
                      How often to check for new and updated documents
                    </div>
                  </div>
                  <div style={{ position: "relative" }}>
                    <button
                      className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[12.5px] font-medium transition-colors"
                      style={{ border: "1px solid #e5e7f2", color: "#1e1b4b", background: "#fff" }}
                      onClick={() => setShowSyncDropdown((v) => !v)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      {SYNC_FREQ_LABELS[syncFreq]}
                      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>
                    {showSyncDropdown && (
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
                        {(["1h", "4h", "12h", "24h"] as SyncFreq[]).map((f) => (
                          <button
                            key={f}
                            className="w-full text-left px-3 py-[8px] text-[12.5px] font-medium transition-colors"
                            style={{ color: syncFreq === f ? "#6366f1" : "#1e1b4b", fontWeight: syncFreq === f ? 600 : 500 }}
                            onClick={() => { setSyncFreq(f); setShowSyncDropdown(false); }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f3fc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                          >
                            {SYNC_FREQ_LABELS[f]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-index */}
                <div
                  className="flex items-center gap-[10px] rounded-[7px] px-3 py-[10px]"
                  style={{ border: "1px solid #e5e7f2" }}
                >
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold" style={{ color: "#1e1b4b" }}>Auto-index new documents</div>
                    <div className="text-[11.5px] mt-[1px]" style={{ color: "#94a3b8" }}>
                      Automatically index documents when they are synced
                    </div>
                  </div>
                  <div
                    className="relative cursor-pointer flex-shrink-0 rounded-full"
                    style={{ width: 34, height: 18, background: autoIndex ? "#6366f1" : "#e5e7f2" }}
                    onClick={() => setAutoIndex((v) => !v)}
                  >
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: 12,
                        height: 12,
                        background: "#fff",
                        top: 3,
                        left: autoIndex ? "auto" : 3,
                        right: autoIndex ? 3 : "auto",
                        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* USERS & ROLES TAB */}
        {activeTab === "Users & Roles" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-[14px] font-bold" style={{ color: "#1e1b4b" }}>Users & Roles</div>
                <div className="text-[12.5px] mt-[2px]" style={{ color: "#94a3b8" }}>Manage team members and their permissions</div>
              </div>
              <button
                className="ml-auto flex-shrink-0 rounded-[6px] px-[14px] py-[7px] text-[12.5px] font-semibold text-white transition-colors"
                style={{ background: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
              >
                + Invite User
              </button>
            </div>
            <div
              className="rounded-[8px] overflow-hidden"
              style={{ background: "#fff", border: "1px solid #e5e7f2" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7f2" }}>
                    {["Name", "Email", "Role", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11.5px] font-semibold uppercase tracking-widest" style={{ color: "#94a3b8", letterSpacing: ".04em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-[13px]" style={{ color: "#94a3b8" }}>
                      No users yet — invite your team
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* API KEYS TAB */}
        {activeTab === "API Keys" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-[14px] font-bold" style={{ color: "#1e1b4b" }}>API Keys</div>
                <div className="text-[12.5px] mt-[2px]" style={{ color: "#94a3b8" }}>Manage API keys for programmatic access</div>
              </div>
              <button
                className="ml-auto flex-shrink-0 rounded-[6px] px-[14px] py-[7px] text-[12.5px] font-semibold text-white transition-colors"
                style={{ background: "#6366f1" }}
                onClick={generateKey}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
              >
                + Generate Key
              </button>
            </div>
            <div
              className="rounded-[8px] overflow-hidden"
              style={{ background: "#fff", border: "1px solid #e5e7f2" }}
            >
              {apiKeys.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <span className="text-[13px]" style={{ color: "#94a3b8" }}>No API keys generated</span>
                </div>
              ) : (
                <div>
                  {apiKeys.map((key, i) => (
                    <div
                      key={key.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < apiKeys.length - 1 ? "1px solid #f5f6fb" : "none" }}
                    >
                      <code className="flex-1 text-[12.5px] font-mono" style={{ color: "#1e1b4b" }}>
                        {key.masked}
                      </code>
                      <button
                        className="rounded-[5px] px-3 py-[4px] text-[11.5px] font-semibold transition-colors"
                        style={{ color: "#ef4444", background: "#fee2e2", border: "none" }}
                        onClick={() => revokeKey(key.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fecaca")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fee2e2")}
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === "Audit Log" && (
          <div className="space-y-4">
            <div>
              <div className="text-[14px] font-bold" style={{ color: "#1e1b4b" }}>Audit Log</div>
              <div className="text-[12.5px] mt-[2px]" style={{ color: "#94a3b8" }}>Track all actions performed within this workspace</div>
            </div>
            <div
              className="rounded-[8px] overflow-hidden"
              style={{ background: "#fff", border: "1px solid #e5e7f2" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7f2" }}>
                    {["Timestamp", "User", "Action", "Resource"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11.5px] font-semibold uppercase tracking-widest" style={{ color: "#94a3b8", letterSpacing: ".04em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-[13px]" style={{ color: "#94a3b8" }}>
                      No audit events recorded yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
