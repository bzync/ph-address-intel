import {
    regionByCode,
    provinceByCode,
    municipalityByCode,
    barangayByCode,
} from './data/index'
import type { ValidationInput, ValidationResult } from './types'

/**
 * Truncates an input value for inclusion in error messages.
 * Prevents log injection from arbitrarily long or malformed strings.
 */
function sanitize(value: string): string {
    return value.length > 20 ? `${value.slice(0, 20)}…` : value
}

/**
 * Validates that the provided address codes exist in the PSGC dataset and
 * form a consistent hierarchy (e.g. province belongs to the given region).
 *
 * Only fields that are provided are validated — partial inputs are fine.
 * Non-string values are silently ignored (treated as not provided).
 *
 * @example
 * validate({ regionCode: '040000000', provinceCode: '045600000' })
 * // → { valid: true, errors: [] }
 *
 * validate({ regionCode: '040000000', provinceCode: '010100000' })
 * // → { valid: false, errors: ['Province "Ilocos Norte" does not belong to region "040000000"'] }
 */
export function validate(input: ValidationInput): ValidationResult {
    const errors: string[] = []

    // Runtime type guards — treat non-string values as absent (safe for JS callers)
    const regionCode = typeof input.regionCode === 'string' ? input.regionCode : undefined
    const provinceCode = typeof input.provinceCode === 'string' ? input.provinceCode : undefined
    const municipalityCode = typeof input.municipalityCode === 'string' ? input.municipalityCode : undefined
    const barangayCode = typeof input.barangayCode === 'string' ? input.barangayCode : undefined

    let resolvedRegionCode: string | undefined
    let resolvedProvinceCode: string | undefined
    let resolvedMunicipalityCode: string | undefined

    if (regionCode !== undefined) {
        const region = regionByCode.get(regionCode)
        if (!region) {
            errors.push(`Region code "${sanitize(regionCode)}" not found`)
        } else {
            resolvedRegionCode = region.code
        }
    }

    if (provinceCode !== undefined) {
        const province = provinceByCode.get(provinceCode)
        if (!province) {
            errors.push(`Province code "${sanitize(provinceCode)}" not found`)
        } else {
            resolvedProvinceCode = province.code
            if (resolvedRegionCode !== undefined && province.regionCode !== resolvedRegionCode) {
                errors.push(
                    `Province "${province.name}" does not belong to region "${resolvedRegionCode}"`
                )
            }
        }
    }

    if (municipalityCode !== undefined) {
        const municipality = municipalityByCode.get(municipalityCode)
        if (!municipality) {
            errors.push(`Municipality code "${sanitize(municipalityCode)}" not found`)
        } else {
            resolvedMunicipalityCode = municipality.code
            if (resolvedRegionCode !== undefined && municipality.regionCode !== resolvedRegionCode) {
                errors.push(
                    `Municipality "${municipality.name}" does not belong to region "${resolvedRegionCode}"`
                )
            }
            if (
                resolvedProvinceCode !== undefined &&
                municipality.provinceCode !== resolvedProvinceCode
            ) {
                errors.push(
                    `Municipality "${municipality.name}" does not belong to province "${resolvedProvinceCode}"`
                )
            }
        }
    }

    if (barangayCode !== undefined) {
        const barangay = barangayByCode.get(barangayCode)
        if (!barangay) {
            errors.push(`Barangay code "${sanitize(barangayCode)}" not found`)
        } else {
            if (
                resolvedMunicipalityCode !== undefined &&
                barangay.municipalityCode !== resolvedMunicipalityCode
            ) {
                errors.push(
                    `Barangay "${barangay.name}" does not belong to municipality "${resolvedMunicipalityCode}"`
                )
            }
        }
    }

    return { valid: errors.length === 0, errors }
}
