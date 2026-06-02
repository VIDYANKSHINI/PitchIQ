export default function Footer() {
  const handleScrollTo = (id: string) => {
    const target = document.querySelector(id)
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="border-t border-border/20 bg-black/60 relative z-10 py-16 px-8 md:px-16 mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left Column: Branding */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-xl font-bold text-foreground tracking-tight select-none">
            PITCHIQ <span className="text-primary font-bold">AI</span>
          </span>
          <p className="text-muted-foreground text-sm font-light">
            Your AI Co-Founder for Startup Validation
          </p>
        </div>

        {/* Right Column: Links */}
        <div className="flex flex-wrap justify-center items-center gap-8 font-medium text-sm text-muted-foreground">
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault()
              handleScrollTo("#how-it-works")
            }}
            className="hover:text-foreground transition-colors uppercase tracking-widest text-xs"
          >
            How It Works
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-foreground transition-colors uppercase tracking-widest text-xs"
          >
            Privacy
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-foreground transition-colors uppercase tracking-widest text-xs"
          >
            Terms
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors flex items-center gap-1.5 uppercase tracking-widest text-xs"
          >
            <svg 
              className="w-4 h-4" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            GitHub
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-border/10 mt-12 pt-8 flex justify-center text-center">
        <p className="text-muted-foreground/30 text-xs font-light">
          &copy; {new Date().getFullYear()} PitchIQ AI. All rights reserved. Deployed with zero-trust AI architectures.
        </p>
      </div>
    </footer>
  )
}
