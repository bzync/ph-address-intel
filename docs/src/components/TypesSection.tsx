import { Card, CardBody, CardHeader, Chip } from '@heroui/react'
import CodeBlock from './CodeBlock'

const typeDefs = `interface Region {
  code: string        // 9-digit PSGC code, e.g. "040000000"
  name: string        // e.g. "Region IV-A (CALABARZON)"
}

interface Province {
  code: string        // e.g. "045600000"
  name: string        // e.g. "Quezon"
  regionCode: string  // parent region code
}

interface Municipality {
  code: string              // e.g. "045645000"
  name: string              // e.g. "Sariaya"
  regionCode: string        // parent region code
  provinceCode: string | null  // null for NCR cities
  isCity: boolean           // true for cities
  zipCodes: string[]        // associated ZIP codes
}

interface Barangay {
  code: string              // 9-digit PSGC code, e.g. "045645001"
  name: string              // e.g. "Antipolo"
  municipalityCode: string  // parent municipality code
}

interface ZipLookupResult {
  zip: string
  region: Region
  province: Province | null  // null for NCR
  municipality: Municipality
  barangays: Barangay[]
}

interface SearchResult {
  type: 'region' | 'province' | 'municipality' | 'barangay'
  code: string
  name: string
  regionCode?: string
  provinceCode?: string | null
  municipalityCode?: string
}`

const psgcNote = `// PSGC Code Structure (9 digits)
// RRPPMMMBBB
// RR  — Region (2 digits)
// PP  — Province within region (2 digits)
// MMM — Municipality within province (2 digits + 0)
// BBB — Barangay within municipality (3 digits, "000" for municipality level)

'040000000'  // Region IV-A (CALABARZON)
'045600000'  // Quezon Province (RR=04, PP=56)
'045645000'  // Sariaya Municipality (MMM=45)
'045645001'  // Barangay Antipolo in Sariaya`

export default function TypesSection() {
  return (
    <section id="types" className="py-24 px-4 bg-background">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <h2 className="text-3xl font-bold text-foreground">TypeScript Types</h2>
          <p className="mt-3 text-foreground-500 text-lg">
            All types are exported and can be used directly in your application.
          </p>
        </div>

        <CodeBlock
          code={typeDefs}
          language="typescript"
          filename="ph-reg-bgry-mun-city-prov-zip/types.ts"
        />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">PSGC Code Structure</h3>
          <p className="text-sm text-foreground-500 mb-4 leading-relaxed">
            All codes are 9-digit strings with leading zeros preserved. The structure encodes
            the full administrative hierarchy so you can always derive the parent from a child code.
          </p>
          <CodeBlock code={psgcNote} language="typescript" />
        </div>

        <Card shadow="none" className="border border-warning/30 bg-warning/5">
          <CardHeader className="px-6 pt-5 pb-0 gap-2">
            <Chip size="sm" color="warning" variant="flat">Note</Chip>
            <h3 className="font-semibold text-warning text-sm">Data Coverage</h3>
          </CardHeader>
          <CardBody className="px-6 pb-5 pt-3">
            <ul className="text-foreground-500 text-sm space-y-2 list-disc list-inside">
              <li>
                <strong className="text-foreground">NCR</strong> — Cities sit directly under the
                region.{' '}
                <code className="font-mono text-xs bg-content2 px-1 rounded">province</code> is{' '}
                <code className="font-mono text-xs bg-content2 px-1 rounded">null</code> for all NCR
                lookups.
              </li>
              <li>
                <strong className="text-foreground">ZIP codes</strong> — 958 ZIP entries mapped to
                PSGC codes via PhilPost data. Some rural barangays may share a ZIP or have no ZIP
                assigned.
              </li>
              <li>
                <strong className="text-foreground">BARMM</strong> — Barangay data for the Bangsamoro
                Autonomous Region may be incomplete in the current PSGC 4Q-2025 publication.
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </section>
  )
}
