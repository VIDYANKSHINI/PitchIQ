import { motion } from "framer-motion"
import { ShieldCheck, ShieldAlert, DollarSign } from "lucide-react"

interface Competitor {
  name: string
  pricing: string
  strengths: string[]
  weaknesses: string[]
}

interface CompetitorAnalysisProps {
  competitorsData?: Competitor[]
}

export default function CompetitorAnalysis({ competitorsData }: CompetitorAnalysisProps) {
  const competitors = competitorsData || [
    {
      name: "Airbnb Local Experiences",
      pricing: "$30 - $150 per tour (20% platform commission)",
      strengths: [
        "Massive global brand recognition & user trust.",
        "Deep integration with homestay booking system.",
        "High quality verification process for hosts.",
      ],
      weaknesses: [
        "Lacks hyper-local customized itinerary builders.",
        "Very low presence in Tier-2/3 Indian tourist spots.",
        "Payment flows are not optimized for UPI/local cards.",
      ],
    },
    {
      name: "MakeMyTrip Itineraries",
      pricing: "Dynamic package pricing ($200 - $800 avg booking)",
      strengths: [
        "Dominant player in the Indian travel market.",
        "Direct API integrations with Indian railways and airlines.",
        "High advertising budget and SEO dominance.",
      ],
      weaknesses: [
        "Static packages rather than AI-personalized itineraries.",
        "Clunky user interface with a heavy transactional focus.",
        "Customer support is largely automated and slow.",
      ],
    },
    {
      name: "Thrillophilia",
      pricing: "A-la-carte bookings (15% commission markup)",
      strengths: [
        "Strong focus on adventurous & offbeat local activities.",
        "Deep supplier relationships with regional organizers.",
        "Strong community review platform.",
      ],
      weaknesses: [
        "Frequent booking disputes due to bad organizer sync.",
        "No continuous itinerary flow, only singular bookings.",
        "Inconsistent quality of customer onboarding.",
      ],
    },
  ]

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as any },
    },
  }

  return (
    <section 
      id="features"
      className="py-24 px-6 md:px-12 max-w-6xl mx-auto scroll-mt-20 relative z-10"
    >
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground"
        >
          Competitor Landscape
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground mt-2 font-light text-base"
        >
          Detailed breakdown of your top competitors, analyzed in real-time.
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {competitors.map((comp, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            className="bg-secondary/10 border border-border/40 rounded-xl p-6 flex flex-col gap-6 shadow-xl relative"
            style={{
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
            }}
          >
            <div className="flex flex-col gap-1 border-b border-border/20 pb-4">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                {comp.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{comp.pricing}</span>
              </div>
            </div>

            {/* Strengths */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Strengths
              </span>
              <ul className="flex flex-col gap-2">
                {comp.strengths.map((str, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-sm text-foreground/80 font-light">
                    <ShieldCheck className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border/10">
              <span className="text-xs font-semibold uppercase tracking-widest text-red-400">
                Weaknesses
              </span>
              <ul className="flex flex-col gap-2">
                {comp.weaknesses.map((weak, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-sm text-foreground/80 font-light">
                    <ShieldAlert className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
