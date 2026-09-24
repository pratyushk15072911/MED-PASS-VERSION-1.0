import React, { useState, useRef, useEffect } from 'react';
import { AppScreen } from '../../types';
import {
  MessageSquare,
  X,
  Send,
  Compass,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Minimize2,
  Maximize2,
  HelpCircle,
  FileSearch,
  Activity,
  Heart,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isSafetyGuardrail?: boolean;
  suggestedAction?: {
    label: string;
    screen?: AppScreen;
    actionType?: 'emergency' | 'scan' | 'triage' | 'wallet';
  };
}

interface TouristGuideChatbotProps {
  onNavigateScreen?: (screen: AppScreen) => void;
  onOpenEmergencyCard?: () => void;
}

const TOUR_SUGGESTIONS = [
  'What is Scan Records?',
  'How do I switch patients?',
  'Explain Emergency Triage',
  'How does Phone Sync work?',
  'What does the CDSS warning do?',
  'Where is the Emergency Card?',
];

export const TouristGuideChatbot: React.FC<TouristGuideChatbotProps> = ({
  onNavigateScreen,
  onOpenEmergencyCard,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: "👋 **Hello! I'm your MedPass Site Guide.**\n\nI'm like a tourist guide for this application: I explain how the website works, what each button does, and where to find features.\n\n⚠️ **Important Note**: I am strictly a site navigation guide and NOT smart about medicine—I cannot answer medical questions, evaluate symptoms, or recommend drugs. What part of the site would you like to explore?",
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare multi-turn messages for backend
    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      text: m.text,
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          userMessage: query,
        }),
      });

      let replyText = '';
      let isSafety = false;

      if (res.ok) {
        const data = await res.json();
        replyText = data.text || '';
        isSafety = !!data.isSafetyGuardrail;
      } else {
        replyText = getClientFallbackGuideResponse(query);
      }

      // Check if we should attach an action shortcut
      const action = detectActionShortcut(query, replyText);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: replyText || getClientFallbackGuideResponse(query),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSafetyGuardrail: isSafety,
          suggestedAction: action,
        },
      ]);
    } catch (err) {
      console.warn('Network error reaching /api/chat, using client fallback:', err);
      const fallbackText = getClientFallbackGuideResponse(query);
      const action = detectActionShortcut(query, fallbackText);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction: action,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: "👋 **Welcome back!** I'm your non-medical tourist guide for MedPass. Ask me about any tab or tool on this website!",
        timestamp: 'Just now',
      },
    ]);
  };

  function detectActionShortcut(query: string, text: string) {
    const q = (query + ' ' + text).toLowerCase();
    if (q.includes('scan records') || q.includes('ocr') || q.includes('paper prescription')) {
      return { label: 'Go to Scan Records', screen: 'document-digitization' as AppScreen, actionType: 'scan' as const };
    }
    if (q.includes('emergency card') || q.includes('paramedic')) {
      return { label: 'Open Emergency Card', actionType: 'emergency' as const };
    }
    if (q.includes('triage') || q.includes('clinical reader')) {
      return { label: 'Go to Emergency Triage', screen: 'clinical-reader' as AppScreen, actionType: 'triage' as const };
    }
    if (q.includes('health passport') || q.includes('phone') || q.includes('wallet')) {
      return { label: 'Go to Health Passport', screen: 'health-passport' as AppScreen, actionType: 'wallet' as const };
    }
    return undefined;
  }

  function getClientFallbackGuideResponse(query: string): string {
    const q = query.toLowerCase();

    // Medical guardrail check
    if (
      q.includes('take') ||
      q.includes('pill') ||
      q.includes('dose') ||
      q.includes('diagnose') ||
      q.includes('symptom') ||
      q.includes('pain') ||
      q.includes('fever') ||
      q.includes('cure')
    ) {
      return "🚨 **Medical Safety Disclaimer**: I'm strictly a website tourist guide for MedPass and cannot give medical or treatment advice! For your safety, please consult a qualified physician or access the **Emergency Card** button in the top navigation bar.";
    }

    if (q.includes('scan') || q.includes('record') || q.includes('ocr')) {
      return "📄 **Scan Records**: This tab (formerly called OCR Digitization) lets doctors and patients upload paper records, doctor prescriptions, or lab slips. The system automatically reads and digitizes the medication names and dosage values into the pass.";
    }

    if (q.includes('patient') || q.includes('switch') || q.includes('photo')) {
      return "👤 **Patient Management**: In the top-left navigation bar, click on the patient badge to switch between Shardul Kush, Kush Sharma, and Eleanor Kush. You can also click the photo thumbnail to upload a portrait image!";
    }

    if (q.includes('triage') || q.includes('clinical')) {
      return "🩺 **Emergency Triage**: Designed for emergency doctors, this 30-second rapid screen highlights active medications, confirmed allergies, red-flag contraindications, and real-time vital signs.";
    }

    if (q.includes('warning') || q.includes('cdss') || q.includes('drug')) {
      return "⚠️ **Drug Warnings (CDSS)**: This screen demonstrates Clinical Decision Support. It intercepts dangerous combinations (like Sildenafil + Nitroglycerin) and provides safe alternatives to prevent fatal clinical mistakes.";
    }

    if (q.includes('phone') || q.includes('sync')) {
      return "📱 **Phone Sync**: In the Patient Health Passport, toggle the 'Connected to Phone' button to simulate real-time synchronization between the hospital terminal and the patient's mobile phone.";
    }

    if (q.includes('emergency') || q.includes('card')) {
      return "🚑 **Emergency Card**: Click the red Emergency Card button in the header bar or Patient Wallet to view the fast resuscitation card designed for EMTs and paramedics.";
    }

    return "🗺️ **MedPass Site Map**:\n- **Emergency Triage**: Fast 30s ER clinical overview\n- **Patient Health Passport**: Personal health vault & phone sync\n- **Scan Records**: Scans paper prescriptions\n- **Drug Warnings**: CDSS lethal interaction checker\n- **Mobile Wallet**: iPhone & Android pass simulator\n\nWhat would you like to see?";
  }

  const handleExecuteAction = (action?: ChatMessage['suggestedAction']) => {
    if (!action) return;
    if (action.actionType === 'emergency') {
      if (onOpenEmergencyCard) onOpenEmergencyCard();
    } else if (action.screen && onNavigateScreen) {
      onNavigateScreen(action.screen);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 bg-[#004f45] hover:bg-[#003831] text-white px-4 py-3 rounded-full shadow-xl border-2 border-white/80 transition-all hover:scale-105 active:scale-95 focus:outline-none"
            title="Ask the MedPass Tourist Guide how the website works"
          >
            <div className="relative">
              <Compass className="w-5 h-5 text-[#86efac] animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-xs font-bold flex items-center gap-1">
                <span>Site Guide</span>
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-full font-normal">
                  Tour Bot
                </span>
              </div>
              <div className="text-[10px] text-emerald-200">How does the site work?</div>
            </div>
          </button>
        </div>
      )}

      {/* Expandable Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[410px] h-[580px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border-2 border-[#004f45]/30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-[#004f45] text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Compass className="w-5 h-5 text-[#86efac]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm leading-tight">MedPass Site Guide</h3>
                  <span className="bg-[#86efac]/20 text-[#86efac] text-[10px] px-2 py-0.5 rounded-full font-bold border border-[#86efac]/30">
                    Tour Guide
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-tight">
                  Website Tour & Feature Assistant (Non-Medical)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Safety Notice Banner */}
          <div className="bg-amber-50 border-b border-amber-200/80 px-3 py-1.5 flex items-center gap-2 text-[11px] text-amber-900 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>Tour Guide Only</strong>: Explains website features • Zero medical advice
            </span>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-[#004f45] text-white rounded-br-xs'
                        : msg.isSafetyGuardrail
                        ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-bl-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {/* Render message with linebreaks */}
                    <div className="whitespace-pre-line space-y-1.5">
                      {msg.text.split('\n\n').map((para, i) => (
                        <p key={i}>
                          {para.split('**').map((chunk, j) =>
                            j % 2 === 1 ? (
                              <strong key={j} className={isUser ? 'text-white font-bold' : 'text-[#004f45] font-bold'}>
                                {chunk}
                              </strong>
                            ) : (
                              chunk
                            )
                          )}
                        </p>
                      ))}
                    </div>

                    {/* Action shortcut button if applicable */}
                    {msg.suggestedAction && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleExecuteAction(msg.suggestedAction)}
                          className="w-full bg-[#e6f6ff] hover:bg-[#c9e7f7] text-[#004f45] border border-[#004f45]/30 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center justify-between gap-1 transition-all"
                        >
                          <span>{msg.suggestedAction.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#004f45]" />
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-fit shadow-2xs">
                <Compass className="w-4 h-4 text-[#004f45] animate-spin" />
                <span className="text-xs text-slate-500 font-medium">
                  Tour Guide is looking up website manual...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Tour Suggestions */}
          <div className="bg-white border-t border-slate-200 px-3 py-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Suggested Tour Topics</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {TOUR_SUGGESTIONS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleSendMessage(topic)}
                  disabled={isLoading}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-[#e6f6ff] hover:text-[#004f45] text-slate-600 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a website button, tab, or tool..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#004f45] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#004f45] hover:bg-[#003831] disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
              title="Send question to site guide"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
