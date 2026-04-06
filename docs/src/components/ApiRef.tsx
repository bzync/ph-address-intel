import {
  Accordion,
  AccordionItem,
  AccordionHeading,
  AccordionTrigger,
  AccordionPanel,
  AccordionBody,
  AccordionIndicator,
  Chip,
} from '@heroui/react'
import CodeBlock from './CodeBlock'

interface FnDef {
  name: string
  signature: string
  desc: string
  params?: { name: string; type: string; desc: string }[]
  returns: string
  example: string
  note?: string
}

const fns: FnDef[] = [
  {
    name: 'lookupByZip',
    signature: 'lookupByZip(zip: string): ZipLookupResult | null',
    desc: 'Resolve a 4-digit Philippine ZIP code to its full address hierarchy.',
    params: [{ name: 'zip', type: 'string', desc: '4-digit ZIP code, e.g. "4322"' }],
    returns: 'ZipLookupResult or null if the ZIP code is not found.',
    example: `const result = lookupByZip('4322')
if (result) {
  console.log(result.region.name)       // 'Region IV-A (CALABARZON)'
  console.log(result.province?.name)    // 'Quezon'  (null for NCR)
  console.log(result.municipality.name) // 'Sariaya'
  console.log(result.barangays.length)  // 43
}`,
    note: 'province is null for NCR municipalities (no province in the hierarchy).',
  },
  {
    name: 'getRegions',
    signature: 'getRegions(): Region[]',
    desc: 'Return all 17 Philippine administrative regions.',
    returns: 'Sorted array of Region objects.',
    example: `const regions = getRegions()
// [
//   { code: '010000000', name: 'Region I (Ilocos Region)' },
//   { code: '130000000', name: 'National Capital Region (NCR)' },
//   ... 17 total
// ]`,
  },
  {
    name: 'getProvinces',
    signature: 'getProvinces(regionCode: string): Province[]',
    desc: 'Return all provinces within a given region.',
    params: [{ name: 'regionCode', type: 'string', desc: '9-digit PSGC region code, e.g. "040000000"' }],
    returns: 'Array of Province objects. Empty array if the region has no provinces (NCR).',
    example: `const provinces = getProvinces('040000000')
// CALABARZON → Batangas, Cavite, Laguna, Quezon, Rizal

const ncrProvinces = getProvinces('130000000')
// [] — NCR has no provinces`,
  },
  {
    name: 'getMunicipalities',
    signature: 'getMunicipalities(provinceCode: string): Municipality[]',
    desc: 'Return all municipalities and cities within a province.',
    params: [{ name: 'provinceCode', type: 'string', desc: '9-digit PSGC province code, e.g. "045600000"' }],
    returns: 'Array of Municipality objects. Each has an isCity flag and zipCodes array.',
    example: `const muns = getMunicipalities('045600000') // Quezon province
const cities = muns.filter(m => m.isCity)
const withZip = muns.filter(m => m.zipCodes.length > 0)`,
  },
  {
    name: 'getBarangays',
    signature: 'getBarangays(municipalityCode: string): Barangay[]',
    desc: 'Return all barangays within a municipality or city.',
    params: [{ name: 'municipalityCode', type: 'string', desc: '9-digit PSGC municipality code, e.g. "045645000"' }],
    returns: 'Array of Barangay objects. Empty array if no barangay data is available.',
    example: `const barangays = getBarangays('045645000') // Sariaya
// [
//   { code: '045645001', name: 'Antipolo', municipalityCode: '045645000' },
//   ... 43 total
// ]`,
  },
  {
    name: 'search',
    signature: 'search(query: string): SearchResult[]',
    desc: 'Case-insensitive substring search across all address levels.',
    params: [{ name: 'query', type: 'string', desc: 'Search term. Returns [] for empty string.' }],
    returns: 'Array of SearchResult objects, grouped by type (region → province → municipality → barangay).',
    example: `const hits = search('San Jose')
// [
//   { type: 'municipality', code: '...', name: 'San Jose', ... },
//   { type: 'barangay',     code: '...', name: 'San Jose', municipalityCode: '...' },
//   ...
// ]`,
  },
]

export default function ApiRef() {
  return (
    <section id="api" className="py-24 px-4 bg-content1">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground">API Reference</h2>
          <p className="mt-3 text-foreground-500 text-lg">
            All functions are synchronous and return typed values — no promises, no network calls.
          </p>
        </div>

        <Accordion variant="surface" allowsMultipleExpanded className="gap-3">
          {fns.map((fn) => (
            <AccordionItem key={fn.name} className="border border-divider rounded-xl overflow-hidden">
              <AccordionHeading>
                <AccordionTrigger className="flex items-center gap-3 w-full px-5 py-4 text-left">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="font-mono text-sm text-foreground flex-1">{fn.signature}</span>
                  <AccordionIndicator />
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel>
                <AccordionBody className="px-5 pb-5">
                  <div className="space-y-4">
                    <p className="text-foreground-500 text-sm">{fn.desc}</p>

                    {fn.params && fn.params.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-foreground-400 uppercase tracking-wider mb-2">
                          Parameters
                        </p>
                        <div className="space-y-2">
                          {fn.params.map((p) => (
                            <div key={p.name} className="flex gap-3 text-sm">
                              <code className="font-mono text-primary shrink-0">{p.name}</code>
                              <code className="text-foreground-400 font-mono shrink-0">{p.type}</code>
                              <span className="text-foreground-500">{p.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-foreground-400 uppercase tracking-wider mb-2">
                        Returns
                      </p>
                      <p className="text-sm text-foreground-500">{fn.returns}</p>
                    </div>

                    {fn.note && (
                      <div className="bg-warning/10 border border-warning/20 rounded-lg px-4 py-3 text-sm text-warning flex gap-2 items-start">
                        <Chip size="sm" color="warning" variant="soft">Note</Chip>
                        <span>{fn.note}</span>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-foreground-400 uppercase tracking-wider mb-2">
                        Example
                      </p>
                      <CodeBlock code={fn.example} language="typescript" />
                    </div>
                  </div>
                </AccordionBody>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
