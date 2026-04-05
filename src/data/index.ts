import psgcRaw from './psgc.json'
import zipToPsgcRaw from './zip-to-psgc.json'
import type { Region, Province, Municipality, Barangay } from '../types'

type RawMunicipality = {
    code: string
    name: string
    regionCode: string
    provinceCode: string | null
    isCity: boolean
    zipCodes: string[]
}

const zipToPsgc = zipToPsgcRaw as Record<string, string[]>

// Build set of valid province codes so we can normalize municipality province codes.
// The data generation script sometimes derives incorrect 5-digit province codes;
// the correct derivation uses the first 4 digits of the municipality code.
const provinceCodeSet = new Set<string>(
    (psgcRaw.provinces as Array<{ code: string }>).map((p) => p.code)
)

// Normalize each municipality's provinceCode and prepare for zipCode population
const municipalityMap = new Map<string, Municipality>()

for (const raw of psgcRaw.municipalities as RawMunicipality[]) {
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

export const regions: Region[] = psgcRaw.regions as Region[]
export const provinces: Province[] = psgcRaw.provinces as Province[]
export const municipalities: Municipality[] = Array.from(municipalityMap.values())
export const barangays: Barangay[] = psgcRaw.barangays as Barangay[]

// O(1) lookup indices
export const regionByCode = new Map<string, Region>(regions.map((r) => [r.code, r]))
export const provinceByCode = new Map<string, Province>(provinces.map((p) => [p.code, p]))
export const municipalityByCode = new Map<string, Municipality>(municipalities.map((m) => [m.code, m]))

// Grouped indices
export const provincesByRegionCode = new Map<string, Province[]>()
for (const p of provinces) {
    const arr = provincesByRegionCode.get(p.regionCode) ?? []
    arr.push(p)
    provincesByRegionCode.set(p.regionCode, arr)
}

export const municipalitiesByProvinceCode = new Map<string, Municipality[]>()
export const municipalitiesByRegionCode = new Map<string, Municipality[]>()
for (const m of municipalities) {
    if (m.provinceCode !== null) {
        const arr = municipalitiesByProvinceCode.get(m.provinceCode) ?? []
        arr.push(m)
        municipalitiesByProvinceCode.set(m.provinceCode, arr)
    }
    const arr2 = municipalitiesByRegionCode.get(m.regionCode) ?? []
    arr2.push(m)
    municipalitiesByRegionCode.set(m.regionCode, arr2)
}

export const barangaysByMunicipalityCode = new Map<string, Barangay[]>()
for (const b of barangays) {
    const arr = barangaysByMunicipalityCode.get(b.municipalityCode) ?? []
    arr.push(b)
    barangaysByMunicipalityCode.set(b.municipalityCode, arr)
}
