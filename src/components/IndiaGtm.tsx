import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react"

interface GtmStep {
  phase: string
  title: string
  highlights: string[]
}

interface InnovationDetail {
  title: string
  description: string
  points: string[]
}

interface IndiaGtmProps {
  gtmData?: GtmStep[]
  innovationData?: InnovationDetail
}

export default function IndiaGtm({ gtmData, innovationData }: IndiaGtmProps) {
  const roadmap = gtmData || [
    {
      phase: "Phase 1",
      title: "Core Infrastructure & Local Friction Reduction",
      highlights: [
        "UPI Integration: Single-click instant payment nodes via PhonePe and GPay SDKs to maximize conversion.",
        "WhatsApp Onboarding: Zero-app-install itinerary query engine running directly on WhatsApp API.",
        "Hindi Support: Dynamic multilingual conversational AI interface for onboarding support.",
      ],
    },
    {
      phase: "Phase 2",
      title: "Regional Penetration & Organic Growth",
      highlights: [
        "Regional Languages: Support for Tamil, Telugu, Kannada, Bengali, and Marathi to target Tier-2 hubs.",
        "College Partnerships: Campus ambassador programs in major universities to seed youth travel loops.",
        "Community Growth: Micro-incentives for users sharing itinerary reviews via local social networks.",
      ],
    },
  ]

  const innovation = innovationData || {
    title: "Zero-Friction Conversational Commerce Moat",
    description: "Our co-founder agent swarm bypasses clunky App Store installations by deploying a lightweight, AI-driven planning flow natively on WhatsApp, coupled with automatic offline UPI QR validation loops.",
    points: [
      "Grassroots Niche Guild Networks: Direct physical partnerships with regional homestay hosts and tourist guilds that aren't indexed on global OTAs like Airbnb or MakeMyTrip.",
      "Dynamic Vernacular Dialect Routing: Multi-agent conversational translation system that automatically parses Hinglish, Tamil-English, and other colloquial queries to return accurate itineraries.",
      "Frictionless Instant UPI Node: Bypasses 3-5 day banking settlement delays by routing commissions directly to regional operators' accounts instantly upon booking validation."
    ]
  }

  return (
    <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground"
        >
          India-First Strategy
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground mt-2 font-light text-base"
        >
          Hyper-localized go-to-market playbook tailored for the Indian landscape.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {roadmap.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className="bg-secondary/15 border border-border/40 rounded-xl p-8 flex flex-col gap-6 relative overflow-hidden"
            style={{
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
            }}
          >
            {/* Phase Badge */}
            <div className="absolute top-0 right-0 bg-primary/10 border-l border-b border-primary/20 text-primary font-mono text-xs font-bold px-4 py-2 rounded-bl-xl uppercase tracking-wider">
              {item.phase}
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-foreground tracking-tight pr-16">
                {item.title}
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {item.highlights.map((hl, i) => {
                const [title, desc] = hl.split(":")
                return (
                  <div key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-semibold text-foreground text-primary pr-1">
                        {title}:
                      </span>
                      <span className="text-muted-foreground font-light leading-relaxed">
                        {desc}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {idx === 0 && (
              <div className="absolute bottom-6 right-6 hidden md:block opacity-20 hover:opacity-40 transition-opacity">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Innovation / How We Stand Out section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-12 bg-gradient-to-r from-primary/10 via-secondary/15 to-transparent border border-primary/20 rounded-xl p-8 relative overflow-hidden"
        style={{
          boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
        }}
      >
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg text-primary border border-primary/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold font-mono tracking-widest text-primary uppercase">Innovation</span>
              <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                How We Stand Out: {innovation.title}
              </h3>
            </div>
          </div>
          
          <p className="text-muted-foreground font-light text-sm md:text-base leading-relaxed max-w-3xl">
            {innovation.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border/20 pt-6 mt-2">
            {innovation.points.map((pt, i) => {
              const parts = pt.split(":")
              const title = parts[0]
              const text = parts.slice(1).join(":")
              return (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h4 className="text-sm font-bold text-foreground tracking-tight uppercase">
                      {title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    {text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
