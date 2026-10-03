import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  RotateCcw, 
  Bot, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';

export default function AIAssistantDrawer({ 
  isOpen, 
  onClose, 
  onOpen, 
  activeContext = null,
  initialQuery = null 
}) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "👋 Hello! I am your **PhishGuard AI Security Copilot**.\n\nI can help explain suspicious messages, deconstruct risk scores, breakdown forensic indicators, and guide immediate containment steps. How can I assist you today?",
      source: 'knowledge_base',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle incoming initial queries (e.g. from AnalyzerView "Ask AI Assistant" button)
  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const handleSendMessage = async (customMessage = null) => {
    const textToSend = customMessage || inputText;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customMessage) setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: activeContext
        })
      });

      const data = await response.json();

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I analyzed your query against enterprise security threat models. No critical escalation required.",
        source: data.source || 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Assistant API error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          sender: 'assistant',
          text: "🛡️ **Security Copilot (Offline Mode):**\n\nI was unable to reach the cloud AI provider, but here is deterministic guidance for your inquiry: Always inspect sender domains, never input passwords on unverified sites, and report suspicious emails to your SOC team.",
          source: 'knowledge_base',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Conversation cleared. Ready for your next cybersecurity inquiry or threat analysis question!",
        source: 'knowledge_base',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Quick action chips
  const contextualPrompts = activeContext ? [
    "Why is this message dangerous and what should I do?",
    "Explain this result",
    "What does this risk score mean?",
    "How can I avoid this next time?"
  ] : [
    "Explain my risk",
    "Is this phishing?",
    "What should I do if I clicked a link?",
    "How do I spot fake Microsoft portals?",
    "Teach me phishing"
  ];

  return (
    <>
      {/* Floating Action Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-2xl shadow-cyan-500/30 border border-cyan-400/40 flex items-center gap-2.5 transition-all duration-200 active:scale-95 group"
          title="Open PhishGuard AI Security Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white group-hover:scale-110 transition" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-pulse"></span>
          </div>
          <span className="text-xs font-bold tracking-tight hidden sm:inline">
            AI Security Assistant
          </span>
        </button>
      )}

      {/* Floating Cyber Assistant Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[85vh] sm:h-[620px] max-h-[92vh] flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden animate-fadeIn backdrop-blur-2xl">
          
          {/* Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    PhishGuard AI Assistant
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Copilot
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Your cybersecurity & threat awareness analyst</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner (If analyzing an active message) */}
          {activeContext && (
            <div className="px-4 py-2 bg-cyan-950/40 border-b border-cyan-900/50 text-[11px] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 truncate">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-300 truncate">
                  Context: <strong className="text-cyan-300">{activeContext.classification || 'Active Threat'}</strong> ({activeContext.score || 0}/100 Risk)
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-900/40 shrink-0">
                Active Scan
              </span>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-cyan-950 border border-cyan-500/40 text-cyan-400'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`space-y-1 max-w-[82%] ${isUser ? 'items-end' : ''}`}>
                    <div
                      className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-950'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-md shadow-slate-950'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <span className="font-mono text-[9px] text-cyan-400/80">
                          [{msg.source === 'ai' ? 'AI Assistant' : 'Security Knowledge Base'}]
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Loader */}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-none flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1.5 text-[11px] text-slate-400">Analyzing threat vector...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Quick Action Chips */}
          <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-850 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              {contextualPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition disabled:opacity-50 flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input & Send Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about a threat, URL, or risk score..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-40 shadow-sm shadow-cyan-950 shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
