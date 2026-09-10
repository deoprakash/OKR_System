import React, { useState, useEffect, useRef, useCallback } from "react";
import { sendChatMessage, fetchProactiveInsights } from "../agent/agentApi";
import { runLocalInsights, QUICK_ACTIONS } from "../agent/insightEngine";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const INSIGHT_STYLES = {
  warning:    { bg: "bg-rose-50",    border: "border-rose-200",    icon: "🔴", text: "text-rose-700",    label: "CRITICAL"  },
  alert:      { bg: "bg-amber-50",   border: "border-amber-200",   icon: "⚠️",  text: "text-amber-700",   label: "ALERT"     },
  insight:    { bg: "bg-emerald-50", border: "border-emerald-200", icon: "✅", text: "text-emerald-700", label: "INSIGHT"   },
  suggestion: { bg: "bg-indigo-50",  border: "border-indigo-200",  icon: "💡", text: "text-indigo-700",  label: "TIP"       },
};

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function InsightCard({ insight }) {
  const s = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.suggestion;
  return (
    <div className={`rounded-2xl border p-4 ${s.bg} ${s.border} transition-all hover:shadow-sm`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{s.icon}</span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${s.text}`}>{s.label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 leading-snug">{insight.title}</p>
      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insight.message}</p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow">AI</div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "160ms" }}></span>
          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "320ms" }}></span>
        </div>
      </div>
    </div>
  );
}

function renderFormattedText(text) {
  const lines = text.split("\n");
  const elements = [];
  let key = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t) { elements.push(<div key={key++} className="h-2" />); continue; }
    if (/^\d+\.\s/.test(t)) {
      const num = t.match(/^(\d+)\./)[1];
      const content = t.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={key++} className="flex items-start gap-2.5 my-1">
          <span className="shrink-0 min-w-[20px] h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{num}</span>
          <span className="text-sm leading-relaxed text-slate-700">{content}</span>
        </div>
      );
      continue;
    }
    if (/^-\s/.test(t)) {
      const content = t.replace(/^-\s/, "");
      elements.push(
        <div key={key++} className="flex items-start gap-2.5 my-0.5">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2"></span>
          <span className="text-sm leading-relaxed text-slate-700">{content}</span>
        </div>
      );
      continue;
    }
    if (/^[A-Z][^.!?]{0,50}:$/.test(t)) {
      elements.push(
        <p key={key++} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3 mb-1.5">{t.slice(0, -1)}</p>
      );
      continue;
    }
    elements.push(<p key={key++} className="text-sm leading-relaxed text-slate-700">{t}</p>);
  }
  return elements;
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow">Me</div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow">AI</div>
      )}
      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-sm text-sm leading-relaxed"
            : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm"
        }`}>
          {isUser ? msg.content : <div className="space-y-0.5">{renderFormattedText(msg.content)}</div>}
        </div>
        <span className="text-[10px] text-slate-400 px-1">{msg.time || ""}</span>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export default function OKRInsightAgent({ okrs = [], userName = "Employee", targetUserName = "", isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("insights");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [localInsights, setLocalInsights] = useState([]);
  const [llmInsights, setLlmInsights] = useState([]);
  const [insightsLoaded, setInsightsLoaded] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const okrContext = { userName, targetUserName: targetUserName || userName, okrs };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && activeTab === "chat") setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (okrs.length > 0) setLocalInsights(runLocalInsights(okrs));
  }, [okrs]);

  const loadLlmInsights = useCallback(async () => {
    if (insightsLoaded || !okrs.length) return;
    setLoadingInsights(true);
    try {
      const { insights } = await fetchProactiveInsights(okrContext);
      setLlmInsights(insights || []);
      setInsightsLoaded(true);
    } catch (err) {
      console.warn("[Agent] LLM insights failed:", err.message);
    } finally {
      setLoadingInsights(false);
    }
  }, [insightsLoaded, okrs]);

  useEffect(() => { if (isOpen) loadLlmInsights(); }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === "chat" && messages.length === 0) {
      const isViewingOther = targetUserName && targetUserName !== userName;
      const greeting = isViewingOther 
        ? `Hi ${userName}! I see you're viewing ${targetUserName}'s OKRs. I can analyse their goals, flag risks, and answer any questions.\n\nWhat would you like to know?`
        : `Hi ${userName}! I'm your OKR performance coach. I can analyse your goals, flag risks, and answer any questions about your progress or the app.\n\nWhat would you like to know?`;
      setMessages([{
        role: "assistant",
        content: greeting,
        time: now(),
      }]);
    }
  }, [isOpen, activeTab]);

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText || isTyping) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userText, time: now() }];
    setMessages(newMessages);
    setIsTyping(true);
    try {
      const { reply } = await sendChatMessage(newMessages, okrContext);
      setMessages(prev => [...prev, { role: "assistant", content: reply, time: now() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I ran into an error. Please try again.", time: now() }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, isTyping, okrContext]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const allInsights = [...localInsights, ...llmInsights];
  const criticalCount = allInsights.filter(i => i.type === "warning" || i.type === "alert").length;

  // Sidebar: starts below the navbar to keep it fully visible
  return (
    <aside
      className={`fixed right-0 z-40 flex flex-col bg-white border-l border-slate-200 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden`}
      style={{
        top: '102px',
        bottom: 0,
        width: '500px',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        borderTopLeftRadius: '24px',
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700"></div>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize:'20px 20px'}}></div>
        <div className="relative px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-xl shadow-inner">🤖</div>
              <div>
                <p className="text-white font-extrabold text-base tracking-tight">OKR AI Coach</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-indigo-200 text-[11px] font-medium">Online · Groq Llama 3</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* {criticalCount > 0 && (
            <div className="mt-3 bg-rose-500/20 border border-rose-300/30 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-rose-300 text-sm">⚠️</span>
              <span className="text-white text-xs font-medium">{criticalCount} alert{criticalCount > 1 ? "s" : ""} need{criticalCount === 1 ? "s" : ""} your attention</span>
            </div>
          )} */}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-100 bg-white shrink-0">
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "insights" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/40" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span>📊</span> Insights
          {allInsights.length > 0 && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === "insights" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>
              {allInsights.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "chat" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/40" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span>💬</span> Ask AI
        </button>
      </div>

      {/* ── Insights Tab ──────────────────────────────────────── */}
      {activeTab === "insights" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f8fafc' }}>
          {loadingInsights && llmInsights.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-3">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:'3px'}}></div>
              <p className="text-slate-500 text-sm font-medium">Analysing your OKRs...</p>
              <p className="text-slate-400 text-xs">Llama 3 is reviewing your performance</p>
            </div>
          )}
          {!loadingInsights && allInsights.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">✨</div>
              <p className="text-slate-600 font-semibold text-sm">No insights yet</p>
              <p className="text-slate-400 text-xs max-w-[200px]">Add quarterly progress data to your OKRs to get AI-powered insights.</p>
            </div>
          )}
          {allInsights.map((insight, i) => <InsightCard key={i} insight={insight} />)}
          {allInsights.length > 0 && (
            <button
              onClick={() => setActiveTab("chat")}
              className="w-full py-3 text-sm font-semibold text-indigo-600 bg-white border border-indigo-200 rounded-2xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              💬 Ask a follow-up question
            </button>
          )}
        </div>
      )}

      {/* ── Chat Tab ──────────────────────────────────────────── */}
      {activeTab === "chat" && (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: '#f8fafc' }}>
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 bg-white border-t border-slate-100 shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quick questions</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map(action => (
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

          {/* Input area */}
          <div className="shrink-0 px-4 py-3 bg-white border-t border-slate-200">
            <div className="flex items-end gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
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
              <button onClick={() => setMessages([])} className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors">
                Clear chat
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
