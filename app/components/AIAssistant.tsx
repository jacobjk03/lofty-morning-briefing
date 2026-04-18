'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTERS = [
  'Who should I call first?',
  "What's urgent today?",
  'Draft a text to Scott Hayes',
  "What's the status of Johnson closing?",
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.message }])
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            "Sorry, I'm having trouble connecting right now. Make sure your GROQ_API_KEY is set in .env.local and restart the dev server.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50" style={{ minHeight: 0 }}>
      {/* Header */}
      <div
        className="shrink-0 px-6 py-4 border-b border-blue-100 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}
      >
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-white font-bold">✦</span>
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">Lofty AI</h2>
          <p className="text-blue-200 text-xs">Ask me anything about your day</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-blue-200 text-xs">Online</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-4">
        {/* Welcome */}
        {messages.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white text-2xl">✦</span>
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-1">Hi Baylee! 👋</p>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              I know everything about your CRM today. Ask me anything.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs bg-white border border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-700 px-3 py-2 rounded-full transition-all shadow-sm font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow-sm">
                <span className="text-white text-xs">✦</span>
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs">✦</span>
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
        >
          <span className="text-blue-400 text-sm">✦</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your day..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">
          Powered by Lofty AI · llama-3.3-70b via Groq
        </p>
      </div>
    </div>
  )
}
