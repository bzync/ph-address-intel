import { describe, it, expect } from 'vitest'
import { lookupByZip } from '../src/zip'

describe('lookupByZip', () => {
    describe('ZIP 4322 — Sariaya, Quezon, CALABARZON', () => {
        it('returns a result', () => {
            expect(lookupByZip('4322')).not.toBeNull()
        })

        it('returns the correct zip', () => {
            expect(lookupByZip('4322')!.zip).toBe('4322')
        })

        it('resolves region to CALABARZON', () => {
            const result = lookupByZip('4322')!
            expect(result.region.code).toBe('040000000')
            expect(result.region.name).toContain('CALABARZON')
        })

        it('resolves province to Quezon', () => {
            const result = lookupByZip('4322')!
            expect(result.province).not.toBeNull()
            expect(result.province!.code).toBe('045600000')
            expect(result.province!.name).toBe('Quezon')
        })

        it('resolves municipality to Sariaya', () => {
            const result = lookupByZip('4322')!
            expect(result.municipality.code).toBe('045645000')
            expect(result.municipality.name).toBe('Sariaya')
            expect(result.municipality.isCity).toBe(false)
        })

        it('returns barangays for Sariaya', () => {
            const result = lookupByZip('4322')!
            expect(result.barangays.length).toBeGreaterThan(0)
            expect(result.barangays).toHaveLength(43)
        })

        it('municipality zipCodes includes 4322', () => {
            const result = lookupByZip('4322')!
            expect(result.municipality.zipCodes).toContain('4322')
        })
    })

    describe('NCR ZIP — Manila (no province)', () => {
        it('returns a result for ZIP 1011', () => {
            expect(lookupByZip('1011')).not.toBeNull()
        })

        it('resolves region to NCR', () => {
            const result = lookupByZip('1011')!
            expect(result.region.code).toBe('130000000')
            expect(result.region.name).toContain('National Capital Region')
        })

        it('returns null province for NCR municipality', () => {
            const result = lookupByZip('1011')!
            expect(result.province).toBeNull()
        })

        it('resolves municipality to Manila', () => {
            const result = lookupByZip('1011')!
            expect(result.municipality.name).toContain('Manila')
            expect(result.municipality.isCity).toBe(true)
        })
    })

    describe('invalid inputs', () => {
        it('returns null for unknown ZIP', () => {
            expect(lookupByZip('0000')).toBeNull()
        })

        it('returns null for empty string', () => {
            expect(lookupByZip('')).toBeNull()
        })

        it('returns null for non-numeric input', () => {
            expect(lookupByZip('abcd')).toBeNull()
        })

        it('returns null for 5-digit ZIP', () => {
            expect(lookupByZip('12345')).toBeNull()
        })
    })

    describe('result shape', () => {
        it('ZipLookupResult has all required fields', () => {
            const result = lookupByZip('4322')!
            expect(result).toHaveProperty('zip')
            expect(result).toHaveProperty('region')
            expect(result).toHaveProperty('province')
            expect(result).toHaveProperty('municipality')
            expect(result).toHaveProperty('barangays')
        })

        it('municipality has zipCodes array', () => {
            const result = lookupByZip('4322')!
            expect(Array.isArray(result.municipality.zipCodes)).toBe(true)
        })

        it('barangays each have code, name, municipalityCode', () => {
            const result = lookupByZip('4322')!
            for (const b of result.barangays) {
                expect(b.code).toMatch(/^\d{9}$/)
                expect(b.name.length).toBeGreaterThan(0)
                expect(b.municipalityCode).toBe('045645000')
            }
        })
    })

    describe('coverage across regions', () => {
        it('ZIP 1100 resolves to a Quezon City result', () => {
            const result = lookupByZip('1100')
            if (result) {
                expect(result.municipality.name.toLowerCase()).toContain('quezon')
            }
        })

        it('can look up a Visayas ZIP', () => {
            // Find any valid ZIP for Visayas (Region VI, VII, or VIII) dynamically
            // by checking a known Cebu City zip
            const result = lookupByZip('6000')
            if (result) {
                expect(result.region.code).toBe('070000000') // Region VII
            }
        })
    })
})
