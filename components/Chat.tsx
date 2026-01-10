
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mail, File, Download, Sparkles, Loader2, TrendingUp, Briefcase } from 'lucide-react';
import { Task, Message, SellsyStatus } from '../types';
import { generateSmartReply } from '../services/ai';

interface ChatProps {
  task: Task;
  onSendMessage: (text: string) => void;
  onFinalize?: () => void; // New prop for finalizing the opportunity
}

export const Chat: React.FC<ChatProps> = ({ task, onSendMessage, onFinalize }) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [task.messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleSmartReply = async () => {
    setIsGenerating(true);
    const reply = await generateSmartReply(task, 'Moi'); // 'Moi' should ideally be current user's name
    setInputText(reply);
    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {task.messages.map((msg) => {
          const isAgent = msg.sender === 'AGENT';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex flex-col gap-1 max-w-[85%] ${isAgent ? 'items-end' : 'items-start'}`}>
                <div className="flex items-end gap-2">
                    {!isAgent && (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 flex-shrink-0">
                        {msg.senderName.charAt(0)}
                    </div>
                    )}
                    
                    <div
                    className={`p-3 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                        isAgent
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-slate-700 border border-gray-200 rounded-bl-none'
                    }`}
                    >
                    {msg.content}
                    </div>
                </div>

                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                    <div className={`mt-1 flex flex-wrap gap-2 ${isAgent ? 'justify-end pr-2' : 'pl-8'}`}>
                        {msg.attachments.map(att => (
                            <div key={att.id} className="group relative flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2 pr-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                                {att.type === 'image' ? (
                                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                                        <File size={20} />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{att.name}</p>
                                    <p className="text-[10px] text-gray-400">{att.size}</p>
                                </div>
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                                    <div className="bg-white rounded-full p-1.5 shadow-sm text-blue-600">
                                        <Download size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-2">
                 {isAgent ? 'Vous' : msg.senderName} • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        
        {/* Helper Bar */}
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-100">
                <Mail size={12} />
                <span>Objet : Re: {task.subject} <span className="font-mono font-bold text-blue-600 ml-1">{task.id}</span></span>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleSmartReply}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Réponse Magique
                </button>
                
                {onFinalize && task.quoteItems.length > 0 && (
                     <button 
                        onClick={onFinalize}
                        className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-full transition-all"
                    >
                        <Briefcase size={12} />
                        Créer Opportunité
                    </button>
                )}
            </div>
        </div>

        <div className="relative rounded-lg shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-white">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGenerating ? "Gemini rédige une réponse..." : "Écrire une réponse..."}
            disabled={isGenerating}
            // CHANGEMENT ICI: bg-gray-100 au lieu de bg-white pour le contraste
            className="block w-full rounded-lg border-0 py-3 pl-3 pr-12 bg-gray-100 text-slate-900 placeholder:text-gray-500 focus:bg-white focus:ring-0 sm:text-sm sm:leading-6 resize-none disabled:bg-gray-50 transition-colors"
            rows={2}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <Paperclip size={18} />
            </button>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isGenerating}
              className={`p-1.5 rounded-full transition-colors ${
                inputText.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
            Envoyé via {task.clientEmail} • Appuyez sur Entrée pour envoyer
        </p>
      </div>
    </div>
  );
};
