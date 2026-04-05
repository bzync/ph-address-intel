import { describe, it, expect } from 'vitest'
import { getRegions, getProvinces, getMunicipalities, getBarangays, search } from '../src/lookup'

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
})
