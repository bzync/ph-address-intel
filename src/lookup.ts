import {
    regions,
    provinces,
    municipalities,
    barangays,
    provincesByRegionCode,
    municipalitiesByProvinceCode,
    barangaysByMunicipalityCode,
} from './data/index'
import type { Region, Province, Municipality, Barangay, SearchResult } from './types'

export function getRegions(): Region[] {
    return regions
}

export function getProvinces(regionCode: string): Province[] {
    return provincesByRegionCode.get(regionCode) ?? []
}

export function getMunicipalities(provinceCode: string): Municipality[] {
    return municipalitiesByProvinceCode.get(provinceCode) ?? []
}

export function getBarangays(municipalityCode: string): Barangay[] {
    return barangaysByMunicipalityCode.get(municipalityCode) ?? []
}

export function search(query: string): SearchResult[] {
    const q = query.toLowerCase().trim()
    if (!q) return []

    const results: SearchResult[] = []

    for (const r of regions) {
        if (r.name.toLowerCase().includes(q)) {
            results.push({ type: 'region', code: r.code, name: r.name })
        }
    }

    for (const p of provinces) {
        if (p.name.toLowerCase().includes(q)) {
            results.push({ type: 'province', code: p.code, name: p.name, regionCode: p.regionCode })
        }
    }

    for (const m of municipalities) {
        if (m.name.toLowerCase().includes(q)) {
            results.push({
                type: 'municipality',
                code: m.code,
                name: m.name,
                regionCode: m.regionCode,
                provinceCode: m.provinceCode,
            })
        }
    }

    for (const b of barangays) {
        if (b.name.toLowerCase().includes(q)) {
            results.push({
                type: 'barangay',
                code: b.code,
                name: b.name,
                municipalityCode: b.municipalityCode,
            })
        }
    }

    return results
}
