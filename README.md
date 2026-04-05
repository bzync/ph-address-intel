# 🇵🇭 PH Address Library

> Framework-agnostic TypeScript library for Philippine address lookup, ZIP autofill, and hierarchical region → province → municipality → barangay selection.

[![npm version](https://img.shields.io/npm/v/ph-reg-bgry-mun-city-prov-zip)](https://www.npmjs.com/package/ph-reg-bgry-mun-city-prov-zip)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- ⚡ **ZIP Autofill**  
  Resolve a 4-digit ZIP code into region, province, municipality, and barangays.

- 🗂️ **Cascading Selection**  
  Full PSGC hierarchy:
  `getRegions → getProvinces → getMunicipalities → getBarangays`

- 🔍 **Free-Text Search**  
  Search across all address levels with a single function.

- 📦 **Zero Runtime Dependencies**  
  No API calls. Works offline and at the edge.

- 🏷️ **TypeScript First**  
  Fully typed API with `.d.ts` support (CJS + ESM).

- 🗺️ **Official PSGC Data**  
  Based on PSA PSGC 4Q 2025  
  Covers:
  - 17 Regions  
  - 80 Provinces  
  - 42,000+ Barangays  

---

## 📦 Installation

```bash
npm install ph-reg-bgry-mun-city-prov-zip
```

### Other package managers

```bash
yarn add ph-reg-bgry-mun-city-prov-zip
pnpm add ph-reg-bgry-mun-city-prov-zip
bun add ph-reg-bgry-mun-city-prov-zip
```

---

## 🚀 Quick Start

```ts
import {
  lookupByZip,
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
  search,
} from 'ph-reg-bgry-mun-city-prov-zip'

// ZIP autofill
const result = lookupByZip('4322')

// Hierarchical selection
const regions = getRegions()
const provinces = getProvinces('040000000')
const municipalities = getMunicipalities('045600000')
const barangays = getBarangays('045645000')

// Free-text search
const hits = search('Sariaya')
```

---

## 🔢 ZIP Autofill Example

```ts
const result = lookupByZip('4322')

if (result) {
  console.log(result.region.name)
  console.log(result.province?.name)
  console.log(result.municipality.name)
  console.log(result.barangays.length)
}
```

---

## 🧭 API Reference

### `lookupByZip(zip: string)`
Resolve ZIP → full address hierarchy

### `getRegions()`
Returns all 17 Philippine regions

### `getProvinces(regionCode: string)`
Returns provinces within a region

### `getMunicipalities(provinceCode: string)`
Returns municipalities/cities in a province

### `getBarangays(municipalityCode: string)`
Returns barangays within a municipality

### `search(query: string)`
Search across all address levels

---

## 🧠 TypeScript Types

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
```

---

## 🧩 PSGC Code Structure

```
RRPPMMMBBB
```

| Part | Meaning |
|------|--------|
| RR   | Region |
| PP   | Province |
| MMM  | Municipality |
| BBB  | Barangay |

Example:

```
040000000  → Region IV-A
045600000  → Quezon
045645000  → Sariaya
045645001  → Barangay Antipolo
```

---

## ⚠️ Notes

- NCR has **no provinces** → `province = null`
- ZIP dataset contains **~958 mappings**
- Some barangays share ZIP codes
- BARMM barangay data may be incomplete (PSGC limitation)

---

## 🌐 Use Cases

- Address forms (checkout, signup)
- Government systems
- Delivery/logistics apps
- CRM systems
- Mobile apps (offline support)

---

## 📊 Why This Library?

Unlike other PH address libraries:
- ✅ No API required
- ✅ Fully offline
- ✅ Complete PSGC hierarchy
- ✅ ZIP → barangay resolution
- ✅ Type-safe out of the box

---

## 🛠️ Roadmap

- [ ] React/Vue autocomplete components
- [ ] CLI tools
- [ ] Dataset updates automation
- [ ] Validation helpers

---

## 📄 License

MIT License © 2026

---

## ⭐ Support

If this helped you, consider starring the repo ⭐  
https://github.com/rzarviandoe/ph-reg-bgry-mun-city-prov-zip
