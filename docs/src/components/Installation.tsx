import { Tabs, TabList, Tab, TabPanel } from '@heroui/react'
import CodeBlock from './CodeBlock'

const managers = [
  { label: 'npm', code: 'npm install @bzync/ph-address-intel' },
  { label: 'yarn', code: 'yarn add @bzync/ph-address-intel' },
  { label: 'pnpm', code: 'pnpm add @bzync/ph-address-intel' },
  { label: 'bun', code: 'bun add @bzync/ph-address-intel' },
]

const quickStart = `import {
  lookupByZip,
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
  search,
} from '@bzync/ph-address-intel'

// --- ZIP autofill ---
const result = lookupByZip('4322')
// {
//   zip: '4322',
//   region:       { code: '040000000', name: 'Region IV-A (CALABARZON)' },
//   province:     { code: '045600000', name: 'Quezon', regionCode: '040000000' },
//   municipality: { code: '045645000', name: 'Sariaya', isCity: false, zipCodes: ['4322'], ... },
//   barangays:    [ { code: '045645001', name: 'Antipolo', ... }, ... ]   // 43 items
// }

// --- Hierarchical selection ---
const regions = getRegions()                              // 17 regions
const provinces = getProvinces('040000000')               // CALABARZON → 5 provinces
const municipalities = getMunicipalities('045600000')     // Quezon → all municipalities
const barangays = getBarangays('045645000')               // Sariaya → 43 barangays

// --- NCR (no province) ---
const manilaResult = lookupByZip('1011')
// { province: null, municipality: { name: 'City of Manila', isCity: true }, ... }

// --- Free-text search ---
const hits = search('Sariaya')
// [{ type: 'municipality', code: '045645000', name: 'Sariaya', ... }]`

export default function Installation() {
  return (
    <section id="install" className="py-24 px-4 bg-background">
      <div className="max-w-4xl mx-auto space-y-14">
        <div>
          <SectionHeading tag="01" title="Installation" desc="Pick your package manager." />
          <div className="mt-6">
            <Tabs defaultSelectedKey="npm" variant="primary">
              <TabList className="border-b border-divider gap-4">
                {managers.map((m) => (
                  <Tab key={m.label} id={m.label} className="text-sm">{m.label}</Tab>
                ))}
              </TabList>
              {managers.map((m) => (
                <TabPanel key={m.label} id={m.label} className="mt-4">
                  <CodeBlock code={m.code} language="bash" />
                </TabPanel>
              ))}
            </Tabs>
          </div>
        </div>

        <div>
          <SectionHeading
            tag="02"
            title="Quick Start"
            desc="Everything you need in a single import."
          />
          <div className="mt-6">
            <CodeBlock code={quickStart} language="typescript" filename="example.ts" />
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionHeading({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md mt-0.5">
        {tag}
      </span>
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-foreground-500 mt-1">{desc}</p>
      </div>
    </div>
  )
}
