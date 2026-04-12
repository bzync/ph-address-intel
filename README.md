# PH Address Intel

> Framework-agnostic TypeScript library for Philippine address lookup, ZIP autofill, and hierarchical region → province → municipality → barangay selection.

[![npm version](https://img.shields.io/npm/v/@bzync/ph-address-intel)](https://www.npmjs.com/package/@bzync/ph-address-intel)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Features

- **ZIP Autofill** — Resolve a 4-digit ZIP code into region, province, municipality, and barangays.
- **Cascading Selection** — Full PSGC hierarchy: `getRegions → getProvinces → getMunicipalities → getBarangays`
- **Full Path Resolution** — Resolve any PSGC code upward through the hierarchy with `getFullPath`.
- **Free-Text Search** — Search across all address levels with optional fuzzy matching and parent scoping.
- **Alias Resolution** — Resolve region nicknames and abbreviations (e.g. `"NCR"`, `"CALABARZON"`) to PSGC codes.
- **Validation** — Verify that address codes exist and form a consistent hierarchy.
- **Zero Runtime Dependencies** — No API calls. Works offline and at the edge.
- **TypeScript First** — Fully typed API with `.d.ts` support (CJS + ESM).
- **Official PSGC Data** — Based on PSA PSGC Q4 2025. Covers 17 regions, 80 provinces, 42,000+ barangays.

---

## Installation

```bash
npm install @bzync/ph-address-intel
```

```bash
yarn add @bzync/ph-address-intel
pnpm add @bzync/ph-address-intel
bun add @bzync/ph-address-intel
```

---

## Quick Start

```ts
import {
  lookupByZip,
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
  getFullPath,
  search,
  resolveAlias,
  validate,
} from '@bzync/ph-address-intel'

// ZIP autofill
const result = lookupByZip('4322')

// Hierarchical selection
const regions = getRegions()
const provinces = getProvinces('040000000')
const municipalities = getMunicipalities('045600000')
const barangays = getBarangays('045645000')

// Full path from any PSGC code
const path = getFullPath('045645001') // barangay → full chain

// Scoped search (municipalities within CALABARZON only)
const hits = search('San Jose', { types: ['municipality'], parentCode: '040000000' })

// Alias resolution
const ncr = resolveAlias('NCR')

// Validation
const check = validate({ regionCode: '040000000', provinceCode: '045600000' })
```

---

## API Reference

### `lookupByZip(zip: string): ZipLookupResult | null`

Resolves a 4-digit ZIP code to the full address hierarchy.

```ts
const result = lookupByZip('4322')

if (result) {
  console.log(result.region.name)       // "Region IV-A (CALABARZON)"
  console.log(result.province?.name)    // "Quezon"
  console.log(result.municipality.name) // "Sariaya"
  console.log(result.barangays.length)  // number of barangays
}
```

---

### Hierarchical getters

```ts
getRegions(): Region[]
getProvinces(regionCode: string): Province[]
getMunicipalities(provinceCode: string): Municipality[]
getBarangays(municipalityCode: string): Barangay[]
```

Returns all items at each level. Pass the parent PSGC code to get children.

---

### Single-item lookups

```ts
getRegion(code: string): Region | undefined
getProvince(code: string): Province | undefined
getMunicipality(code: string): Municipality | undefined
getBarangay(code: string): Barangay | undefined
```

O(1) lookups by PSGC code.

---

### `getFullPath(code: string): FullPath | null`

Resolves any PSGC code upward through the hierarchy and returns the complete address chain.

```ts
// From a barangay code
const path = getFullPath('045645001')
// → { region, province, municipality, barangay }

// From a municipality code
const path = getFullPath('045645000')
// → { region, province, municipality, barangay: null }

// NCR municipality (no province)
const path = getFullPath('133900000')
// → { region, province: null, municipality, barangay: null }

// Unknown code
getFullPath('999999999') // → null
```

Accepts codes at any level — region, province, municipality, or barangay. Levels below the given code are `null`.

---

### `search(query: string, options?: SearchOptions): SearchResult[]`

Searches across all address levels. Supports substring matching (default) and fuzzy matching, with optional scoping to a parent region, province, or municipality.

```ts
// Substring search
search('Manila')

// Fuzzy search with options
search('Mandaluyong', { fuzzy: true, limit: 5, types: ['municipality'] })

// Scoped to a region (useful for cascading dropdowns)
search('San Jose', { types: ['municipality'], parentCode: '040000000' })

// Scoped to a municipality
search('Antipolo', { types: ['barangay'], parentCode: '045645000' })
```

**`SearchOptions`**

| Option       | Type                                                             | Default | Description                                          |
|--------------|------------------------------------------------------------------|---------|------------------------------------------------------|
| `fuzzy`      | `boolean`                                                        | `false` | Enable Dice's bigram fuzzy matching                  |
| `limit`      | `number`                                                         | —       | Max results to return                                |
| `types`      | `Array<'region' \| 'province' \| 'municipality' \| 'barangay'>` | all     | Restrict search to specific levels                   |
| `parentCode` | `string`                                                         | —       | Scope results to children of a region, province, or municipality |

Results are sorted by score (descending) when `fuzzy: true`. When `parentCode` is set, regions are excluded from results (the parent context is already known).

---

### `resolveAlias(alias: string): SearchResult | null`

Resolves a common region nickname, abbreviation, or number to a `SearchResult`. Returns `null` if not recognized.

```ts
resolveAlias('NCR')         // → { type: 'region', code: '130000000', name: '...' }
resolveAlias('Region IV-A') // → { type: 'region', code: '040000000', name: '...' }
resolveAlias('BARMM')       // → { type: 'region', code: '150000000', name: '...' }
resolveAlias('unknown')     // → null
```

Recognized aliases include region numbers (`Region 1`–`13`), Roman numerals (`Region I`–`XIII`), official names, and common shorthands (`NCR`, `CAR`, `CALABARZON`, `MIMAROPA`, `CARAGA`, etc.).

---

### `validate(input: ValidationInput): ValidationResult`

Validates that the provided PSGC codes exist and form a consistent hierarchy. Only fields that are provided are validated — partial inputs are fine.

```ts
validate({ regionCode: '040000000', provinceCode: '045600000' })
// → { valid: true, errors: [] }

validate({ regionCode: '040000000', provinceCode: '010100000' })
// → { valid: false, errors: ['Province "Ilocos Norte" does not belong to region "040000000"'] }
```

---

## TypeScript Types

```ts
interface Region {
  code: string
  name: string
}

interface Province {
  code: string
  name: string
  regionCode: string
}

interface Municipality {
  code: string
  name: string
  regionCode: string
  provinceCode: string | null
  isCity: boolean
  zipCodes: string[]
}

interface Barangay {
  code: string
  name: string
  municipalityCode: string
}

interface ZipLookupResult {
  zip: string
  region: Region
  province: Province | null
  municipality: Municipality
  barangays: Barangay[]
}

interface SearchResult {
  type: 'region' | 'province' | 'municipality' | 'barangay'
  code: string
  name: string
  score?: number
  regionCode?: string
  provinceCode?: string | null
  municipalityCode?: string
}

interface FullPath {
  region: Region
  province: Province | null
  municipality: Municipality | null
  barangay: Barangay | null
}

interface SearchOptions {
  fuzzy?: boolean
  limit?: number
  types?: Array<'region' | 'province' | 'municipality' | 'barangay'>
  parentCode?: string
}

interface ValidationInput {
  regionCode?: string
  provinceCode?: string
  municipalityCode?: string
  barangayCode?: string
}

interface ValidationResult {
  valid: boolean
  errors: string[]
}
```

---

## PSGC Code Structure

```
RRPPMMMBBB
```

| Part | Meaning      |
|------|--------------|
| RR   | Region       |
| PP   | Province     |
| MMM  | Municipality |
| BBB  | Barangay     |

Example:

```
040000000  → Region IV-A (CALABARZON)
045600000  → Quezon
045645000  → Sariaya
045645001  → Barangay Antipolo
```

---

## Notes

- NCR has **no provinces** — `province` is `null` in ZIP lookup results.
- ZIP dataset contains ~958 mappings; some barangays share ZIP codes.
- BARMM barangay data may be incomplete (PSGC limitation).

---

## Security

### Threat model

This is a **pure offline library** — it makes no network calls, stores no state, and processes only string inputs. The bundled data is read-only and derived from official Philippine government sources (PSA PSGC, PHLPost).

Primary risks are input-driven: adversarial strings passed to `search()` or validation functions from untrusted callers.

### Input safety

All public API functions apply runtime type guards and reject non-string inputs gracefully (return `null`, `undefined`, or `[]`). Key limits enforced by the library:

| Protection | Detail |
|---|---|
| Query length cap | `search()` silently truncates inputs to 200 characters |
| Result limit cap | `search({ limit })` is clamped to a maximum of 1,000 results |
| ZIP format validation | `lookupByZip()` rejects any input that is not exactly 4 decimal digits |
| Error message sanitization | `validate()` truncates codes in error messages to 20 characters |
| Prototype pollution guard | Alias and ZIP lookups use `Object.hasOwn()` |

### Data provenance

- **PSGC data** — from the Philippine Statistics Authority (PSA), Q4 2025 publication
- **ZIP codes** — from PHLPost (`https://phlpost.gov.ph/zip-code-locator/`), fetched over HTTPS with a 30-second timeout and a 5 MB response size cap

### Release integrity

Releases are published with [npm provenance attestations](https://docs.npmjs.com/generating-provenance-statements). Verify a release with:

```bash
npm audit signatures
```

### Reporting vulnerabilities

Please use [GitHub Security Advisories](https://github.com/bzync/ph-address-intel/security/advisories/new) — do not open public issues for security reports. See [SECURITY.md](SECURITY.md) for full policy and SLA.

---

## License

MIT License © 2026

---

## Support

Star the repo if this helped you: https://github.com/bzync/ph-address-intel
