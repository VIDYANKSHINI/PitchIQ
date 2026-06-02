import { motion } from "framer-motion"
import { AlertTriangle, TrendingDown, Target, HelpCircle } from "lucide-react"

interface Risk {
  title: string
  desc: string
  impact: string
}

interface FailureAnalysisProps {
  risksData?: Risk[]
}

export default function FailureAnalysis({ risksData }: FailureAnalysisProps) {
  const icons = [TrendingDown, Target, AlertTriangle, HelpCircle]
  
  const rawRisks = risksData || [
    {
      title: "High Customer Acquisition Cost (CAC)",
      desc: "Bidding on travel & itinerary keywords is highly competitive, raising digital CAC. Homestay aggregates dominate local search.",
      impact: "HIGH",
    },
    {
      title: "Highly Competitive Market",
      desc: "Large incumbent OTA platforms possess massive brand equity and local supplier integrations, raising barriers to entry.",
      impact: "MEDIUM-HIGH",
    },
    {
      title: "Weak Monetization Buffer",
      desc: "Commission-only margins on tour operators are thin. Without SaaS elements or premium itinerary upgrades, LTV remains low.",
      impact: "HIGH",
    },
    {
      title: "User Retention Concerns",
      desc: "Leisure travel is a low-frequency transaction (1-2 times annually). Sustaining monthly active user engagement is difficult.",
      impact: "MEDIUM",
    },
  ]

  const risks = rawRisks.map((r, idx) => ({
    ...r,
    icon: icons[idx % icons.length]
  }))

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as any },
    },
  }

  return (
    <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground flex items-center justify-center gap-3"
        >
          Why This Startup Might Fail
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground mt-2 font-light text-base"
        >
          Devil's Advocate assessment outlining crucial vulnerability vectors.
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {risks.map((risk, index) => {
          const Icon = risk.icon
          return (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-red-950/10 hover:bg-red-950/20 border border-red-900/30 hover:border-red-500/30 rounded-xl p-6 transition-all duration-300 relative flex flex-col gap-3"
              style={{
                boxShadow: "inset 0 1px 0 0 rgba(220, 38, 38, 0.05)",
              }}
            >
              <div className="flex items-center justify-between border-b border-red-900/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400 border border-red-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-foreground text-base tracking-tight">
                    {risk.title}
                  </h3>
                </div>
                <span className="text-[10px] font-bold tracking-widest bg-red-500/15 border border-red-500/35 text-red-400 px-2 py-0.5 rounded-full">
                  {risk.impact}
                </span>
              </div>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                {risk.desc}
              </p>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
