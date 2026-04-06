import psgcRaw from './psgc.json'
import zipToPsgcRaw from './zip-to-psgc.json'
import type { Region, Province, Municipality, Barangay } from '../types'

function groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
    const map = new Map<string, T[]>()
    for (const item of items) {
        const key = getKey(item)
        const existing = map.get(key)
        if (existing) existing.push(item)
        else map.set(key, [item])
    }
    return map
}

// psgc.json is too large for TypeScript to infer its shape — declare it once here.
type RawMunicipality = {
    code: string
    name: string
    regionCode: string
    provinceCode: string | null
    isCity: boolean
    zipCodes: string[]
}

interface PSGCRaw {
    regions: Array<{ code: string; name: string }>
    provinces: Array<{ code: string; name: string; regionCode: string }>
    municipalities: RawMunicipality[]
    barangays: Array<{ code: string; name: string; municipalityCode: string }>
}

const psgc = psgcRaw as unknown as PSGCRaw
const zipToPsgc = zipToPsgcRaw as unknown as Record<string, string[]>

// Build set of valid province codes so we can normalize municipality province codes.
// The data generation script sometimes derives incorrect 5-digit province codes;
// the correct derivation uses the first 4 digits of the municipality code.
const provinceCodeSet = new Set<string>(psgc.provinces.map((p) => p.code))

// Normalize each municipality's provinceCode and prepare for zipCode population
const municipalityMap = new Map<string, Municipality>()

for (const raw of psgc.municipalities) {
    // Province code = first 4 PSGC digits + 5 zeros (e.g. "045600000" for Quezon)
    const derivedProvinceCode = raw.code.slice(0, 4) + '00000'
    const provinceCode = provinceCodeSet.has(derivedProvinceCode) ? derivedProvinceCode : null

    const mun: Municipality = {
        code: raw.code,
        name: raw.name,
        regionCode: raw.regionCode,
        provinceCode,
        isCity: raw.isCity,
        zipCodes: []
    }
    municipalityMap.set(mun.code, mun)
}

// Populate zipCodes on each municipality from the pre-built zip-to-psgc mapping
for (const [zip, codes] of Object.entries(zipToPsgc)) {
    for (const code of codes) {
        const mun = municipalityMap.get(code)
        if (mun) mun.zipCodes.push(zip)
    }
}

// Primary ZIP → municipality code (first match wins; most ZIPs map to one municipality)
export const zipToMunCode: Record<string, string> = {}
for (const [zip, codes] of Object.entries(zipToPsgc)) {
    const primary = codes[0]
    if (primary !== undefined) zipToMunCode[zip] = primary
}

export const regions: Region[] = psgc.regions as Region[]
export const provinces: Province[] = psgc.provinces as Province[]
export const municipalities: Municipality[] = Array.from(municipalityMap.values())
export const barangays: Barangay[] = psgc.barangays as Barangay[]

// O(1) lookup indices
export const regionByCode = new Map<string, Region>(regions.map((r) => [r.code, r]))
export const provinceByCode = new Map<string, Province>(provinces.map((p) => [p.code, p]))
export const municipalityByCode = new Map<string, Municipality>(municipalities.map((m) => [m.code, m]))

// Grouped indices
export const provincesByRegionCode = groupBy(provinces, (p) => p.regionCode)
export const municipalitiesByRegionCode = groupBy(municipalities, (m) => m.regionCode)
export const municipalitiesByProvinceCode = groupBy(
    municipalities.filter((m): m is Municipality & { provinceCode: string } => m.provinceCode !== null),
    (m) => m.provinceCode,
)
export const barangaysByMunicipalityCode = groupBy(barangays, (b) => b.municipalityCode)
export const barangayByCode = new Map<string, Barangay>(barangays.map((b) => [b.code, b]))
