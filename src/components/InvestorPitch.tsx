import { useState } from "react"
import { motion } from "framer-motion"
import { FileDown, CheckCircle, AlertTriangle } from "lucide-react"

interface PitchSection {
  title: string
  text: string
}

interface PitchData {
  businessTitle?: string
  sections: PitchSection[]
  gtmStrategy: string
  criticalRisks: string
}

interface InvestorPitchProps {
  pitchData?: PitchData
}

export default function InvestorPitch({ pitchData }: InvestorPitchProps) {
  const [downloading, setDownloading] = useState(false)

  const businessTitle = pitchData?.businessTitle || "WanderLoom AI"

  const sections = pitchData?.sections || [
    {
      title: "Problem Statement",
      text: "Leisure travelers in India lack access to hyper-local activity scheduling. OTA packages are rigid, and smaller regional homestays suffer from poor digital visibility, leading to highly generic travel patterns.",
    },
    {
      title: "Proposed Solution",
      text: "A WhatsApp-based AI travel co-founder that builds custom, dynamic local itineraries in real-time, integrating regional travel agents and homestay bookings with frictionless UPI payment workflows.",
    },
    {
      title: "Market Opportunity",
      text: "Domestic tourism in India is experiencing exponential post-digitization growth, currently estimated at over $150B. The Tier-2 and Tier-3 leisure segment is expanding rapidly but remains highly fragmented.",
    },
    {
      title: "Revenue Model",
      text: "A transactional commission model (12-15% on local activities & accommodations) combined with a premium SaaS subscription tier for travel planners and homestay hosts to manage customer flows.",
    },
    {
      title: "Competitive Advantage",
      text: "Hyper-localized AI agents capable of instant regional coordination, lightweight WhatsApp onboarding, and a direct UPI checkout node that reduces cart dropouts by 40%.",
    },
  ]

  const gtmStrategy = pitchData?.gtmStrategy || "Deploy localized WhatsApp marketing loops targeted at Tier-2 cities in India. Partner with local travel influencers and homestay guilds to aggregate primary inventory nodes."
  const criticalRisks = pitchData?.criticalRisks || "Customer acquisition cost inflation due to keyword competition, accommodation compliance standards, and supplier retention friction."

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      // Generate dynamically based on dynamic props
      let content = `PITCHIQ AI - STARTUP VALIDATION BRIEF\n` +
        `VENTURE: ${businessTitle.toUpperCase()}\n` +
        `DATE: ${new Date().toLocaleDateString()}\n\n`
      
      sections.forEach((sect) => {
        content += `${sect.title.toUpperCase()}:\n${sect.text}\n\n`
      })
      
      content += `GO-TO-MARKET STRATEGY:\n${gtmStrategy}\n\n`
      content += `CRITICAL RISKS:\n${criticalRisks}\n`
      
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${businessTitle.replace(/\s+/g, "-")}-Startup-Brief.txt`
      link.click()
      URL.revokeObjectURL(url)
      setDownloading(false)
    }, 1500)
  }

  return (
    <section 
      id="docs"
      className="py-24 px-6 md:px-12 max-w-5xl mx-auto scroll-mt-20 relative z-10"
    >
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground"
        >
          Investor Brief
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground mt-2 font-light text-base"
        >
          One-page investment memorandum prepared by the PitchIQ core writer.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="bg-secondary/10 border border-border/40 rounded-xl p-6 md:p-10 shadow-2xl relative"
        style={{
          boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Pitch Sheet Grid */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/20 pb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 mb-2 font-mono animate-pulse">
                Featured Venture
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight uppercase bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent drop-shadow-sm">
                {businessTitle}
              </h3>
              <p className="text-muted-foreground text-xs font-mono mt-1">
                VALIDATION CODE: PIQ-2026-T1
              </p>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="pointer-events-auto shrink-0 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-lg cursor-pointer hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50 flex items-center gap-2 border-none"
            >
              <FileDown className="w-4 h-4" />
              {downloading ? "Compiling Brief..." : "Download PDF Brief"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((sect, i) => (
              <div key={i} className="flex flex-col gap-2">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">
                  {sect.title}
                </h4>
                <p className="text-foreground/80 font-light text-sm leading-relaxed">
                  {sect.text}
                </p>
              </div>
            ))}

            {/* Combined Strategy & Risks */}
            <div className="flex flex-col gap-4 md:col-span-2 border-t border-border/20 pt-6 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Go-To-Market Strategy
                  </h4>
                  <p className="text-foreground/80 font-light text-sm leading-relaxed">
                    {gtmStrategy}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Critical Risks
                  </h4>
                  <p className="text-foreground/80 font-light text-sm leading-relaxed">
                    {criticalRisks}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
