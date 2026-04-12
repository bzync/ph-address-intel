/**
 * Security-focused tests for @bzync/ph-address-intel.
 *
 * These tests verify that public API functions handle adversarial, malformed,
 * and edge-case inputs safely — without throwing, hanging, or producing
 * unexpected results.
 */
import { describe, it, expect } from 'vitest'
import {
    search,
    getRegion,
    getProvince,
    getMunicipality,
    getBarangay,
    getRegions,
    getProvinces,
    getMunicipalities,
    getBarangays,
    getFullPath,
    MAX_QUERY_LENGTH,
    MAX_LIMIT,
} from '../src/lookup'
import { lookupByZip } from '../src/zip'
import { validate } from '../src/validate'
import { resolveAlias } from '../src/aliases'

// ─── search() ────────────────────────────────────────────────────────────────

describe('search() — input hardening', () => {
    it('returns [] for non-string input (number)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(search(123)).toEqual([])
    })

    it('returns [] for non-string input (null)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(search(null)).toEqual([])
    })

    it('returns [] for non-string input (undefined)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(search(undefined)).toEqual([])
    })

    it('returns [] for non-string input (object)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(search({})).toEqual([])
    })

    it('returns [] for non-string input (array)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(search(['Manila'])).toEqual([])
    })

    it('truncates queries longer than MAX_QUERY_LENGTH without throwing', () => {
        const longQuery = 'a'.repeat(10_000)
        expect(() => search(longQuery)).not.toThrow()
        // Should still find results (truncated to first MAX_QUERY_LENGTH chars)
        const results = search(longQuery)
        expect(Array.isArray(results)).toBe(true)
    })

    it('MAX_QUERY_LENGTH is 200', () => {
        expect(MAX_QUERY_LENGTH).toBe(200)
    })

    it('query at exact MAX_QUERY_LENGTH boundary works', () => {
        const query = 'a'.repeat(MAX_QUERY_LENGTH)
        expect(() => search(query)).not.toThrow()
    })

    it('handles NUL bytes in query without throwing', () => {
        expect(() => search('\x00Manila\x00')).not.toThrow()
    })

    it('handles control characters in query without throwing', () => {
        expect(() => search('\r\n\tManila')).not.toThrow()
    })

    it('handles Unicode homoglyphs without throwing', () => {
        // Visually similar to Latin chars but different code points
        expect(() => search('Маnila')).not.toThrow() // Cyrillic 'М'
    })

    it('handles RTL/bidi text without throwing', () => {
        expect(() => search('\u202EManila')).not.toThrow()
    })

    it('handles emoji without throwing', () => {
        expect(() => search('🇵🇭 Manila')).not.toThrow()
    })

    it('handles injection-style strings without throwing', () => {
        expect(() => search('__proto__')).not.toThrow()
        expect(() => search('constructor')).not.toThrow()
        expect(() => search('[object Object]')).not.toThrow()
    })

    it('does not find results for prototype pollution keys', () => {
        const r1 = search('__proto__')
        const r2 = search('constructor')
        // These strings do not appear in the PSGC dataset
        expect(r1).toEqual([])
        expect(r2).toEqual([])
    })
})

describe('search() — limit hardening', () => {
    it('clamps limit: Infinity returns at most MAX_LIMIT results', () => {
        const results = search('a', { limit: Infinity })
        expect(results.length).toBeLessThanOrEqual(MAX_LIMIT)
    })

    it('clamps limit: Number.MAX_SAFE_INTEGER returns at most MAX_LIMIT results', () => {
        const results = search('a', { limit: Number.MAX_SAFE_INTEGER })
        expect(results.length).toBeLessThanOrEqual(MAX_LIMIT)
    })

    it('clamps limit: NaN behaves predictably (returns MAX_LIMIT or fewer)', () => {
        const results = search('a', { limit: NaN })
        expect(results.length).toBeLessThanOrEqual(MAX_LIMIT)
    })

    it('clamps limit: -1 returns 0 results', () => {
        const results = search('a', { limit: -1 })
        expect(results).toHaveLength(0)
    })

    it('clamps limit: 0 returns 0 results', () => {
        const results = search('a', { limit: 0 })
        expect(results).toHaveLength(0)
    })

    it('MAX_LIMIT is 1000', () => {
        expect(MAX_LIMIT).toBe(1_000)
    })
})

