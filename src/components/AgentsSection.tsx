import { motion } from "framer-motion"
import { Search, ShieldAlert, MapPin, FileText } from "lucide-react"

export default function AgentsSection() {
  const agents = [
    {
      title: "Market Scout",
      desc: "Finds real competitors using live web research.",
      icon: Search,
      glow: "group-hover:shadow-[0_0_20px_rgba(119,99,46,0.15)]",
      borderColor: "group-hover:border-primary/50",
    },
    {
      title: "Devil's Advocate",
      desc: "Challenges assumptions and identifies failure risks.",
      icon: ShieldAlert,
      glow: "group-hover:shadow-[0_0_20px_rgba(119,99,46,0.15)]",
      borderColor: "group-hover:border-primary/50",
    },
    {
      title: "India GTM Agent",
      desc: "Creates a go-to-market strategy tailored for India.",
      icon: MapPin,
      glow: "group-hover:shadow-[0_0_20px_rgba(119,99,46,0.15)]",
      borderColor: "group-hover:border-primary/50",
    },
    {
      title: "Pitch Writer",
      desc: "Generates an investor-ready startup brief.",
      icon: FileText,
      glow: "group-hover:shadow-[0_0_20px_rgba(119,99,46,0.15)]",
      borderColor: "group-hover:border-primary/50",
    },
  ]

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
      transition: {
        duration: 0.5,
        ease: "easeOut" as any,
      },
    },
  }

  return (
    <section 
      id="how-it-works" 
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
          How PitchIQ Thinks
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground mt-2 font-light text-base"
        >
          A coordinated swarm of AI agents validating your startup from every angle.
        </motion.p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {agents.map((agent, index) => {
          const IconComponent = agent.icon
          return (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className="group bg-secondary/20 hover:bg-secondary/40 border border-border/40 rounded-xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col gap-4 cursor-default"
              style={{
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Glow accent */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/0 via-primary/[0.01] to-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Subtle green outline glow on hover */}
              <div className={`absolute inset-0 border border-transparent rounded-xl transition-all duration-300 ${agent.borderColor}`} />

              <div className="p-3 bg-primary/10 rounded-lg w-fit text-primary border border-primary/20 transition-all duration-300 group-hover:bg-primary/20">
                <IconComponent className="w-6 h-6" />
              </div>

              <div className="flex flex-col gap-2 z-10">
                <h3 className="text-lg font-semibold text-foreground tracking-tight">
                  {agent.title}
                </h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">
                  {agent.desc}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
