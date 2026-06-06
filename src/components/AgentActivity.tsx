import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Circle } from "lucide-react"

interface AgentActivityProps {
  isAnalyzing: boolean
  onComplete: () => void
  analysisData: any
}

interface LogLine {
  text: string
  type: "system" | "market" | "devil" | "gtm" | "writer"
  timestamp: string
}

export default function AgentActivity({ isAnalyzing, analysisData, onComplete }: AgentActivityProps) {
  const [logs, setLogs] = useState<LogLine[]>([
    { text: "System standby. Awaiting startup description input...", type: "system", timestamp: "00:00:00" },
  ])
  const logContainerRef = useRef<HTMLDivElement>(null)
  const [logQueue, setLogQueue] = useState<Omit<LogLine, "timestamp">[]>([])
  const [displayedCount, setDisplayedCount] = useState(0)

  // Setup initial queue when analysis starts
  useEffect(() => {
    if (!isAnalyzing) return

    setLogs([])
    setDisplayedCount(0)
    const initialLogs: Omit<LogLine, "timestamp">[] = [
      { text: "System: Initializing PitchIQ AI Swarm...", type: "system" },
      { text: "System: Core agents spawned: [Market Scout, Devil's Advocate, India GTM, Pitch Writer]", type: "system" },
      { text: "[Market Scout] Initiating live web search for competitor landscape...", type: "market" },
      { text: "[Market Scout] Searching databases for alternative solutions...", type: "market" }
    ]
    setLogQueue(initialLogs)
  }, [isAnalyzing])

  // Overwrite queue with server logs once analysisData arrives
  useEffect(() => {
    if (analysisData && analysisData.logs) {
      setLogQueue(analysisData.logs)
    }
  }, [analysisData])

  // Process queue item-by-item
  useEffect(() => {
    if (!isAnalyzing || logQueue.length === 0) return

    if (displayedCount >= logQueue.length) {
      if (analysisData) {
        onComplete()
      }
      return
    }

    const timer = setTimeout(() => {
      const nextLog = logQueue[displayedCount]
      const date = new Date()
      const timestamp = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
      
      setLogs((prev) => [...prev, { ...nextLog, timestamp }] as LogLine[])
      setDisplayedCount((prev) => prev + 1)
    }, 700)

    return () => clearTimeout(timer)
  }, [isAnalyzing, logQueue, displayedCount, analysisData, onComplete])

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [logs])

  return (
    <section 
      id="agents" 
      className="py-12 px-6 md:px-12 max-w-5xl mx-auto scroll-mt-20 relative z-10"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border/20 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-foreground">
              Agent Activity Console
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <Circle className={`w-2.5 h-2.5 ${isAnalyzing ? "text-primary animate-ping" : "text-muted-foreground"}`} fill="currentColor" />
            <span className="text-muted-foreground">{isAnalyzing ? "RUNNING" : "STANDBY"}</span>
          </div>
        </div>

        <div ref={logContainerRef} className="bg-black/80 border border-border/50 rounded-xl p-4 md:p-6 font-mono text-xs md:text-sm h-80 overflow-y-auto flex flex-col gap-2 shadow-inner select-text">
          <AnimatePresence initial={false}>
            {logs.map((log, i) => {
              let colorClass = "text-foreground"
              if (log.type === "system") colorClass = "text-muted-foreground"
              if (log.type === "market") colorClass = "text-blue-400"
              if (log.type === "devil") colorClass = "text-red-400"
              if (log.type === "gtm") colorClass = "text-yellow-400"
              if (log.type === "writer") colorClass = "text-primary"

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3 leading-relaxed"
                >
                  <span className="text-muted-foreground/40 shrink-0">{log.timestamp}</span>
                  <span className={colorClass}>{log.text}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
