import React, { useState, useEffect, useRef, useCallback } from "react";
import { sendChatMessage } from "../agent/agentApi";
import { QUICK_ACTIONS } from "../agent/insightEngine";
import { useAuth } from "../context/useAuth";
import { TrendyAIChatbotIcon, PDFExportIcon } from "./TrendyAIChatbotIcon";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
        <TrendyAIChatbotIcon className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "160ms" }}></span>
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "320ms" }}></span>
        </div>
      </div>
    </div>
  );
}

function formatInlineMarkdown(text) {
  const parts = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIdx = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    parts.push(
      <strong key={key++} className="font-semibold text-slate-900">
        {match[1]}
      </strong>
    );
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }
  return parts.length > 0 ? parts : text;
}

function renderFormattedText(text) {
  const lines = text.split("\n");
  const elements = [];
  let key = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      elements.push(<div key={key++} className="h-2" />);
      continue;
    }
    if (/^\d+\.\s/.test(t)) {
      const num = t.match(/^(\d+)\./)[1];
      const content = t.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={key++} className="flex items-start gap-2.5 my-1">
          <span className="shrink-0 min-w-[20px] h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
            {num}
          </span>
          <span className="text-sm leading-relaxed text-slate-700">
            {formatInlineMarkdown(content)}
          </span>
        </div>
      );
      continue;
    }
    if (/^[-*•]\s/.test(t)) {
      const content = t.replace(/^[-*•]\s/, "");
      elements.push(
        <div key={key++} className="flex items-start gap-2.5 my-0.5">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2"></span>
          <span className="text-sm leading-relaxed text-slate-700">
            {formatInlineMarkdown(content)}
          </span>
        </div>
      );
      continue;
    }
    if (/^[A-Z][^.!?]{0,50}:$/.test(t)) {
      elements.push(
        <p key={key++} className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-3 mb-1.5">
          {t.slice(0, -1)}
        </p>
      );
      continue;
    }
    elements.push(
      <p key={key++} className="text-sm leading-relaxed text-slate-700">
        {formatInlineMarkdown(t)}
      </p>
    );
  }
  return elements;
}