describe('search() — parentCode hardening', () => {
    it('ignores non-string parentCode (number)', () => {
        // Should fall back to full unscoped search
        // @ts-expect-error intentional JS-caller simulation
        const scoped = search('Manila', { parentCode: 999 })
        const unscoped = search('Manila')
        expect(scoped.length).toBe(unscoped.length)
    })

    it('ignores non-string parentCode (null)', () => {
        // @ts-expect-error intentional JS-caller simulation
        const scoped = search('Manila', { parentCode: null })
        const unscoped = search('Manila')
        expect(scoped.length).toBe(unscoped.length)
    })

    it('ignores non-string parentCode (object)', () => {
        // @ts-expect-error intentional JS-caller simulation
        const scoped = search('Manila', { parentCode: { code: '130000000' } })
        const unscoped = search('Manila')
        expect(scoped.length).toBe(unscoped.length)
    })
})

// ─── lookupByZip() ────────────────────────────────────────────────────────────

describe('lookupByZip() — input hardening', () => {
    it('returns null for non-string input (number)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(lookupByZip(1234)).toBeNull()
    })

    it('returns null for non-string input (null)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(lookupByZip(null)).toBeNull()
    })

    it('returns null for non-string input (undefined)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(lookupByZip(undefined)).toBeNull()
    })

    it('returns null for non-string input (object)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(lookupByZip({})).toBeNull()
    })

    it('returns null for empty string', () => {
        expect(lookupByZip('')).toBeNull()
    })

    it('returns null for non-numeric string', () => {
        expect(lookupByZip('abcd')).toBeNull()
    })

    it('returns null for 3-digit input', () => {
        expect(lookupByZip('123')).toBeNull()
    })

    it('returns null for 5-digit input', () => {
        expect(lookupByZip('12345')).toBeNull()
    })

    it('returns null for padded input', () => {
        expect(lookupByZip(' 4322 ')).toBeNull()
    })

    it('returns null for __proto__', () => {
        expect(lookupByZip('__proto__')).toBeNull()
    })

    it('returns null for constructor', () => {
        expect(lookupByZip('constructor')).toBeNull()
    })

    it('returns null for very long string', () => {
        expect(lookupByZip('1'.repeat(1_000))).toBeNull()
    })

    it('returns null for NUL bytes', () => {
        expect(lookupByZip('\x00000')).toBeNull()
    })

    it('returns null for 0000 (unregistered)', () => {
        expect(lookupByZip('0000')).toBeNull()
    })

    it('accepts a valid 4-digit ZIP', () => {
        // 4322 = Sariaya, Quezon
        const result = lookupByZip('4322')
        expect(result).not.toBeNull()
    })
})

// ─── validate() ──────────────────────────────────────────────────────────────

describe('validate() — input hardening', () => {
    it('treats non-string regionCode as absent (returns valid)', () => {
        // @ts-expect-error intentional JS-caller simulation
        const result = validate({ regionCode: 40000000 })
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
    })

    it('treats null codes as absent', () => {
        // @ts-expect-error intentional JS-caller simulation
        const result = validate({ regionCode: null, provinceCode: null })
        expect(result.valid).toBe(true)
    })

    it('treats undefined codes as absent', () => {
        const result = validate({ regionCode: undefined })
        expect(result.valid).toBe(true)
    })

    it('treats object codes as absent', () => {
        // @ts-expect-error intentional JS-caller simulation
        const result = validate({ regionCode: { code: '040000000' } })
        expect(result.valid).toBe(true)
    })

    it('truncates long codes in error messages (no unbounded log output)', () => {
        const longCode = '9'.repeat(10_000)
        const result = validate({ regionCode: longCode })
        expect(result.valid).toBe(false)
        // Error message must not contain the full 10,000-char string
        expect(result.errors[0]!.length).toBeLessThan(100)
    })

    it('does not throw for __proto__ code', () => {
        expect(() => validate({ regionCode: '__proto__' })).not.toThrow()
        const result = validate({ regionCode: '__proto__' })
        expect(result.valid).toBe(false)
    })

    it('does not throw for constructor code', () => {
        expect(() => validate({ regionCode: 'constructor' })).not.toThrow()
    })

    it('handles empty string codes', () => {
        const result = validate({ regionCode: '' })
        expect(result.valid).toBe(false)
        expect(result.errors[0]).toContain('not found')
    })
})

// ─── resolveAlias() ──────────────────────────────────────────────────────────

