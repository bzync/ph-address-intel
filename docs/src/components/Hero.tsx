import { Chip } from '@heroui/react'
import CodeBlock from './CodeBlock'

const installSnippet = `npm install @bzync/ph-address-intel`

const badges = [
  'TypeScript',
  'Zero deps',
  '17 Regions',
  '42 000+ Barangays',
  'Full-text Search',
  'Alias Lookup',
  'Address Validation',
  'PSGC 4Q 2025',
]

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-4 pt-16 pb-16 sm:pt-20 sm:pb-24 bg-content1 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl w-full text-center space-y-6 sm:space-y-8">
        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          {badges.map((label) => (
            <Chip key={label} size="sm" variant="secondary">
              {label}
            </Chip>
          ))}
        </div>

        {/* Heading + description */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
            Philippine Address{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
              Lookup Library
            </span>
          </h1>
          <p className="text-base sm:text-lg text-foreground-500 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Framework-agnostic TypeScript library for ZIP code autofill, full-text search,
            alias resolution, and address validation across the hierarchical
            region&nbsp;→&nbsp;province&nbsp;→&nbsp;municipality&nbsp;→&nbsp;barangay
            structure. Powered by official{' '}
            <span className="text-foreground font-medium">PSGC&nbsp;data</span>.
          </p>
        </div>

        {/* Install snippet */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <CodeBlock code={installSnippet} language="bash" />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <a
            href="#demo"
            className="inline-flex items-center justify-center px-6 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            Live Demo
          </a>
          <a
            href="#api"
            className="inline-flex items-center justify-center px-6 h-11 rounded-xl border border-divider font-semibold text-sm text-foreground hover:border-foreground-300 transition-colors"
          >
            API Reference
          </a>
        </div>

        {/* Scroll hint */}
        <div className="pt-4 sm:pt-8 flex justify-center animate-bounce">
          <svg
            className="w-5 h-5 text-foreground-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