function ChatMessage({ msg, isLastAssistant, isAdmin, onSavePDF }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {isUser ? (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-xs">
          Me
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
          <TrendyAIChatbotIcon className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[82%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 shadow-xs ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-sm text-sm leading-relaxed"
              : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm"
          }`}
        >
          {isUser ? (
            msg.content
          ) : (
            <div className="space-y-0.5">
              {renderFormattedText(msg.content)}
              {isAdmin && isLastAssistant && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-medium tracking-tight">Latest Response</span>
                  <button
                    onClick={onSavePDF}
                    title="Save this AI response as a PDF report (Admin Only)"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-100 active:scale-95"
                  >
                    <PDFExportIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Save as PDF</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 px-1">{msg.time || ""}</span>
      </div>
    </div>
  );
}

// ─── OKR Copilot Sidebar & Floating Launcher ─────────────────────────────────
export default function OKRInsightAgent({
  okrs = [],
  userName = "Employee",
  targetUserName = "",
  isOpen,
  onOpen,
  onClose,
  onToggle,
  isAdmin: propIsAdmin,
}) {
  const auth = useAuth();
  const isAdmin = propIsAdmin !== undefined ? Boolean(propIsAdmin) : Boolean(auth?.isAdmin);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const okrContext = { userName, targetUserName: targetUserName || userName, okrs };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const isViewingOther = targetUserName && targetUserName !== userName && targetUserName !== "All Employees";
      const greeting = isViewingOther
        ? `Hi ${userName}! I see you're viewing ${targetUserName}'s OKRs. I can fetch their real Key Results, analyse their goals, flag risks, and answer any questions.\n\nWhat would you like to know?`
        : `Hi ${userName}! I'm your OKR Copilot. You can ask me to fetch real Key Results for any employee, analyse goals, or check progress across the company.\n\nWhat would you like to know?`;
      setMessages([
        {
          role: "assistant",
          content: greeting,
          time: now(),
        },
      ]);
    }
  }, [isOpen, targetUserName, userName]);

  const sendMessage = useCallback(
    async (text) => {
      const userText = (text || input).trim();
      if (!userText || isTyping) return;
      setInput("");
      const newMessages = [...messages, { role: "user", content: userText, time: now() }];
      setMessages(newMessages);
      setIsTyping(true);
      try {
        const { reply } = await sendChatMessage(newMessages, okrContext);
        setMessages((prev) => [...prev, { role: "assistant", content: reply, time: now() }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I ran into an error. Please try again.", time: now() },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, messages, isTyping, okrContext]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Find last assistant message and its preceding user prompt
  const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf("assistant");
  const lastAssistantMsg = lastAssistantIndex !== -1 ? messages[lastAssistantIndex] : null;

  let precedingUserPrompt = null;
  if (lastAssistantIndex > 0) {
    for (let i = lastAssistantIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        precedingUserPrompt = messages[i];
        break;
      }
    }
  }

  // Save last response as PDF (Admin only)
  const handleSaveLastResponsePDF = useCallback(() => {
    if (!lastAssistantMsg || !isAdmin) return;

    const exportDate = new Date();
    const dateFormatted = exportDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeFormatted = exportDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const escapeHtml = (str) =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const formatContentForPrint = (text) => {
      const lines = String(text || "").split("\n");
      const out = [];
      let inList = false;
      let listType = null;

      const closeList = () => {
        if (inList) {
          out.push(listType === "ol" ? "</ol>" : "</ul>");
          inList = false;
          listType = null;
        }
      };

      for (const line of lines) {
        const t = line.trim();
        if (!t) {
          closeList();
          out.push('<div style="height: 10px;"></div>');
          continue;
        }

        const formattedLine = escapeHtml(t).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Numbered list
        const numMatch = formattedLine.match(/^(\d+)\.\s*(.*)$/);
        if (numMatch) {
          if (!inList || listType !== "ol") {
            closeList();
            out.push('<ol style="margin: 6px 0 10px 0; padding-left: 22px;">');
            inList = true;
            listType = "ol";
          }
          out.push(
            `<li style="margin-bottom: 6px; font-size: 13px; line-height: 1.6; color: #1e293b;">${numMatch[2]}</li>`
          );
          continue;
        }

        // Bullet list
        const bulletMatch = formattedLine.match(/^[-*•]\s*(.*)$/);
        if (bulletMatch) {
          if (!inList || listType !== "ul") {
            closeList();
            out.push('<ul style="margin: 6px 0 10px 0; padding-left: 20px;">');
            inList = true;
            listType = "ul";
          }
          out.push(
            `<li style="margin-bottom: 6px; font-size: 13px; line-height: 1.6; color: #1e293b;">${bulletMatch[1]}</li>`
          );
          continue;
        }

        closeList();

        // Section header
        if (/^[A-Z][A-Z0-9\s-]{1,50}:$/.test(t)) {
          out.push(
            `<h4 style="margin: 18px 0 6px 0; font-size: 11px; font-weight: 800; color: #4338ca; text-transform: uppercase; letter-spacing: 0.08em;">${formattedLine}</h4>`
          );
          continue;
        }

        out.push(
          `<p style="margin: 6px 0; font-size: 13px; line-height: 1.65; color: #334155;">${formattedLine}</p>`
        );
      }
      closeList();
      return out.join("\n");
    };

    const targetLabel = targetUserName || userName || "Organization";
    const docTitle = `OKR_Copilot_Advisory_${targetLabel.replace(/[^a-zA-Z0-9]/g, "_")}_${exportDate.toISOString().slice(0, 10)}`;

    const printHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(docTitle)}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .brand-title {
      font-size: 9px;
      font-weight: 800;
      color: #4f46e5;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .doc-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .doc-subtitle {
      font-size: 11px;
      color: #64748b;
      margin: 3px 0 0 0;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .meta-box strong {
      color: #0f172a;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 9px;
      font-weight: 700;
      border-radius: 9999px;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 18px;
    }
    .info-item {
      font-size: 11px;
    }
    .info-label {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
    }
    .inquiry-box {
      background: #eef2ff;
      border-left: 3px solid #6366f1;
      padding: 10px 14px;
      border-radius: 4px;
      margin-bottom: 18px;
    }
    .inquiry-label {
      font-size: 10px;
      font-weight: 800;
      color: #4338ca;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }
    .inquiry-text {
      font-size: 12px;
      font-style: italic;
      color: #312e81;
      margin: 0;
    }
    .response-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 18px;
      background: #ffffff;
      margin-bottom: 24px;
    }
    .response-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      color: #4338ca;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 12px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">OKR System · Performance Intelligence</div>
      <h1 class="doc-title">OKR Copilot Advisory Briefing</h1>
      <p class="doc-subtitle">Executive AI Analysis &amp; Strategic Performance Insights</p>
    </div>
    <div class="meta-box">
      <div><strong>Date:</strong> ${escapeHtml(dateFormatted)}</div>
      <div><strong>Time:</strong> ${escapeHtml(timeFormatted)}</div>
      <div style="margin-top: 4px;"><span class="badge">ADMIN CONFIDENTIAL</span></div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Evaluated Subject</div>
      <div class="info-value">${escapeHtml(targetLabel)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Administrative Auditor</div>
      <div class="info-value">${escapeHtml(userName || "Administrator")}</div>
    </div>
  </div>

  ${
    precedingUserPrompt
      ? `
  <div class="inquiry-box">
    <div class="inquiry-label">Administrative Inquiry / Prompt</div>
    <p class="inquiry-text">"${escapeHtml(precedingUserPrompt.content)}"</p>
  </div>
  `
      : ""
  }

  <div class="response-card">
    <div class="response-header">
      <span>OKR Copilot Strategic Findings</span>
      <span style="color: #94a3b8; font-weight: normal; margin-left: auto;">${escapeHtml(lastAssistantMsg.time || timeFormatted)}</span>
    </div>
    <div class="response-body">
      ${formatContentForPrint(lastAssistantMsg.content)}
    </div>
  </div>

  <div class="footer">
    <div>Generated by OKR Copilot · Enterprise Performance Intelligence</div>
    <div>Strictly Confidential</div>
  </div>
</body>
</html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    try {
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(printHtml);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.error("Print error:", e);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1500);
        }
      }, 300);
    } catch (err) {
      console.error("Failed to generate PDF print iframe:", err);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }
  }, [lastAssistantMsg, isAdmin, targetUserName, userName, precedingUserPrompt]);

  return (
    <>
      {/* ── Floating Chatting Agent Icon in Bottom Corner ────── */}
      {!isOpen && (
        <button
          onClick={onOpen || onToggle}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white shadow-2xl hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-1 active:translate-y-0 border border-slate-700/80 backdrop-blur-md cursor-pointer"
          title="Open OKR Copilot"
          aria-label="Open OKR Copilot"
        >
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-inner">
            <TrendyAIChatbotIcon className="w-4 h-4 text-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </span>
          <span className="text-xs font-semibold tracking-wide pr-1">Ask AI</span>
        </button>
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className="fixed right-0 z-40 flex flex-col bg-white border-l border-slate-200 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          top: "102px",
          bottom: 0,
          width: "500px",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          borderTopLeftRadius: "24px",
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700"></div>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>
          <div className="relative px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-white shadow-inner">
                  <TrendyAIChatbotIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-extrabold text-base tracking-tight">OKR Copilot</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-indigo-200 text-[11px] font-medium">Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && lastAssistantMsg && (
                  <button
                    onClick={handleSaveLastResponsePDF}
                    title="Save latest AI response as PDF (Admin Only)"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/15 hover:bg-white/25 transition-all border border-white/20 active:scale-95 shadow-xs"
                  >
                    <PDFExportIcon className="w-3.5 h-3.5 text-white" />
                    <span>Save PDF</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  title="Close OKR Copilot"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Chat Messages ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: "#f8fafc" }}>
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              msg={msg}
              isLastAssistant={i === lastAssistantIndex}
              isAdmin={isAdmin}
              onSavePDF={handleSaveLastResponsePDF}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick questions ─────────────────────────────────── */}
        {messages.length <= 1 && (
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quick questions</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => sendMessage(action.prompt)}
                  disabled={isTyping}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input area ───────────────────────────────────────── */}
        <div className="shrink-0 px-4 py-3 bg-white border-t border-slate-200">
          <div className="flex items-end gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your OKRs or the app..."
              rows={1}
              disabled={isTyping}
              className="flex-1 resize-none text-sm text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none disabled:opacity-60 max-h-28 overflow-y-auto"
              style={{ lineHeight: "1.5" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shrink-0 transition-all hover:shadow-md hover:shadow-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <svg className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-slate-400">Shift+Enter for new line</span>
            <button
              onClick={() => setMessages([])}
              className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear chat
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
