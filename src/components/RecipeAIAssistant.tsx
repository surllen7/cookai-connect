import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot, Loader2, RotateCcw } from 'lucide-react';
import { Recipe } from '../types';
import { askAssistant } from '../lib/recipeApi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RecipeAIAssistantProps {
  recipe: Recipe;
}

const FormatMessage = ({ content }: { content: string }) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // match **bold** or *italic*
        const parts = line.split(/(\*\*.*?\*\*|\*[^*]+\*)/g);
        return (
          <div key={i} className="min-h-[1.5em] break-words">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={j} className="italic">{part.slice(1, -1)}</em>;
              }
              return <span key={j}>{part}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export default function RecipeAIAssistant({ recipe }: RecipeAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const storageKey = `recipe_chat_${recipe.name}`;

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
      { role: 'assistant', content: `你好！我是你的 AI 烹饪助手。关于这道《${recipe.name}》，有什么我可以帮你的吗？比如关于食材替换或烹饪技巧的问题。` }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const clearHistory = () => {
    if (window.confirm('确定要清空当前的聊天记录吗？')) {
      const initialMessage: Message[] = [
        { role: 'assistant', content: `你好！我是你的 AI 烹饪助手。关于这道《${recipe.name}》，有什么我可以帮你的吗？比如关于食材替换或烹饪技巧的问题。` }
      ];
      setMessages(initialMessage);
      localStorage.setItem(storageKey, JSON.stringify(initialMessage));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let assistantResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      await askAssistant(recipe, userMessage, (chunk) => {
        assistantResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantResponse;
          return newMessages;
        });
      });
    } catch (error) {
      console.error('AI Assistant Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我现在遇到了一点问题，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button Entry */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-48 right-4 h-12 pl-1.5 pr-4 bg-white/95 backdrop-blur-md border border-[#84B741]/20 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2.5 text-slate-800 z-[60] active:scale-95 transition-all group hover:border-[#84B741]/50"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#84B741] to-[#A3D164] flex items-center justify-center text-white shadow-sm">
          <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[13px] font-black leading-none text-slate-800">AI 厨艺助力</span>
          <span className="text-[9px] text-[#84B741] font-bold mt-0.5">点击提问</span>
        </div>
        {/* Unread dot */}
        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
      </button>

      {/* Chat Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/40 backdrop-blur-[2px]">
          <div className="flex-1" onClick={() => setIsOpen(false)} />
          
          <div className="w-full max-w-md mx-auto bg-white rounded-t-[32px] shadow-2xl flex flex-col h-[75vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F4F9EE] flex items-center justify-center text-[#84B741]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">AI 烹饪助手</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[11px] text-slate-400">在线为您解答</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearHistory}
                  title="清空记录"
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-all"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-5 hide-scrollbar w-full">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                  <div className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${
                      msg.role === 'user' ? 'bg-slate-100 text-slate-500' : 'bg-[#F4F9EE] text-[#84B741]'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`min-w-0 px-4 py-3 rounded-2xl text-[13px] leading-[1.6] shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-[#84B741] text-white rounded-tr-none' 
                        : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                    }`}>
                      {msg.content ? <FormatMessage content={msg.content} /> : (isLoading && i === messages.length - 1 ? (
                        <div className="flex gap-1.5 py-1">
                          <span className="w-1.5 h-1.5 bg-[#84B741]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#84B741]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#84B741]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : null)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-slate-100 pb-10 bg-slate-50/50 shrink-0">
              {/* Quick Questions */}
              <div className="mb-4 flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5">
                {['有什么烹饪小技巧？', '食材可以替换吗？', '这道菜有什么注意事项？'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="whitespace-nowrap text-[11px] text-slate-500 bg-white border border-slate-100 px-3.5 py-2 rounded-full hover:border-[#84B741] hover:text-[#84B741] transition-colors shadow-sm"
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
                  placeholder="问问助手关于这道菜..."
                  className="flex-1 bg-white border border-slate-200 rounded-full py-3.5 px-5 pr-12 text-sm focus:outline-none focus:border-[#84B741] transition-colors shadow-inner"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-1.5 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    input.trim() && !isLoading ? 'bg-[#84B741] text-white scale-100 shadow-lg' : 'bg-slate-200 text-slate-400 scale-90'
                  }`}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
