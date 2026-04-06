import { describe, it, expect } from 'vitest'
import {
    getRegions,
    getProvinces,
    getMunicipalities,
    getBarangays,
    getRegion,
    getProvince,
    getMunicipality,
    getBarangay,
    getFullPath,
    search,
} from '../src/lookup'

describe('getRegions', () => {
    it('returns all 17 Philippine regions', () => {
        const regions = getRegions()
        expect(regions).toHaveLength(17)
    })

    it('includes NCR', () => {
        const regions = getRegions()
        const ncr = regions.find((r) => r.code === '130000000')
        expect(ncr).toBeDefined()
        expect(ncr!.name).toContain('National Capital Region')
    })

    it('includes CALABARZON (Region IV-A)', () => {
        const regions = getRegions()
        const calabarzon = regions.find((r) => r.code === '040000000')
        expect(calabarzon).toBeDefined()
        expect(calabarzon!.name).toContain('CALABARZON')
    })

    it('returns objects with code and name', () => {
        const regions = getRegions()
        for (const r of regions) {
            expect(r.code).toMatch(/^\d{9}$/)
            expect(r.name.length).toBeGreaterThan(0)
        }
    })
})

describe('getProvinces', () => {
    it('returns 5 provinces for CALABARZON', () => {
        const provinces = getProvinces('040000000')
        expect(provinces).toHaveLength(5)
    })

    it('includes Quezon province in CALABARZON', () => {
        const provinces = getProvinces('040000000')
        const quezon = provinces.find((p) => p.code === '045600000')
        expect(quezon).toBeDefined()
        expect(quezon!.name).toBe('Quezon')
        expect(quezon!.regionCode).toBe('040000000')
    })

    it('returns empty array for NCR (no provinces)', () => {
        const provinces = getProvinces('130000000')
        expect(provinces).toHaveLength(0)
    })

    it('returns empty array for unknown region code', () => {
        expect(getProvinces('999999999')).toHaveLength(0)
    })

    it('all returned provinces belong to the given region', () => {
        const regionCode = '040000000'
        const provinces = getProvinces(regionCode)
        for (const p of provinces) {
            expect(p.regionCode).toBe(regionCode)
        }
    })

    it('covers all 17 regions and total is 80 provinces', () => {
        const regions = getRegions()
        let total = 0
        for (const r of regions) {
            total += getProvinces(r.code).length
        }
        expect(total).toBe(80)
    })
})

describe('getMunicipalities', () => {
    it('returns municipalities for Quezon province', () => {
        const muns = getMunicipalities('045600000')
        expect(muns.length).toBeGreaterThan(0)
    })

    it('includes Sariaya in Quezon province', () => {
        const muns = getMunicipalities('045600000')
        const sariaya = muns.find((m) => m.code === '045645000')
        expect(sariaya).toBeDefined()
        expect(sariaya!.name).toBe('Sariaya')
        expect(sariaya!.provinceCode).toBe('045600000')
        expect(sariaya!.isCity).toBe(false)
    })

    it('returns empty array for unknown province code', () => {
        expect(getMunicipalities('999999999')).toHaveLength(0)
    })

    it('all returned municipalities belong to the given province', () => {
        const provinceCode = '041000000' // Batangas
        const muns = getMunicipalities(provinceCode)
        expect(muns.length).toBeGreaterThan(0)
        for (const m of muns) {
            expect(m.provinceCode).toBe(provinceCode)
        }
    })

    it('correctly identifies cities', () => {
        const muns = getMunicipalities('042100000') // Cavite
        const cities = muns.filter((m) => m.isCity)
        expect(cities.length).toBeGreaterThan(0)
    })
})

describe('getBarangays', () => {
    it('returns 43 barangays for Sariaya', () => {
        const bgys = getBarangays('045645000')
        expect(bgys).toHaveLength(43)
    })

    it('all barangays belong to the given municipality', () => {
        const munCode = '045645000'
        const bgys = getBarangays(munCode)
        for (const b of bgys) {
            expect(b.municipalityCode).toBe(munCode)
        }
    })

    it('returns empty array for unknown municipality', () => {
        expect(getBarangays('999999999')).toHaveLength(0)
    })

    it('barangay codes are 9-digit strings', () => {
        const bgys = getBarangays('045645000')
        for (const b of bgys) {
            expect(b.code).toMatch(/^\d{9}$/)
        }
    })
})

