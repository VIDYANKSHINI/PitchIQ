import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

function AgentSwarmBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    interface Node {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
    }

    const nodes: Node[] = []
    const nodeCount = Math.min(70, Math.floor((width * height) / 20000))

    // Generate nodes matching PitchIQ green primary theme
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45, // Elegant slow speed
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.2,
        color: i % 5 === 0 ? "rgba(34, 197, 94, 0.45)" : "rgba(255, 255, 255, 0.15)", 
      })
    }

    const mouse = { x: -1000, y: -1000, radius: 140 }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("resize", handleResize)

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.12
            ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw and update nodes
      nodes.forEach((node) => {
        node.x += node.vx
        node.y += node.vy

        // Wrap around borders
        if (node.x < 0) node.x = width
        if (node.x > width) node.x = 0
        if (node.y < 0) node.y = height
        if (node.y > height) node.y = 0

        // Mouse interaction (push effect)
        const dx = node.x - mouse.x
        const dy = node.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius
          const angle = Math.atan2(dy, dx)
          node.x += Math.cos(angle) * force * 1.5
          node.y += Math.sin(angle) * force * 1.5
        }

        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
}

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  }

  const handleScrollTo = (id: string) => {
    const target = document.querySelector(id)
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex items-end bg-hero-bg overflow-hidden">
      {/* Premium CSS Ambient Fallback Background (Always rendered in base layer) */}
      <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.12]" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
        {/* Moving / Glowing blobs */}
        <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[30%] right-[10%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[60%] left-[50%] w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Interactive 2D Canvas Agent Swarm (High-performance, 0% Lag) */}
      <AgentSwarmBackground />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45 z-[1] pointer-events-none" />

      {/* Content container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 pointer-events-none w-full max-w-[90%] sm:max-w-md lg:max-w-2xl px-6 md:px-10 pb-16 md:pb-24 pt-32"
      >
        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-[clamp(3rem,8vw,6rem)] font-bold leading-[1.05] tracking-[-0.05em] text-foreground mb-2 md:mb-4 uppercase"
        >
          PITCHIQ <span className="text-primary font-bold">AI</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-foreground/80 text-[clamp(1.125rem,2.5vw,1.875rem)] font-light mb-3 md:mb-6"
        >
          Your AI Co-Founder.
        </motion.p>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-muted-foreground text-[clamp(0.875rem,1.5vw,1.25rem)] font-light mb-4 md:mb-8"
        >
          Describe your startup idea in plain English. PitchIQ analyzes competitors, identifies risks, creates an India-first strategy, and generates an investor-ready pitch in minutes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-3 font-bold"
        >
          <button
            onClick={() => handleScrollTo("#input-section")}
            className="pointer-events-auto bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-110 transition-all active:scale-[0.97] border-none font-semibold uppercase tracking-wider"
          >
            Analyze Startup
          </button>
          <button
            onClick={() => handleScrollTo("#how-it-works")}
            className="pointer-events-auto bg-white text-background px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-90 transition-all active:scale-[0.97] border-none font-semibold uppercase tracking-wider"
          >
            View Demo
          </button>
        </motion.div>

        {/* Trust line */}
        <motion.p
          variants={itemVariants}
          className="text-muted-foreground/60 text-xs font-light mt-4 md:mt-6"
        >
          4 AI Agents • Real Competitor Research • Investor-Ready Pitch
        </motion.p>
      </motion.div>
    </section>
  )
}