describe('resolveAlias() — input hardening', () => {
    it('returns null for non-string input (number)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(resolveAlias(1)).toBeNull()
    })

    it('returns null for non-string input (null)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(resolveAlias(null)).toBeNull()
    })

    it('returns null for non-string input (undefined)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(resolveAlias(undefined)).toBeNull()
    })

    it('returns null for non-string input (object)', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(resolveAlias({})).toBeNull()
    })

    it('returns null for empty string', () => {
        expect(resolveAlias('')).toBeNull()
    })

    it('returns null for __proto__', () => {
        expect(resolveAlias('__proto__')).toBeNull()
    })

    it('returns null for constructor', () => {
        expect(resolveAlias('constructor')).toBeNull()
    })

    it('returns null for toString', () => {
        expect(resolveAlias('toString')).toBeNull()
    })

    it('returns null for hasOwnProperty', () => {
        expect(resolveAlias('hasOwnProperty')).toBeNull()
    })

    it('returns null for very long alias without throwing', () => {
        expect(() => resolveAlias('a'.repeat(10_000))).not.toThrow()
        expect(resolveAlias('a'.repeat(10_000))).toBeNull()
    })

    it('returns null for NUL bytes', () => {
        expect(resolveAlias('\x00NCR')).toBeNull()
    })
})

// ─── Single-item lookup functions ────────────────────────────────────────────

describe('getRegion() / getProvince() / getMunicipality() / getBarangay() — input hardening', () => {
    it('getRegion returns undefined for non-string', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(getRegion(null)).toBeUndefined()
        // @ts-expect-error intentional JS-caller simulation
        expect(getRegion(undefined)).toBeUndefined()
        // @ts-expect-error intentional JS-caller simulation
        expect(getRegion(130000000)).toBeUndefined()
    })

    it('getProvince returns undefined for non-string', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(getProvince(null)).toBeUndefined()
    })

    it('getMunicipality returns undefined for non-string', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(getMunicipality(null)).toBeUndefined()
    })

    it('getBarangay returns undefined for non-string', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(getBarangay(null)).toBeUndefined()
    })

    it('getFullPath returns null for non-string', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(getFullPath(null)).toBeNull()
        // @ts-expect-error intentional JS-caller simulation
        expect(getFullPath(40000000)).toBeNull()
    })
})

describe('getProvinces() / getMunicipalities() / getBarangays() — input hardening', () => {
    it('getProvinces returns [] for non-string', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(getProvinces(null)).toEqual([])
        // @ts-expect-error intentional JS-caller simulation
        expect(getProvinces(undefined)).toEqual([])
    })

    it('getMunicipalities returns [] for non-string', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(getMunicipalities(null)).toEqual([])
    })

    it('getBarangays returns [] for non-string', () => {
        // @ts-expect-error intentional JS-caller simulation
        expect(getBarangays(null)).toEqual([])
    })
})

// ─── Dataset integrity ────────────────────────────────────────────────────────

describe('dataset integrity', () => {
    it('all region codes are exactly 9 digits', () => {
        for (const r of getRegions()) {
            expect(r.code).toMatch(/^\d{9}$/)
        }
    })

    it('all province codes are exactly 9 digits', () => {
        for (const region of getRegions()) {
            for (const p of getProvinces(region.code)) {
                expect(p.code).toMatch(/^\d{9}$/)
            }
        }
    })

    it('no duplicate region codes', () => {
        const codes = getRegions().map((r) => r.code)
        expect(new Set(codes).size).toBe(codes.length)
    })

    it('all regions have non-empty names', () => {
        for (const r of getRegions()) {
            expect(r.name.length).toBeGreaterThan(0)
        }
    })

    it('all provinces belong to a known region', () => {
        const regionCodes = new Set(getRegions().map((r) => r.code))
        for (const region of getRegions()) {
            for (const p of getProvinces(region.code)) {
                expect(regionCodes.has(p.regionCode)).toBe(true)
            }
        }
    })

    it('ZIP lookup result always has zip matching the input', () => {
        const zips = ['4322', '1011', '6000']
        for (const zip of zips) {
            const result = lookupByZip(zip)
            if (result) {
                expect(result.zip).toBe(zip)
            }
        }
    })
})

// ─── Fuzzy search worst-case performance ─────────────────────────────────────

describe('search() — fuzzy worst-case performance', () => {
    it('completes fuzzy search of max-length query within 2 seconds', () => {
        const query = 'a'.repeat(MAX_QUERY_LENGTH)
        const start = Date.now()
        search(query, { fuzzy: true })
        const elapsed = Date.now() - start
        expect(elapsed).toBeLessThan(2_000)
    })

    it('completes scoped fuzzy search within 2 seconds', () => {
        const start = Date.now()
        search('a'.repeat(MAX_QUERY_LENGTH), { fuzzy: true, parentCode: '040000000' })
        const elapsed = Date.now() - start
        expect(elapsed).toBeLessThan(2_000)
    })
})
