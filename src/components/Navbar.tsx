import { Button } from "./ui/button"

export default function Navbar() {
  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Agents", href: "#agents" },
    { name: "Features", href: "#features" },
    { name: "Score", href: "#score" },
    { name: "Docs", href: "#docs" },
  ]

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-4 bg-neutral-950/70 backdrop-blur-xl border-b border-border/20 transition-all duration-300">
      {/* Left: Logo */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
        className="text-foreground text-xl font-bold tracking-tight select-none hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent font-extrabold tracking-tighter">PITCHIQ</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono font-medium">AI</span>
      </a>

      {/* Center: Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={(e) => handleScroll(e, link.href)}
            className="text-xs text-muted-foreground hover:text-primary transition-all uppercase tracking-widest font-semibold relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* Right: Analyze Idea CTA */}
      <div>
        <Button
          variant="navCta"
          size="lg"
          className="hidden md:inline-flex rounded-lg uppercase text-xs tracking-widest px-6 font-semibold border border-border/30 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300"
          onClick={() => {
            const target = document.querySelector("#input-section")
            if (target) {
              target.scrollIntoView({ behavior: "smooth" })
            }
          }}
        >
          Analyze Idea
        </Button>
      </div>
    </nav>
  )
}