describe('search', () => {
    it('finds region by name fragment', () => {
        const results = search('CALABARZON')
        const region = results.find((r) => r.type === 'region')
        expect(region).toBeDefined()
        expect(region!.code).toBe('040000000')
    })

    it('finds province by name', () => {
        const results = search('Quezon')
        const prov = results.find((r) => r.type === 'province' && r.code === '045600000')
        expect(prov).toBeDefined()
    })

    it('finds municipality by name', () => {
        const results = search('Sariaya')
        const mun = results.find((r) => r.type === 'municipality')
        expect(mun).toBeDefined()
        expect(mun!.code).toBe('045645000')
    })

    it('finds barangay by name', () => {
        const results = search('Antipolo')
        const bgys = results.filter((r) => r.type === 'barangay')
        expect(bgys.length).toBeGreaterThan(0)
    })

    it('returns empty array for empty query', () => {
        expect(search('')).toHaveLength(0)
        expect(search('   ')).toHaveLength(0)
    })

    it('search is case-insensitive', () => {
        const upper = search('SARIAYA')
        const lower = search('sariaya')
        expect(upper.length).toBe(lower.length)
    })

    it('returns results across multiple types for broad query', () => {
        const results = search('San Jose')
        const types = new Set(results.map((r) => r.type))
        expect(types.size).toBeGreaterThan(1)
    })

    it('respects limit option', () => {
        const results = search('San', { limit: 3 })
        expect(results).toHaveLength(3)
    })

    it('respects types option — only municipalities', () => {
        const results = search('San Jose', { types: ['municipality'] })
        expect(results.length).toBeGreaterThan(0)
        for (const r of results) expect(r.type).toBe('municipality')
    })

    it('respects types option — only barangays', () => {
        const results = search('Poblacion', { types: ['barangay'] })
        expect(results.length).toBeGreaterThan(0)
        for (const r of results) expect(r.type).toBe('barangay')
    })

    describe('fuzzy mode', () => {
        it('finds results with a minor typo', () => {
            const results = search('Sariyaya', { fuzzy: true }) // intentional typo for Sariaya
            expect(results.some((r) => r.code === '045645000')).toBe(true)
        })

        it('results have a numeric score', () => {
            const results = search('Quezon', { fuzzy: true })
            expect(results.length).toBeGreaterThan(0)
            for (const r of results) {
                expect(typeof r.score).toBe('number')
                expect(r.score).toBeGreaterThan(0)
            }
        })

        it('results are sorted by score descending', () => {
            const results = search('Manila', { fuzzy: true })
            for (let i = 1; i < results.length; i++) {
                expect(results[i - 1]!.score ?? 0).toBeGreaterThanOrEqual(results[i]!.score ?? 0)
            }
        })

        it('exact match scores highest', () => {
            const results = search('Quezon', { fuzzy: true, types: ['province'] })
            expect(results.length).toBeGreaterThan(0)
            expect(results[0]!.name).toBe('Quezon')
            expect(results[0]!.score).toBe(1)
        })
    })

    describe('parentCode scoping', () => {
        it('scopes municipalities to a region', () => {
            const results = search('San Jose', {
                types: ['municipality'],
                parentCode: '040000000', // CALABARZON
            })
            expect(results.length).toBeGreaterThan(0)
            for (const r of results) expect(r.regionCode).toBe('040000000')
        })

        it('scopes municipalities to a province', () => {
            const results = search('San', {
                types: ['municipality'],
                parentCode: '045600000', // Quezon province
            })
            expect(results.length).toBeGreaterThan(0)
            for (const r of results) expect(r.provinceCode).toBe('045600000')
        })

        it('scopes barangays to a municipality', () => {
            // 'Antipolo' exists as a barangay in Sariaya and also elsewhere — scoping confirms only Sariaya's is returned
            const results = search('Antipolo', {
                types: ['barangay'],
                parentCode: '045645000', // Sariaya
            })
            expect(results.length).toBeGreaterThan(0)
            for (const r of results) expect(r.municipalityCode).toBe('045645000')
        })

        it('excludes regions when parentCode is set', () => {
            const results = search('a', { parentCode: '040000000' })
            const regionResults = results.filter((r) => r.type === 'region')
            expect(regionResults).toHaveLength(0)
        })

        it('returns nothing for municipality parentCode with municipality type', () => {
            // A municipality-scoped search cannot return other municipalities
            const results = search('San Jose', {
                types: ['municipality'],
                parentCode: '045645000', // Sariaya (municipality)
            })
            expect(results).toHaveLength(0)
        })

        it('falls back to full search for unrecognized parentCode', () => {
            const scoped = search('Quezon', { parentCode: '999999999' })
            const unscoped = search('Quezon')
            expect(scoped.length).toBe(unscoped.length)
        })

        it('works with fuzzy and parentCode together', () => {
            const results = search('Sariaia', {
                fuzzy: true,
                types: ['municipality'],
                parentCode: '045600000', // Quezon province
            })
            expect(results.some((r) => r.code === '045645000')).toBe(true)
        })
    })
})

