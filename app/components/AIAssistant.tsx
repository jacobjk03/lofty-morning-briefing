'use client'
import { useState, useRef, useEffect } from 'react'
import { SparkleIcon, ArrowUpIcon } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import Orb from './Orb'

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
    <div className="canvas-dark canvas-grid flex flex-col h-full relative">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-pill bg-cyan-300" />
            <span className="text-[10px] font-semibold tracking-wider2 text-white/80">LOFTY AI</span>
          </span>
          <span className="text-white/15 text-xs">/</span>
          <span className="text-[11px] text-white/40 font-medium">Conversation</span>
        </div>
        <span className="text-[10px] text-white/30 font-medium">Powered by Groq · llama-3.3-70b</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll relative z-10">
        <div className="max-w-3xl mx-auto px-6 py-10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center pt-8">
              <Orb state="idle" size={96} />
              <h2 className="text-white text-[26px] font-semibold tracking-tightest mt-6">How can I help?</h2>
              <p className="text-white/40 text-[13px] mt-2 max-w-sm">
                I know your leads, transactions, Smart Plans and inbox. Ask me anything.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-8 max-w-xl">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="inline-flex items-center h-9 px-4 rounded-pill text-[12.5px] font-medium
                               text-white/75 bg-white/[0.04] border border-white/[0.08]
                               hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white transition-all"
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
                           style={{
                             background: 'radial-gradient(circle at 30% 25%, #67E8F9, #2563EB 65%, #0B1220 100%)',
                             boxShadow: 'inset 0 0 10px rgba(34,211,238,0.4), 0 0 12px rgba(34,211,238,0.3)',
                           }}>
                        <SparkleIcon size={12} weight="fill" className="text-white/90" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-lg text-[13.5px] leading-[1.55]
                                ${msg.role === 'user'
                                  ? 'bg-white/[0.06] border border-white/[0.08] text-white rounded-br-sm'
                                  : 'bg-transparent text-white/85 rounded-bl-sm'}`}
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
                    <div className="w-7 h-7 rounded-pill flex items-center justify-center"
                         style={{
                           background: 'radial-gradient(circle at 30% 25%, #67E8F9, #2563EB 65%, #0B1220 100%)',
                         }}>
                      <Sparkles className="w-3 h-3 text-white/90" strokeWidth={2} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="typing-dot" style={{ background: '#22D3EE' }} />
                      <span className="typing-dot" style={{ background: '#22D3EE' }} />
                      <span className="typing-dot" style={{ background: '#22D3EE' }} />
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
      <div className="relative z-10 border-t border-white/[0.05] p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input) }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.10] rounded-pill pl-4 pr-1.5 h-11
                          focus-within:border-cyan-400/40 focus-within:bg-white/[0.05] transition-all">
            <SparkleIcon size={16} weight="regular" className="text-cyan-300/70" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lofty AI anything…"
              disabled={loading}
              className="flex-1 bg-transparent text-[13px] text-white placeholder-white/35 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 flex items-center justify-center rounded-pill transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: input.trim() ? '#22D3EE' : 'rgba(255,255,255,0.06)',
                color: input.trim() ? '#0B1220' : 'rgba(255,255,255,0.4)',
              }}
            >
              <ArrowUpIcon size={16} weight="bold" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
