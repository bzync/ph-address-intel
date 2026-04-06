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
    municipalitiesByRegionCode,
    barangaysByMunicipalityCode,
} from './data/index'
import type { Region, Province, Municipality, Barangay, SearchResult, SearchOptions, FullPath } from './types'

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

// ─── Full path resolution ────────────────────────────────────────────────────

function resolveProvince(m: Municipality): Province | null {
    return m.provinceCode !== null ? (provinceByCode.get(m.provinceCode) ?? null) : null
}

export function getFullPath(code: string): FullPath | null {
    const barangay = barangayByCode.get(code)
    if (barangay) {
        const municipality = municipalityByCode.get(barangay.municipalityCode)
        if (!municipality) return null
        const region = regionByCode.get(municipality.regionCode)
        if (!region) return null
        return { region, province: resolveProvince(municipality), municipality, barangay }
    }

    const municipality = municipalityByCode.get(code)
    if (municipality) {
        const region = regionByCode.get(municipality.regionCode)
        if (!region) return null
        return { region, province: resolveProvince(municipality), municipality, barangay: null }
    }

    const province = provinceByCode.get(code)
    if (province) {
        const region = regionByCode.get(province.regionCode)
        if (!region) return null
        return { region, province, municipality: null, barangay: null }
    }

    const region = regionByCode.get(code)
    if (region) {
        return { region, province: null, municipality: null, barangay: null }
    }

    return null
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

    const { fuzzy = false, limit, types, parentCode } = options ?? {}
    const includeAll = !types || types.length === 0

    // Resolve parentCode to a scoping level once
    let parentRegionCode: string | undefined
    let parentProvinceCode: string | undefined
    let parentMunicipalityCode: string | undefined

    if (parentCode !== undefined) {
        if (regionByCode.has(parentCode)) parentRegionCode = parentCode
        else if (provinceByCode.has(parentCode)) parentProvinceCode = parentCode
        else if (municipalityByCode.has(parentCode)) parentMunicipalityCode = parentCode
    }

    // Build scoped candidate lists
    const scopedProvinces: Province[] = parentRegionCode !== undefined
        ? (provincesByRegionCode.get(parentRegionCode) ?? [])
        : provinces

    const scopedMunicipalities: Municipality[] = parentMunicipalityCode !== undefined
        ? []
        : parentProvinceCode !== undefined
            ? (municipalitiesByProvinceCode.get(parentProvinceCode) ?? [])
            : parentRegionCode !== undefined
                ? (municipalitiesByRegionCode.get(parentRegionCode) ?? [])
                : municipalities

    const scopedBarangays: Barangay[] = parentMunicipalityCode !== undefined
        ? (barangaysByMunicipalityCode.get(parentMunicipalityCode) ?? [])
        : parentCode !== undefined
            ? scopedMunicipalities.flatMap((m) => barangaysByMunicipalityCode.get(m.code) ?? [])
            : barangays

    // Regions are never scoped by a child parentCode
    const scopedRegions: Region[] = parentCode === undefined ? regions : []

    const results: SearchResult[] = []
    const threshold = fuzzy ? FUZZY_THRESHOLD : 1

    const score = (name: string): number => {
        const n = name.toLowerCase()
        return fuzzy ? bigramScore(q, n) : n.includes(q) ? 1 : 0
    }

    if (includeAll || types!.includes('region')) {
        for (const r of scopedRegions) {
            const s = score(r.name)
            if (s >= threshold) results.push({ type: 'region', code: r.code, name: r.name, ...(fuzzy ? { score: s } : {}) })
        }
    }
    if (includeAll || types!.includes('province')) {
        for (const p of scopedProvinces) {
            const s = score(p.name)
            if (s >= threshold) results.push({ type: 'province', code: p.code, name: p.name, regionCode: p.regionCode, ...(fuzzy ? { score: s } : {}) })
        }
    }
    if (includeAll || types!.includes('municipality')) {
        for (const m of scopedMunicipalities) {
            const s = score(m.name)
            if (s >= threshold) results.push({ type: 'municipality', code: m.code, name: m.name, regionCode: m.regionCode, provinceCode: m.provinceCode, ...(fuzzy ? { score: s } : {}) })
        }
    }
    if (includeAll || types!.includes('barangay')) {
        for (const b of scopedBarangays) {
            const s = score(b.name)
            if (s >= threshold) results.push({ type: 'barangay', code: b.code, name: b.name, municipalityCode: b.municipalityCode, ...(fuzzy ? { score: s } : {}) })
        }
    }

    if (fuzzy) results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

    return limit !== undefined ? results.slice(0, limit) : results
}