describe('getRegion', () => {
    it('returns the correct region by code', () => {
        const region = getRegion('130000000')
        expect(region).toBeDefined()
        expect(region!.name).toContain('National Capital Region')
    })

    it('returns undefined for unknown code', () => {
        expect(getRegion('999999999')).toBeUndefined()
    })

    it('returns undefined for empty string', () => {
        expect(getRegion('')).toBeUndefined()
    })
})

describe('getProvince', () => {
    it('returns the correct province by code', () => {
        const province = getProvince('045600000')
        expect(province).toBeDefined()
        expect(province!.name).toBe('Quezon')
        expect(province!.regionCode).toBe('040000000')
    })

    it('returns undefined for unknown code', () => {
        expect(getProvince('999999999')).toBeUndefined()
    })
})

describe('getMunicipality', () => {
    it('returns the correct municipality by code', () => {
        const mun = getMunicipality('045645000')
        expect(mun).toBeDefined()
        expect(mun!.name).toBe('Sariaya')
        expect(mun!.provinceCode).toBe('045600000')
        expect(mun!.regionCode).toBe('040000000')
        expect(mun!.isCity).toBe(false)
    })

    it('returns undefined for unknown code', () => {
        expect(getMunicipality('999999999')).toBeUndefined()
    })
})

describe('getBarangay', () => {
    it('returns a barangay by code', () => {
        const bgys = getBarangays('045645000')
        const first = bgys[0]!
        const result = getBarangay(first.code)
        expect(result).toBeDefined()
        expect(result!.code).toBe(first.code)
        expect(result!.municipalityCode).toBe('045645000')
    })

    it('returns undefined for unknown code', () => {
        expect(getBarangay('999999999')).toBeUndefined()
    })
})

describe('getFullPath', () => {
    it('resolves a barangay code to the full hierarchy', () => {
        const bgys = getBarangays('045645000') // Sariaya, Quezon, CALABARZON
        const bgy = bgys[0]!
        const path = getFullPath(bgy.code)
        expect(path).not.toBeNull()
        expect(path!.barangay!.code).toBe(bgy.code)
        expect(path!.municipality!.code).toBe('045645000')
        expect(path!.province!.code).toBe('045600000')
        expect(path!.region.code).toBe('040000000')
    })

    it('resolves a municipality code — no barangay in result', () => {
        const path = getFullPath('045645000')
        expect(path).not.toBeNull()
        expect(path!.municipality!.code).toBe('045645000')
        expect(path!.province!.code).toBe('045600000')
        expect(path!.region.code).toBe('040000000')
        expect(path!.barangay).toBeNull()
    })

    it('resolves a province code — no municipality or barangay', () => {
        const path = getFullPath('045600000')
        expect(path).not.toBeNull()
        expect(path!.province!.code).toBe('045600000')
        expect(path!.region.code).toBe('040000000')
        expect(path!.municipality).toBeNull()
        expect(path!.barangay).toBeNull()
    })

    it('resolves a region code — only region populated', () => {
        const path = getFullPath('040000000')
        expect(path).not.toBeNull()
        expect(path!.region.code).toBe('040000000')
        expect(path!.province).toBeNull()
        expect(path!.municipality).toBeNull()
        expect(path!.barangay).toBeNull()
    })

    it('returns null province for NCR municipalities (no province level)', () => {
        // Manila is in NCR which has no province
        const manila = getMunicipality('133900000') // City of Manila
        if (!manila) return // skip if code differs in dataset
        const path = getFullPath('133900000')
        expect(path).not.toBeNull()
        expect(path!.province).toBeNull()
        expect(path!.region.code).toBe('130000000')
    })

    it('returns null for an unrecognized code', () => {
        expect(getFullPath('999999999')).toBeNull()
    })

    it('returns null for empty string', () => {
        expect(getFullPath('')).toBeNull()
    })
})
