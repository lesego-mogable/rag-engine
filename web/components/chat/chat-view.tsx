"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SourcesPanel } from "./sources-panel";
import { UserAvatar } from "@/components/user-avatar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

interface ChatSummary {
  id: string;
  title: string;
  updatedAt: string;
}

const EXAMPLE_PROMPTS = [
  "Summarise this document",
  "What are the key topics covered?",
  "What are the main requirements?",
];

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSummary[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = useCallback(async () => {
    const res = await fetch("/api/chats");
    if (res.ok) {
      setChatHistory(await res.json());
      window.dispatchEvent(new Event("chat-saved"));
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    window.addEventListener("new-chat", handleNewChat);
    return () => window.removeEventListener("new-chat", handleNewChat);
  }, []);

  useEffect(() => {
    function onLoadChat(e: Event) {
      loadChat((e as CustomEvent<string>).detail);
    }
    window.addEventListener("load-chat", onLoadChat);
    return () => window.removeEventListener("load-chat", onLoadChat);
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: trimmed },
      { id: assistantId, role: "assistant", content: "", pending: true },
    ]);
    setInput("");

    // Create a new chat session on the first message
    let chatId = currentChatId;
    if (!chatId) {
      const chatRes = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (chatRes.ok) {
        const chat = await chatRes.json();
        chatId = chat.id;
        setCurrentChatId(chatId);
        fetchHistory();
      }
    }

    // Save user message
    if (chatId) {
      await fetch(`/api/chats/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: trimmed }),
      });
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      const answer = res.ok ? data.answer : (data.error ?? "Something went wrong.");
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: answer, pending: false } : m)
      );

      // Save assistant message with metrics
      if (chatId) {
        const saveBody: Record<string, unknown> = { role: "assistant", content: answer };
        if (res.ok) {
          saveBody.inputTokens = data.inputTokens ?? null;
          saveBody.outputTokens = data.outputTokens ?? null;
          saveBody.embeddingTokens = data.embeddingTokens ?? null;
          saveBody.latencyMs = data.latencyMs ?? null;
        }
        await fetch(`/api/chats/${chatId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(saveBody),
        });
        fetchHistory();
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: "Failed to reach the AI engine.", pending: false } : m
        )
      );
    }
  }

  async function loadChat(id: string) {
    const res = await fetch(`/api/chats/${id}`);
    if (!res.ok) return;
    const chat = await res.json();
    setCurrentChatId(id);
    setMessages(
      chat.messages.map((m: { id: string; role: string; content: string }) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      }))
    );
    setShowHistory(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setInput("");
    setCurrentChatId(null);
    setSourcesOpen(false);
  }

  function handleCopy(msg: Message) {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function handleRegenerate() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    setMessages((prev) => prev.filter((m) => m.role !== "assistant" || prev.indexOf(m) < prev.findLastIndex((x) => x.role === "user")));
    sendMessage(lastUserMsg.content);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  }

  function handleAttach() {
    fileInputRef.current?.click();
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-1 overflow-hidden" style={{ position: "relative" }}>
      {/* Toast */}
      {shareToast && (
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
          Link copied!
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} />

      {/* Main chat area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <div
          className="flex items-center gap-2 px-[18px] flex-shrink-0"
          style={{
            height: 52,
            background: "#fff",
            borderBottom: "1px solid #e5e7f2",
          }}
        >
          <span className="flex-1 text-[15px] font-bold" style={{ color: "#1e1b4b" }}>
            {hasMessages ? "Chat" : "New Chat"}
          </span>
          <button
            className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[12px] font-medium transition-colors"
            style={{ border: "1px solid #e5e7f2", color: "#6b7280", background: showHistory ? "#f5f6fb" : "#fff" }}
            onClick={() => setShowHistory((v) => !v)}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = showHistory ? "#f5f6fb" : "#fff")}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 3v10M3 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            History
          </button>
          <button
            className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[12px] font-semibold text-white transition-colors"
            style={{ background: "#6366f1" }}
            onClick={handleNewChat}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
            New Chat
          </button>
          <button className="relative" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <path d="M8 1.5a4.5 4.5 0 014.5 4.5c0 2.5.7 4 1.5 5H2c.8-1 1.5-2.5 1.5-5A4.5 4.5 0 018 1.5z" strokeLinejoin="round" />
              <path d="M6.5 13a1.5 1.5 0 003 0" strokeLinecap="round" />
            </svg>
            <span
              className="absolute rounded-full"
              style={{ width: 5, height: 5, background: "#6366f1", top: 0, right: 0 }}
            />
          </button>
          <UserAvatar />
        </div>

        {/* Chat feed */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin" style={{ background: "#f0f3fc" }}>
          {!hasMessages ? (
            /* Empty / welcome state */
            <div className="flex flex-col items-center justify-center h-full gap-5">
              <img src="/logo-512.png" alt="lsg-RAG" style={{ width: 52, height: 52, borderRadius: 12 }} />
              <div className="text-center">
                <h2 className="text-[18px] font-bold mb-1" style={{ color: "#1e1b4b" }}>
                  How can I help you today?
                </h2>
                <p className="text-[13px]" style={{ color: "#94a3b8" }}>
                  Ask anything about your indexed documents
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="rounded-[8px] px-[14px] py-[8px] text-[12.5px] font-medium transition-colors"
                    style={{ background: "#fff", border: "1px solid #e5e7f2", color: "#4b5563" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#c7d2f6";
                      e.currentTarget.style.color = "#6366f1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7f2";
                      e.currentTarget.style.color = "#4b5563";
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message list */
            <div>
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end mb-4">
                    <div
                      className="rounded-[14px] rounded-br-[4px] px-[14px] py-[10px] max-w-[70%]"
                      style={{ background: "#6366f1" }}
                    >
                      <p className="text-white text-[13.5px] leading-[1.55]">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="mb-4 max-w-[85%]">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="flex items-center justify-center rounded-[5px] flex-shrink-0"
                        style={{ width: 22, height: 22 }}
                      >
                        <img src="/logo-32.png" alt="lsg-RAG" style={{ width: 22, height: 22, borderRadius: 5 }} />
                      </div>
                      <span className="text-[12.5px] font-semibold" style={{ color: "#1e1b4b" }}>lsg-RAG</span>
                    </div>
                    <div
                      className="rounded-[14px] rounded-tl-[4px] px-[16px] py-[13px]"
                      style={{ background: "#fff", border: "1px solid #e5e7f2" }}
                    >
                      {msg.pending ? (
                        <div className="flex items-center gap-[5px]" style={{ height: 22 }}>
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "#6366f1",
                                display: "inline-block",
                                animation: "lumina-dot-pulse 1.2s ease-in-out infinite",
                                animationDelay: `${i * 0.2}s`,
                              }}
                            />
                          ))}
                          <style>{`
                            @keyframes lumina-dot-pulse {
                              0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
                              40% { opacity: 1; transform: scale(1); }
                            }
                          `}</style>
                        </div>
                      ) : (
                        <p className="text-[13.5px] leading-[1.65]" style={{ color: "#374151" }}>
                          {msg.content}
                        </p>
                      )}
                    </div>
                    {!msg.pending && (
                      <div className="flex items-center gap-2 mt-2 pl-1">
                        <button
                          className="flex items-center gap-1 rounded-[5px] px-[8px] py-[4px] text-[11.5px] font-medium transition-colors"
                          style={{ color: copiedId === msg.id ? "#10b981" : "#94a3b8", background: "transparent" }}
                          onClick={() => handleCopy(msg)}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; if (copiedId !== msg.id) e.currentTarget.style.color = "#6366f1"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; if (copiedId !== msg.id) e.currentTarget.style.color = "#94a3b8"; }}
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="5" y="5" width="9" height="9" rx="1.5" />
                            <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" strokeLinecap="round" />
                          </svg>
                          {copiedId === msg.id ? "Copied!" : "Copy"}
                        </button>
                        <button
                          className="flex items-center gap-1 rounded-[5px] px-[8px] py-[4px] text-[11.5px] font-medium transition-colors"
                          style={{ color: "#94a3b8", background: "transparent" }}
                          onClick={handleRegenerate}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#6366f1"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 8a6 6 0 1011.66-2M2 8V4m0 4H6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Regenerate
                        </button>
                        <button
                          className="flex items-center gap-1 rounded-[5px] px-[8px] py-[4px] text-[11.5px] font-medium transition-colors"
                          style={{ color: "#94a3b8", background: "transparent" }}
                          onClick={handleShare}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#6366f1"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="4" r="1.5" />
                            <circle cx="4" cy="8" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <path d="M5.5 7l5-2M5.5 9l5 2" strokeLinecap="round" />
                          </svg>
                          Share
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
              <div ref={feedEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 px-4 py-3" style={{ background: "#fff", borderTop: "1px solid #e5e7f2" }}>
          <div
            className="flex items-end gap-3 rounded-[12px] px-4 py-3"
            style={{ border: "1.5px solid #e5e7f2", background: "#fafbff" }}
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any document in your knowledge base…"
              className="flex-1 resize-none bg-transparent outline-none text-[13.5px] leading-[1.5]"
              style={{ color: "#1e1b4b", minHeight: 22 }}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className="flex items-center justify-center rounded-[6px] transition-colors"
                style={{ width: 28, height: 28, color: "#94a3b8" }}
                onClick={handleAttach}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                aria-label="Attach file"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13.5 8L7.5 14a4 4 0 01-5.5-5.5l6-6a2.5 2.5 0 013.5 3.5l-6 6a1 1 0 01-1.5-1.5l5.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="flex items-center justify-center rounded-[7px] text-white font-semibold text-[12px] transition-colors"
                style={{ width: 32, height: 32, background: "#6366f1" }}
                onClick={() => sendMessage(input)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
                aria-label="Send"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2L2 8l5 2 2 5 5-13z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] mt-2" style={{ color: "#94a3b8" }}>
            lsg-RAG answers from your indexed documents only
          </p>
        </div>
      </div>

      {/* History overlay */}
      {showHistory && (
        <div
          className="flex flex-col flex-shrink-0 overflow-hidden"
          style={{ width: 280, background: "#fff", borderLeft: "1px solid #e5e7f2" }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid #e5e7f2" }}
          >
            <span className="text-[13px] font-bold flex-1" style={{ color: "#1e1b4b" }}>Chat History</span>
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center justify-center rounded-[5px] transition-colors"
              style={{ width: 24, height: 24, color: "#94a3b8" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f3fc"; e.currentTarget.style.color = "#6366f1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="3" x2="13" y2="13" />
                <line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
            {chatHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-[13px]" style={{ color: "#94a3b8" }}>No previous chats</span>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className="w-full text-left px-4 py-[10px] transition-colors"
                  style={{
                    background: currentChatId === chat.id ? "#f0f3fc" : "transparent",
                    borderLeft: currentChatId === chat.id ? "2px solid #6366f1" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (currentChatId !== chat.id) e.currentTarget.style.background = "#f8f9ff";
                  }}
                  onMouseLeave={(e) => {
                    if (currentChatId !== chat.id) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <p
                    className="text-[12.5px] font-medium truncate"
                    style={{ color: currentChatId === chat.id ? "#6366f1" : "#1e1b4b" }}
                  >
                    {chat.title}
                  </p>
                  <p className="text-[11px] mt-[2px]" style={{ color: "#94a3b8" }}>
                    {new Date(chat.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sources panel toggle strip */}
      {!sourcesOpen && !showHistory && (
        <button
          onClick={() => setSourcesOpen(true)}
          className="flex flex-col items-center justify-center flex-shrink-0 transition-colors"
          style={{ width: 36, background: "#fff", borderLeft: "1px solid #e5e7f2", color: "#94a3b8" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          aria-label="Show sources"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      )}

      {/* Sources panel */}
      {sourcesOpen && <SourcesPanel sources={[]} onClose={() => setSourcesOpen(false)} />}
    </div>
  );
}
