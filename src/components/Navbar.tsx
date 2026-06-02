import { Button } from "./ui/button"

export default function Navbar() {
  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Agents", href: "#agents" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
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
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-5 bg-transparent border-b border-border/10 backdrop-blur-sm md:backdrop-blur-none">
      {/* Left: Logo */}
      <a 
        href="#" 
        onClick={(e) => {
          e.preventDefault()
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
        className="text-foreground text-xl font-bold tracking-tight select-none hover:opacity-90 transition-opacity"
      >
        PITCHIQ
      </a>

      {/* Center: Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={(e) => handleScroll(e, link.href)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-medium"
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
          className="hidden md:inline-flex rounded-lg uppercase text-xs tracking-widest px-6 font-semibold border border-border/20"
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
