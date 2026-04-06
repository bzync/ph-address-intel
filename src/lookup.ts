import {
    regions,
    provinces,
    municipalities,
    barangays,
    regionByCode,
    provinceByCode,
    municipalityByCode,
    barangayByCode,
    provincesByRegionCode,
    municipalitiesByProvinceCode,
    barangaysByMunicipalityCode,
} from './data/index'
import type { Region, Province, Municipality, Barangay, SearchResult, SearchOptions } from './types'

// ─── Hierarchical getters ────────────────────────────────────────────────────

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

// ─── O(1) code lookups ───────────────────────────────────────────────────────

export function getRegion(code: string): Region | undefined {
    return regionByCode.get(code)
}

export function getProvince(code: string): Province | undefined {
    return provinceByCode.get(code)
}

export function getMunicipality(code: string): Municipality | undefined {
    return municipalityByCode.get(code)
}

export function getBarangay(code: string): Barangay | undefined {
    return barangayByCode.get(code)
}

// ─── Fuzzy search helpers ────────────────────────────────────────────────────

/** Dice's bigram coefficient — tolerates typos and partial matches */
function bigramScore(a: string, b: string): number {
    if (a === b) return 1
    if (a.length < 2 || b.length < 2) return a.startsWith(b) || b.startsWith(a) ? 0.5 : 0

    const bigrams = new Map<string, number>()
    for (let i = 0; i < a.length - 1; i++) {
        const bg = a.slice(i, i + 2)
        bigrams.set(bg, (bigrams.get(bg) ?? 0) + 1)
    }

    let matches = 0
    for (let i = 0; i < b.length - 1; i++) {
        const bg = b.slice(i, i + 2)
        const count = bigrams.get(bg) ?? 0
        if (count > 0) {
            matches++
            bigrams.set(bg, count - 1)
        }
    }

    return (2.0 * matches) / (a.length - 1 + b.length - 1)
}

const FUZZY_THRESHOLD = 0.3

// ─── search() ────────────────────────────────────────────────────────────────

export function search(query: string, options?: SearchOptions): SearchResult[] {
    const q = query.toLowerCase().trim()
    if (!q) return []

    const { fuzzy = false, limit, types } = options ?? {}
    const includeAll = !types || types.length === 0

    const results: SearchResult[] = []

    if (fuzzy) {
        if (includeAll || types!.includes('region')) {
            for (const r of regions) {
                const score = bigramScore(q, r.name.toLowerCase())
                if (score >= FUZZY_THRESHOLD) {
                    results.push({ type: 'region', code: r.code, name: r.name, score })
                }
            }
        }
        if (includeAll || types!.includes('province')) {
            for (const p of provinces) {
                const score = bigramScore(q, p.name.toLowerCase())
                if (score >= FUZZY_THRESHOLD) {
                    results.push({ type: 'province', code: p.code, name: p.name, regionCode: p.regionCode, score })
                }
            }
        }
        if (includeAll || types!.includes('municipality')) {
            for (const m of municipalities) {
                const score = bigramScore(q, m.name.toLowerCase())
                if (score >= FUZZY_THRESHOLD) {
                    results.push({
                        type: 'municipality',
                        code: m.code,
                        name: m.name,
                        regionCode: m.regionCode,
                        provinceCode: m.provinceCode,
                        score,
                    })
                }
            }
        }
        if (includeAll || types!.includes('barangay')) {
            for (const b of barangays) {
                const score = bigramScore(q, b.name.toLowerCase())
                if (score >= FUZZY_THRESHOLD) {
                    results.push({
                        type: 'barangay',
                        code: b.code,
                        name: b.name,
                        municipalityCode: b.municipalityCode,
                        score,
                    })
                }
            }
        }

        results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    } else {
        if (includeAll || types!.includes('region')) {
            for (const r of regions) {
                if (r.name.toLowerCase().includes(q)) {
                    results.push({ type: 'region', code: r.code, name: r.name })
                }
            }
        }
        if (includeAll || types!.includes('province')) {
            for (const p of provinces) {
                if (p.name.toLowerCase().includes(q)) {
                    results.push({ type: 'province', code: p.code, name: p.name, regionCode: p.regionCode })
                }
            }
        }
        if (includeAll || types!.includes('municipality')) {
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
        }
        if (includeAll || types!.includes('barangay')) {
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
        }
    }

    return limit !== undefined ? results.slice(0, limit) : results
}
