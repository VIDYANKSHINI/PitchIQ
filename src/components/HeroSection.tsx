import React, { Suspense, useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import ErrorBoundary from "./ErrorBoundary"

const Spline = React.lazy(() => import("@splinetool/react-spline"))

export default function HeroSection() {
  const [shouldRenderSpline, setShouldRenderSpline] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setShouldRenderSpline(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShouldRenderSpline(entry.isIntersecting)
      },
      { 
        root: null,
        threshold: 0.01 // Unmount as soon as the hero is off screen
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [isMobile])

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
    <section ref={sectionRef} className="relative min-h-screen flex items-end bg-hero-bg overflow-hidden">
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

      {/* Spline 3D Background - Loaded only on desktop and only when inside viewport */}
      {shouldRenderSpline && (
        <div className="absolute inset-0 z-0">
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <Spline
                scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
                className="w-full h-full"
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}

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
