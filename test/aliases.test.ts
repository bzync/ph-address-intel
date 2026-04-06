import { describe, it, expect } from 'vitest'
import { resolveAlias } from '../src/aliases'

describe('resolveAlias', () => {
    describe('known region aliases', () => {
        it('resolves NCR', () => {
            const result = resolveAlias('NCR')
            expect(result).not.toBeNull()
            expect(result!.code).toBe('130000000')
            expect(result!.type).toBe('region')
        })

        it('resolves "Metro Manila"', () => {
            expect(resolveAlias('Metro Manila')!.code).toBe('130000000')
        })

        it('resolves "National Capital Region"', () => {
            expect(resolveAlias('National Capital Region')!.code).toBe('130000000')
        })

        it('resolves CAR', () => {
            expect(resolveAlias('CAR')!.code).toBe('140000000')
        })

        it('resolves "Cordillera"', () => {
            expect(resolveAlias('Cordillera')!.code).toBe('140000000')
        })

        it('resolves "CALABARZON"', () => {
            expect(resolveAlias('CALABARZON')!.code).toBe('040000000')
        })

        it('resolves "Region IV-A"', () => {
            expect(resolveAlias('Region IV-A')!.code).toBe('040000000')
        })

        it('resolves "Region 4A"', () => {
            expect(resolveAlias('Region 4A')!.code).toBe('040000000')
        })

        it('resolves "MIMAROPA"', () => {
            expect(resolveAlias('MIMAROPA')!.code).toBe('170000000')
        })

        it('resolves "Region IV-B"', () => {
            expect(resolveAlias('Region IV-B')!.code).toBe('170000000')
        })

        it('resolves "Bicol"', () => {
            expect(resolveAlias('Bicol')!.code).toBe('050000000')
        })

        it('resolves "Western Visayas"', () => {
            expect(resolveAlias('Western Visayas')!.code).toBe('060000000')
        })

        it('resolves "Central Visayas"', () => {
            expect(resolveAlias('Central Visayas')!.code).toBe('070000000')
        })

        it('resolves "Eastern Visayas"', () => {
            expect(resolveAlias('Eastern Visayas')!.code).toBe('080000000')
        })

        it('resolves "Zamboanga Peninsula"', () => {
            expect(resolveAlias('Zamboanga Peninsula')!.code).toBe('090000000')
        })

        it('resolves "Northern Mindanao"', () => {
            expect(resolveAlias('Northern Mindanao')!.code).toBe('100000000')
        })

        it('resolves "Davao Region"', () => {
            expect(resolveAlias('Davao Region')!.code).toBe('110000000')
        })

        it('resolves "SOCCSKSARGEN"', () => {
            expect(resolveAlias('SOCCSKSARGEN')!.code).toBe('120000000')
        })

        it('resolves "CARAGA"', () => {
            expect(resolveAlias('CARAGA')!.code).toBe('160000000')
        })

        it('resolves "BARMM"', () => {
            expect(resolveAlias('BARMM')!.code).toBe('150000000')
        })

        it('resolves "ARMM" (legacy alias)', () => {
            expect(resolveAlias('ARMM')!.code).toBe('150000000')
        })

        it('resolves "Bangsamoro"', () => {
            expect(resolveAlias('Bangsamoro')!.code).toBe('150000000')
        })

        it('resolves roman-numeral region names', () => {
            expect(resolveAlias('Region I')!.code).toBe('010000000')
            expect(resolveAlias('Region II')!.code).toBe('020000000')
            expect(resolveAlias('Region III')!.code).toBe('030000000')
            expect(resolveAlias('Region V')!.code).toBe('050000000')
            expect(resolveAlias('Region X')!.code).toBe('100000000')
            expect(resolveAlias('Region XIII')!.code).toBe('160000000')
        })

        it('resolves numeric region names', () => {
            expect(resolveAlias('Region 1')!.code).toBe('010000000')
            expect(resolveAlias('Region 10')!.code).toBe('100000000')
            expect(resolveAlias('Region 13')!.code).toBe('160000000')
        })
    })

    describe('case insensitivity', () => {
        it('resolves uppercase alias', () => {
            expect(resolveAlias('NCR')).not.toBeNull()
        })

        it('resolves lowercase alias', () => {
            expect(resolveAlias('ncr')).not.toBeNull()
        })

        it('resolves mixed-case alias', () => {
            expect(resolveAlias('Metro Manila')).not.toBeNull()
            expect(resolveAlias('metro manila')).not.toBeNull()
            expect(resolveAlias('METRO MANILA')).not.toBeNull()
        })
    })

    describe('whitespace handling', () => {
        it('trims leading and trailing whitespace', () => {
            expect(resolveAlias('  NCR  ')!.code).toBe('130000000')
        })
    })

    describe('result shape', () => {
        it('returns type "region"', () => {
            expect(resolveAlias('NCR')!.type).toBe('region')
        })

        it('returns a name', () => {
            const result = resolveAlias('NCR')
            expect(result!.name.length).toBeGreaterThan(0)
        })

        it('returns a 9-digit PSGC code', () => {
            const result = resolveAlias('CALABARZON')
            expect(result!.code).toMatch(/^\d{9}$/)
        })
    })

    describe('unknown aliases', () => {
        it('returns null for unrecognized alias', () => {
            expect(resolveAlias('Unknown Region')).toBeNull()
        })

        it('returns null for empty string', () => {
            expect(resolveAlias('')).toBeNull()
        })

        it('returns null for a province name', () => {
            expect(resolveAlias('Quezon')).toBeNull()
        })

        it('returns null for a city name', () => {
            expect(resolveAlias('Cebu City')).toBeNull()
        })
    })
})
