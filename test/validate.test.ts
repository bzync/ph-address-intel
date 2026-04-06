import { describe, it, expect } from 'vitest'
import { validate } from '../src/validate'
import { getBarangays } from '../src/lookup'

// Anchored to: CALABARZON (040000000) > Quezon (045600000) > Sariaya (045645000)
const REGION = '040000000'
const PROVINCE = '045600000'
const MUNICIPALITY = '045645000'
const BARANGAY = getBarangays(MUNICIPALITY)[0]!.code

describe('validate', () => {
    describe('empty input', () => {
        it('returns valid for an empty object', () => {
            const result = validate({})
            expect(result.valid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })
    })

    describe('single-field inputs', () => {
        it('accepts a valid region code', () => {
            expect(validate({ regionCode: REGION }).valid).toBe(true)
        })

        it('accepts a valid province code', () => {
            expect(validate({ provinceCode: PROVINCE }).valid).toBe(true)
        })

        it('accepts a valid municipality code', () => {
            expect(validate({ municipalityCode: MUNICIPALITY }).valid).toBe(true)
        })

        it('accepts a valid barangay code', () => {
            expect(validate({ barangayCode: BARANGAY }).valid).toBe(true)
        })

        it('rejects an unknown region code', () => {
            const result = validate({ regionCode: '999999999' })
            expect(result.valid).toBe(false)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0]).toContain('999999999')
        })

        it('rejects an unknown province code', () => {
            const result = validate({ provinceCode: '999999999' })
            expect(result.valid).toBe(false)
            expect(result.errors[0]).toContain('999999999')
        })

        it('rejects an unknown municipality code', () => {
            const result = validate({ municipalityCode: '999999999' })
            expect(result.valid).toBe(false)
            expect(result.errors[0]).toContain('999999999')
        })

        it('rejects an unknown barangay code', () => {
            const result = validate({ barangayCode: '999999999' })
            expect(result.valid).toBe(false)
            expect(result.errors[0]).toContain('999999999')
        })
    })

    describe('valid hierarchies', () => {
        it('accepts region + matching province', () => {
            const result = validate({ regionCode: REGION, provinceCode: PROVINCE })
            expect(result.valid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('accepts region + province + matching municipality', () => {
            const result = validate({ regionCode: REGION, provinceCode: PROVINCE, municipalityCode: MUNICIPALITY })
            expect(result.valid).toBe(true)
        })

        it('accepts region + province + municipality + matching barangay', () => {
            const result = validate({ regionCode: REGION, provinceCode: PROVINCE, municipalityCode: MUNICIPALITY, barangayCode: BARANGAY })
            expect(result.valid).toBe(true)
        })

        it('accepts province + municipality without region', () => {
            const result = validate({ provinceCode: PROVINCE, municipalityCode: MUNICIPALITY })
            expect(result.valid).toBe(true)
        })

        it('accepts municipality + barangay without region or province', () => {
            const result = validate({ municipalityCode: MUNICIPALITY, barangayCode: BARANGAY })
            expect(result.valid).toBe(true)
        })
    })

    describe('hierarchy mismatches', () => {
        it('rejects a province that does not belong to the given region', () => {
            // Ilocos Norte (012800000) is in Region I, not CALABARZON
            const result = validate({ regionCode: REGION, provinceCode: '012800000' })
            expect(result.valid).toBe(false)
            expect(result.errors.some((e) => e.includes('does not belong to region'))).toBe(true)
        })

        it('rejects a municipality that does not belong to the given region', () => {
            // Sariaya is in CALABARZON, not NCR
            const result = validate({ regionCode: '130000000', municipalityCode: MUNICIPALITY })
            expect(result.valid).toBe(false)
            expect(result.errors.some((e) => e.includes('does not belong to region'))).toBe(true)
        })

        it('rejects a municipality that does not belong to the given province', () => {
            // Sariaya is in Quezon province, not Batangas
            const result = validate({ provinceCode: '041000000', municipalityCode: MUNICIPALITY })
            expect(result.valid).toBe(false)
            expect(result.errors.some((e) => e.includes('does not belong to province'))).toBe(true)
        })

        it('rejects a barangay that does not belong to the given municipality', () => {
            // Get a barangay from a different municipality
            const otherMunCode = '045646000' // San Antonio, Quezon (adjacent to Sariaya)
            const otherBgys = getBarangays(otherMunCode)
            if (otherBgys.length === 0) return // skip if not in dataset
            const result = validate({ municipalityCode: MUNICIPALITY, barangayCode: otherBgys[0]!.code })
            expect(result.valid).toBe(false)
            expect(result.errors.some((e) => e.includes('does not belong to municipality'))).toBe(true)
        })

        it('accumulates multiple errors', () => {
            const result = validate({
                regionCode: '130000000',        // NCR
                provinceCode: '010100000',      // Ilocos Norte (wrong region)
                municipalityCode: MUNICIPALITY, // Sariaya (wrong region AND wrong province)
            })
            expect(result.valid).toBe(false)
            expect(result.errors.length).toBeGreaterThan(1)
        })
    })

    describe('result shape', () => {
        it('returns { valid: true, errors: [] } on success', () => {
            const result = validate({ regionCode: REGION })
            expect(result).toEqual({ valid: true, errors: [] })
        })

        it('returns { valid: false, errors: [...] } on failure', () => {
            const result = validate({ regionCode: '999999999' })
            expect(result.valid).toBe(false)
            expect(Array.isArray(result.errors)).toBe(true)
            expect(result.errors.length).toBeGreaterThan(0)
        })
    })
})
