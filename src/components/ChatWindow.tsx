'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// OpenClaw Gateway URL for chat
const OPENCLAW_CHAT_URL = 'https://bot.dexpert.io';
const OPENCLAW_TOKEN = 'd405662297a58df924f621a74a491cc48abbcc421550402ef6cb2fe9fc397b94';

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useIframe, setUseIframe] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Implement actual chat API call to OpenClaw
      // For now, show a placeholder response
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Chat-Integration kommt bald! Nutze vorerst Telegram (@MoltbotAI) für Gespräche.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render iframe version (embedded OpenClaw WebChat)
  if (useIframe) {
    return (
      <div className="card p-4 flex flex-col flex-1 min-h-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-zinc-400">Chat mit Moltbot</h3>
            <p className="text-xs text-zinc-500">Direkte Kommunikation via OpenClaw</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://t.me/MoltbotAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Telegram öffnen
            </a>
            <button
              onClick={() => setUseIframe(false)}
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              Minimal-Chat
            </button>
          </div>
        </div>

        {/* Embedded WebChat */}
        <div className="flex-1 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700">
          <iframe
            src={`${OPENCLAW_CHAT_URL}/?token=${OPENCLAW_TOKEN}`}
            className="w-full h-full border-0"
            title="Moltbot Chat"
            allow="microphone"
          />
        </div>
      </div>
    );
  }

  // Render minimal chat version
  return (
    <div className="card p-4 flex flex-col flex-1 min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-400">Chat mit Moltbot</h3>
          <p className="text-xs text-zinc-500">Quick Messages</p>
        </div>
        <button
          onClick={() => setUseIframe(true)}
          className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          WebChat öffnen
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-xs text-zinc-500">
                Sende eine Nachricht an Moltbot
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Oder nutze{' '}
                <a
                  href="https://t.me/MoltbotAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Telegram
                </a>
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 border border-zinc-700">
              <span className="animate-pulse">Moltbot denkt nach...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nachricht an Moltbot..."
          disabled={isLoading}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {isLoading ? '...' : 'Senden'}
        </button>
      </div>
    </div>
  );
}
