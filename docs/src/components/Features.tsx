import { Card, CardContent } from '@heroui/react'

const features = [
  {
    icon: '⚡',
    title: 'ZIP Autofill',
    desc: 'Provide a 4-digit Philippine ZIP code and instantly resolve it to a region, province, municipality, and list of barangays.',
  },
  {
    icon: '🗂️',
    title: 'Cascading Selection',
    desc: 'Full PSGC hierarchy support: getRegions → getProvinces → getMunicipalities → getBarangays. Plug into any UI framework.',
  },
  {
    icon: '🔗',
    title: 'Full Path Resolution',
    desc: 'Pass any PSGC code to getFullPath() and get the complete address chain — from barangay up to region — in a single call.',
  },
  {
    icon: '🔍',
    title: 'Free-Text Search',
    desc: 'Fuzzy search across all address levels with optional parent scoping. Pass a parentCode to restrict results to a specific region, province, or municipality.',
  },
  {
    icon: '📦',
    title: 'Zero Runtime Deps',
    desc: 'All PSGC and ZIP data is bundled at build time. No network calls, no external services — works offline and at the edge.',
  },
  {
    icon: '🏷️',
    title: 'TypeScript First',
    desc: 'Every function and data type is fully typed. Ships with .d.ts declarations and supports both CJS and ESM module formats.',
  },
  {
    icon: '🗺️',
    title: 'Official PSGC Data',
    desc: 'Sourced from the Philippine Statistics Authority PSGC 4Q-2025 publication. Covers all 17 regions, 80 provinces, and 42 000+ barangays.',
  },
]

export default function Features() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Everything you need</h2>
          <p className="mt-3 text-foreground-500 text-lg max-w-xl mx-auto">
            A complete address solution for any Philippine web or mobile application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border border-divider hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-6 gap-3 flex flex-col">
                <div className="text-3xl">{f.icon}</div>
                <h3 className="font-semibold text-foreground text-base">{f.title}</h3>
                <p className="text-foreground-500 text-sm leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
