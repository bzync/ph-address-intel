import { useState } from 'react'
import { Chip } from '@heroui/react'

const NAV_LINKS = [
  { label: 'Demo', href: '#demo' },
  { label: 'Install', href: '#install' },
  { label: 'API', href: '#api' },
  { label: 'Types', href: '#types' },
]

export default function AppNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Main bar */}
      <div className="bg-content1/80 backdrop-blur border-b border-divider px-4">
        <div className="max-w-screen-xl mx-auto w-full flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-primary font-mono font-semibold text-sm">PH</span>
            <span className="font-semibold text-sm text-foreground">Address</span>
            <Chip size="sm" className="ml-1 font-mono">v0.1.3</Chip>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="px-3 py-2 text-sm text-foreground-500 hover:text-foreground rounded-lg transition-colors"
              >
                {label}
              </a>
            ))}
            <a
              href="https://github.com/rzarviandoe/ph-reg-bgry-mun-city-prov-zip"
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border border-divider hover:border-foreground-300 transition-colors text-foreground"
            >
              <GitHubIcon className="w-4 h-4" />
              GitHub
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-lg text-foreground-400 hover:text-foreground hover:bg-content2 transition-colors"
          >
            {mobileOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-content1 border-b border-divider px-4 py-3 space-y-0.5">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm text-foreground-500 hover:text-foreground hover:bg-content2 rounded-lg transition-colors"
            >
              {label}
            </a>
          ))}
          <a
            href="https://github.com/bzync/ph-address-intel"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground-500 hover:text-foreground hover:bg-content2 rounded-lg transition-colors"
          >
            <GitHubIcon className="w-4 h-4" />
            GitHub
          </a>
        </div>
      )}
    </header>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
