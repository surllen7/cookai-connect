import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Bot, Loader2, RotateCcw, Check, CheckSquare } from 'lucide-react';
import { askGeneralAssistant } from '../lib/recipeApi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HomepageAIAssistantProps {
  onApplyIngredients: (names: string[]) => void;
}

const parseIngredients = (content: string): string[] => {
  const match = content.match(/\[INGREDIENTS:\s*([^\]]+)\]/i);
  if (match && match[1]) {
    return match[1].split(/[，,]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const cleanMessageContent = (content: string): string => {
  return content.replace(/\[INGREDIENTS:\s*[^\]]+\]/gi, '').trim();
};

const FormatMessage = ({ content }: { content: string }) => {
  const cleanText = cleanMessageContent(content);
  if (!cleanText) return null;

  const lines = cleanText.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // match **bold** or *italic*
        const parts = line.split(/(\*\*.*?\*\*|\*[^*]+\*)/g);
        return (
          <div key={i} className="min-h-[1.5em] break-words">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={j} className="italic text-slate-800">{part.slice(1, -1)}</em>;
              }
              return <span key={j}>{part}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export default function HomepageAIAssistant({ onApplyIngredients }: HomepageAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(true); // Red dot indicator
  const storageKey = 'homepage_chat_history';

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    return [
      { 
        role: 'assistant', 
        content: '嗨！我是你的 AI 美食向导 🧑‍🍳\n今天是不是不知道吃什么？告诉我你当下的心情、口味偏好（如：想吃辣、想减脂），或者想用什么特别的食材，我来为你量身推荐！🍲' 
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appliedIndices, setAppliedIndices] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    if (window.confirm('确定要清空聊天记录吗？')) {
      const initialMessage: Message[] = [
        { 
          role: 'assistant', 
          content: '嗨！我是你的 AI 美食向导 🧑‍🍳\n今天是不是不知道吃什么？告诉我你当下的心情、口味偏好（如：想吃辣、想减脂），或者想用什么特别的食材，我来为你量身推荐！🍲' 
        }
      ];
      setMessages(initialMessage);
      localStorage.setItem(storageKey, JSON.stringify(initialMessage));
      setAppliedIndices([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNew(false); // Clear red dot when opened
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const userMsgText = textToSend || input;
    if (!userMsgText.trim() || isLoading) return;

    if (!textToSend) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsgText.trim() }]);
    setIsLoading(true);

    try {
      let assistantResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      await askGeneralAssistant(userMsgText.trim(), (chunk) => {
        assistantResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantResponse;
          return newMessages;
        });
      });
    } catch (error) {
      console.error('AI General Assistant Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我现在遇到了一点网络阻塞，请稍后再试。🥫' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (ingredientNames: string[], index: number) => {
    if (ingredientNames.length === 0) return;
    onApplyIngredients(ingredientNames);
    setAppliedIndices(prev => [...prev, index]);
    
    // Show premium visual toast
    setToastMessage(`已为您在首页自动勾选: ${ingredientNames.join('、')}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const QUICK_PROMPTS = [
    '随机推荐几道经典家常菜 🍛',
    '天气好热，推荐清爽减脂的！🥗',
    '今晚想喝汤，求推荐 🥣',
    '冰箱里有西红柿和鸡蛋，还能怎么做？🍅'
  ];

  return (
    <>
      {/* Floating Button Entry */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-56 right-4 h-12 pl-1.5 pr-4 bg-white/95 backdrop-blur-md border border-[#84B741]/20 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2.5 text-slate-800 z-[60] active:scale-95 transition-all group hover:border-[#84B741]/50"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#84B741] to-[#A3D164] flex items-center justify-center text-white shadow-sm">
          <Bot size={18} className="group-hover:animate-bounce-subtle" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[13px] font-black leading-none text-slate-800">今天吃什么</span>
          <span className="text-[9px] text-[#84B741] font-bold mt-0.5">AI 灵感向导</span>
        </div>
        {/* Unread dot */}
        {hasNew && (
          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] bg-slate-900/90 text-white text-xs font-semibold py-3 px-5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in duration-300">
          <div className="w-5 h-5 rounded-full bg-[#84B741] flex items-center justify-center text-white">
            <Check size={12} strokeWidth={3} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Chat Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="flex-1" onClick={() => setIsOpen(false)} />
          
          <div className="w-full max-w-md mx-auto bg-white rounded-t-[32px] shadow-2xl flex flex-col h-[78vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F4F9EE] flex items-center justify-center text-[#84B741] border border-[#84B741]/10">
                  <Sparkles size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">今天吃什么・AI 灵感助手</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    <span className="text-[11px] text-slate-400 font-medium">随时为您推荐食材与菜品</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearHistory}
                  title="清空记录"
                  className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-sm active:scale-90 transition-all"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-sm active:scale-90 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-5 hide-scrollbar w-full bg-[#FCFBF9]">
              {messages.map((msg, i) => {
                const ingredientsList = parseIngredients(msg.content);
                const isApplied = appliedIndices.includes(i);
                
                return (
                  <div key={i} className={`flex flex-col gap-2 w-full`}>
                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                      <div className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${
                          msg.role === 'user' ? 'bg-white border border-slate-200 text-slate-500' : 'bg-[#F4F9EE] border border-[#84B741]/10 text-[#84B741]'
                        }`}>
                          {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                        </div>
                        <div className={`min-w-0 px-4 py-3 rounded-2xl text-[13px] leading-[1.6] shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-[#84B741] text-white rounded-tr-none font-medium' 
                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                        }`}>
                          {msg.content ? (
                            <FormatMessage content={msg.content} />
                          ) : (
                            isLoading && i === messages.length - 1 ? (
                              <div className="flex gap-1.5 py-1">
                                <span className="w-1.5 h-1.5 bg-[#84B741]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-[#84B741]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-[#84B741]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Ingredients Import Box */}
                    {msg.role === 'assistant' && ingredientsList.length > 0 && (
                      <div className="ml-11 max-w-[80%] bg-gradient-to-tr from-[#F8FAF4] to-[#F1F6E7] border border-[#84B741]/20 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs mb-2">
                          <CheckSquare size={14} className="text-[#84B741]" />
                          <span>推荐食材清单</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {ingredientsList.map((ing, idx) => (
                            <span 
                              key={idx} 
                              className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200/60 px-2 py-0.5 rounded-full shadow-xs"
                            >
                              💡 {ing}
                            </span>
                          ))}
                        </div>
                        {isApplied ? (
                          <div className="w-full py-2 bg-slate-100 rounded-xl flex items-center justify-center gap-1 text-[11px] font-black text-slate-500 border border-slate-200">
                            <Check size={12} strokeWidth={3} />
                            <span>食材已导入首页食材面板</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleImport(ingredientsList, i)}
                            className="w-full py-2 bg-gradient-to-r from-[#84B741] to-[#9CD44A] text-white rounded-xl text-[11px] font-black shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1"
                          >
                            <span>🥑 一键勾选并导入这些食材</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input & Prompt Actions */}
            <div className="p-5 border-t border-slate-100 pb-8 bg-white shrink-0">
              {/* Quick Prompt Carousel */}
              <div className="mb-4 flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5 select-none">
                {QUICK_PROMPTS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q.replace(/[🍛🥗🥣🍅]/g, '').trim())}
                    disabled={isLoading}
                    className="whitespace-nowrap text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3.5 py-2.5 rounded-full hover:bg-[#F4F9EE] hover:border-[#84B741]/30 hover:text-[#84B741] active:scale-95 transition-all shadow-xs"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="说你想吃的，如“想喝清淡一点的汤”..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-full py-3.5 px-5 pr-12 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#84B741] focus:shadow-inner transition-all text-slate-800"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-1.5 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    input.trim() && !isLoading ? 'bg-[#84B741] text-white scale-100 shadow-md hover:shadow-lg active:scale-95' : 'bg-slate-100 text-slate-400 scale-90'
                  }`}
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
