import React, { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Terminal } from "lucide-react"

interface InputSectionProps {
  onAnalyze: (idea: string) => void
  isAnalyzing: boolean
}

export default function InputSection({ onAnalyze, isAnalyzing }: InputSectionProps) {
  const [idea, setIdea] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim()) return
    onAnalyze(idea)
  }

  return (
    <section 
      id="input-section" 
      className="py-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="w-full bg-secondary/30 backdrop-blur-xl border border-border/30 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Describe Your Startup
              </h2>
              <p className="text-muted-foreground text-sm font-light mt-0.5">
                Tell us what you're building.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={isAnalyzing}
                rows={5}
                placeholder="Example: AI-powered tourism platform for India that creates personalized local itineraries and aggregates regional homestays..."
                className="w-full bg-black/40 border border-border/50 rounded-xl p-4 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/60 transition-all font-sora font-light text-base resize-none"
              />
              <div className="absolute bottom-3 right-4 text-xs text-muted-foreground/40 font-mono">
                {idea.length} chars
              </div>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !idea.trim()}
              className="w-full md:w-auto self-end pointer-events-auto bg-primary text-primary-foreground font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-lg cursor-pointer hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 border-none"
            >
              {isAnalyzing ? (
                <>
                  <Terminal className="w-4 h-4 animate-pulse" />
                  Analyzing Idea...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Startup
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  )
}
