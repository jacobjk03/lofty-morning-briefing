'use client'
import { useState, useRef, useEffect } from 'react'
import { SparkleIcon, ArrowUpIcon } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTERS = [
  'Who should I call first?',
  "What's urgent today?",
  'Draft a text to Scott Hayes',
  'Status of Johnson closing?',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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
        { role: 'assistant', content: "I'm having trouble connecting. Check that GROQ_API_KEY is set in .env.local." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f3f4f8]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-ink-200 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
               style={{ background: 'radial-gradient(circle at 30% 25%, #67E8F9, #2563EB 65%, #0B1220 100%)' }}>
            <SparkleIcon size={12} weight="fill" className="text-white/90" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-ink-800 leading-none">Lofty AI</p>
            <p className="text-[10px] text-ink-400 mt-0.5">Ask me anything about your day</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-pill bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-ink-400 font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center pt-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md"
                   style={{ background: 'radial-gradient(circle at 30% 25%, #67E8F9, #2563EB 65%, #0B1220 100%)' }}>
                <SparkleIcon size={22} weight="fill" className="text-white/90" />
              </div>
              <h2 className="text-ink-900 text-[22px] font-semibold tracking-tightest">Hi Baylee! 👋</h2>
              <p className="text-ink-500 text-[13px] mt-2 max-w-sm">
                I know your leads, transactions, Smart Plans and inbox. Ask me anything.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-7 max-w-xl">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="inline-flex items-center h-9 px-4 rounded-pill text-[12px] font-medium
                               text-blue-700 bg-white border border-blue-200
                               hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="shrink-0 mr-3 mt-1">
                      <div className="w-7 h-7 rounded-pill flex items-center justify-center"
                           style={{ background: 'radial-gradient(circle at 30% 25%, #67E8F9, #2563EB 65%, #0B1220 100%)' }}>
                        <SparkleIcon size={12} weight="fill" className="text-white/90" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-[1.55] ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
                        : 'bg-white text-ink-800 border border-ink-200 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-pill flex items-center justify-center shrink-0"
                         style={{ background: 'radial-gradient(circle at 30% 25%, #67E8F9, #2563EB 65%, #0B1220 100%)' }}>
                      <SparkleIcon size={12} weight="fill" className="text-white/90" />
                    </div>
                    <div className="bg-white border border-ink-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-ink-200 bg-white p-4 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input) }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-2 bg-ink-50 border border-ink-200 rounded-pill pl-4 pr-1.5 h-11
                          focus-within:border-blue-400 focus-within:bg-white transition-all">
            <SparkleIcon size={15} weight="regular" className="text-blue-500" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lofty AI anything…"
              disabled={loading}
              className="flex-1 bg-transparent text-[13px] text-ink-800 placeholder-ink-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 flex items-center justify-center rounded-pill transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowUpIcon size={16} weight="bold" />
            </button>
          </div>
          <p className="text-center text-[10.5px] text-ink-400 mt-2">
            Powered by Lofty AI · llama-3.3-70b via Groq
          </p>
        </form>
      </div>
    </div>
  )
}
