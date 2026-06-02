import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MessageSquare, Bot, User, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "model"
  text: string
}

interface CoFounderChatProps {
  idea: string
}

export default function CoFounderChat({ idea }: CoFounderChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hello! I am your PitchIQ Co-Founder Swarm. I have analyzed your startup concept. What follow-up questions do you have about the market competitors, GTM, risks, or financial model?"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const presets = [
    "How do we get our first 100 users?",
    "Detail the Phase 1 GTM roadmap.",
    "What are our primary monetization channels?",
    "How can we defend against major competitors?"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    const newMessages = [...messages, { role: "user", text: textToSend } as Message]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idea: idea,
          messages: newMessages
        })
      })

      if (!response.ok) throw new Error("Failed to send message")
      
      const data = await response.json()
      setMessages((prev) => [...prev, { role: "model", text: data.text }])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Apologies, the co-founder agents experienced a sync error. Please try asking again." }
      ])
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  return (
    <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10 border-t border-border/20 mt-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">Interactive Swarm</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">
          Consult Your AI Co-Founder
        </h2>
        <p className="text-muted-foreground mt-2 font-light text-sm max-w-xl mx-auto">
          Brainstorm strategy, deep-dive into competitors, or query specific risks with the AI swarm agents in real-time.
        </p>
      </div>

      <div className="bg-secondary/10 border border-border/40 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
        {/* Chat Header */}
        <div className="bg-black/40 border-b border-border/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                PitchIQ Agents Chat
              </h3>
              <p className="text-[10px] text-primary font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                Swarm Online
              </p>
            </div>
          </div>
        </div>

        {/* Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 select-text">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isAgent = msg.role === "model"
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 max-w-[85%] ${isAgent ? "self-start" : "self-end flex-row-reverse"}`}
                >
                  <div className={`p-2 rounded-lg shrink-0 h-fit ${isAgent ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary text-foreground border border-border/40"}`}>
                    {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${isAgent ? "bg-secondary/35 text-foreground/90 rounded-tl-none border border-border/20" : "bg-primary text-primary-foreground rounded-tr-none font-medium"}`}>
                    {msg.text.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.text.split("\n").length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 self-start items-center"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-secondary/30 border border-border/20 rounded-xl rounded-tl-none px-4 py-3 text-xs text-muted-foreground font-mono flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                Agents syncing consensus...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Preset Chips */}
        {messages.length === 1 && !loading && (
          <div className="px-6 pb-2 pt-4 flex flex-wrap gap-2">
            {presets.map((preset, i) => (
              <button
                key={i}
                onClick={() => handleSend(preset)}
                className="bg-secondary/20 hover:bg-primary/10 border border-border/40 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all text-xs px-3.5 py-1.5 rounded-full cursor-pointer font-light select-none"
              >
                {preset}
              </button>
            ))}
          </div>
        )}

        {/* Message Input Box */}
        <form onSubmit={onSubmit} className="p-4 bg-black/20 border-t border-border/30 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask anything about monetization, product moat, or local Indian scaling..."
            className="flex-1 bg-black/40 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-sora font-light resize-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-primary text-primary-foreground p-3 rounded-lg hover:brightness-110 active:scale-[0.95] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center cursor-pointer border-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </section>
  )
}
