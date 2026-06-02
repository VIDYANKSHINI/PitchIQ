import { useState } from "react"
import Navbar from "./components/Navbar"
import HeroSection from "./components/HeroSection"
import InputSection from "./components/InputSection"
import AgentsSection from "./components/AgentsSection"
import AgentActivity from "./components/AgentActivity"
import CompetitorAnalysis from "./components/CompetitorAnalysis"
import FailureAnalysis from "./components/FailureAnalysis"
import IndiaGtm from "./components/IndiaGtm"
import InvestorPitch from "./components/InvestorPitch"
import StartupScore from "./components/StartupScore"
import CoFounderChat from "./components/CoFounderChat"
import Footer from "./components/Footer"
import { motion, AnimatePresence } from "framer-motion"
import { Lock } from "lucide-react"

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [startupIdea, setStartupIdea] = useState("")

  const handleAnalyze = (idea: string) => {
    console.log("Analyzing idea:", idea)
    setIsAnalyzing(true)
    setAnalysisComplete(false)
    setAnalysisData(null)
    setError(null)
    setStartupIdea(idea)
    
    // Scroll to terminal console
    setTimeout(() => {
      const consoleEl = document.querySelector("#agents")
      if (consoleEl) {
        consoleEl.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)

    // Call backend API
    fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idea }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Analysis failed')
        return res.json()
      })
      .then((data) => {
        setAnalysisData(data)
      })
      .catch((err) => {
        console.error("API error:", err)
        setError("Failed to run the AI validation swarm. Please try again.")
        setIsAnalyzing(false)
      })
  }

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false)
    setAnalysisComplete(true)

    // Scroll to results score section after a short delay
    setTimeout(() => {
      const scoreEl = document.querySelector("#pricing")
      if (scoreEl) {
        scoreEl.scrollIntoView({ behavior: "smooth" })
      }
    }, 800)
  }

  return (
    <div className="bg-hero-bg min-h-screen font-sora antialiased text-foreground selection-none">
      <Navbar />
      
      {/* Full-screen Hero Section */}
      <HeroSection />

      {/* Startup Idea Input (Section 1) */}
      <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

      {error && (
        <div className="max-w-xl mx-auto py-4 px-6 mb-8 bg-red-950/20 border border-red-500/30 rounded-xl text-center text-red-400 text-sm font-light">
          {error}
        </div>
      )}

      {/* How PitchIQ Thinks (Section 2) */}
      <AgentsSection />

      {/* Live Agent Activity Terminal (Section 3) */}
      <AgentActivity 
        isAnalyzing={isAnalyzing} 
        analysisData={analysisData} 
        onComplete={handleAnalysisComplete} 
      />

      {/* Results / Validation Dashboard */}
      <AnimatePresence mode="wait">
        {!analysisComplete ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="py-16 px-6 max-w-xl mx-auto text-center"
          >
            <div className="bg-secondary/30 backdrop-blur-xl border border-border/30 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="p-4 bg-primary/10 rounded-full text-primary border border-primary/20 animate-pulse">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground uppercase">
                Validation Results Locked
              </h3>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                Enter your startup idea above and click <span className="text-primary font-semibold font-bold">Analyze Startup</span> to run the AI validation agents and compile the report.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Startup Score (Section 8) */}
            <StartupScore scoreData={analysisData?.score} />

            {/* Competitor Analysis (Section 4) */}
            <CompetitorAnalysis competitorsData={analysisData?.competitors} />

            {/* Failure Analysis (Section 5) */}
            <FailureAnalysis risksData={analysisData?.risks} />

            {/* India GTM Strategy (Section 6) */}
            <IndiaGtm gtmData={analysisData?.gtm} />

            {/* Investor Pitch Preview (Section 7) */}
            <InvestorPitch pitchData={analysisData?.pitch} />

            {/* Interactive Co-Founder Swarm Chat */}
            <CoFounderChat idea={startupIdea} />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default App
