import { Button, Chip, Link } from '@heroui/react'
import CodeBlock from './CodeBlock'

const installSnippet = `npm install ph-reg-bgry-mun-city-prov-zip`

const badges = [
  'TypeScript',
  'Zero deps',
  '17 Regions',
  '42 000+ Barangays',
  'PSGC 4Q 2025',
]

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-14 pb-24 bg-content1">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="flex flex-wrap justify-center gap-2">
          {badges.map((label) => (
            <Chip key={label} size="sm" variant="bordered" color="default">
              {label}
            </Chip>
          ))}
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
            Philippine Address{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Lookup Library
            </span>
          </h1>
          <p className="text-lg text-foreground-500 max-w-2xl mx-auto leading-relaxed">
            Framework-agnostic TypeScript library for ZIP code autofill and hierarchical
            region&nbsp;→&nbsp;province&nbsp;→&nbsp;municipality&nbsp;→&nbsp;barangay
            selection. Powered by official{' '}
            <span className="text-foreground font-medium">PSGC&nbsp;data</span>.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <CodeBlock code={installSnippet} language="bash" />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            color="primary"
            size="lg"
            as={Link}
            href="#demo"
            className="font-semibold shadow-lg shadow-primary/20"
          >
            Live Demo
          </Button>
          <Button
            variant="bordered"
            size="lg"
            as={Link}
            href="#api"
            className="font-semibold"
          >
            API Reference
          </Button>
        </div>

        <div className="pt-8 flex justify-center animate-bounce">
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
