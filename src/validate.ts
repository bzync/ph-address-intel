import {
    regionByCode,
    provinceByCode,
    municipalityByCode,
    barangayByCode,
} from './data/index'
import type { ValidationInput, ValidationResult } from './types'

/**
 * Validates that the provided address codes exist in the PSGC dataset and
 * form a consistent hierarchy (e.g. province belongs to the given region).
 *
 * Only fields that are provided are validated — partial inputs are fine.
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

    let resolvedRegionCode: string | undefined
    let resolvedProvinceCode: string | undefined
    let resolvedMunicipalityCode: string | undefined

    if (input.regionCode !== undefined) {
        const region = regionByCode.get(input.regionCode)
        if (!region) {
            errors.push(`Region code "${input.regionCode}" not found`)
        } else {
            resolvedRegionCode = region.code
        }
    }

    if (input.provinceCode !== undefined) {
        const province = provinceByCode.get(input.provinceCode)
        if (!province) {
            errors.push(`Province code "${input.provinceCode}" not found`)
        } else {
            resolvedProvinceCode = province.code
            if (resolvedRegionCode !== undefined && province.regionCode !== resolvedRegionCode) {
                errors.push(
                    `Province "${province.name}" does not belong to region "${resolvedRegionCode}"`
                )
            }
        }
    }

    if (input.municipalityCode !== undefined) {
        const municipality = municipalityByCode.get(input.municipalityCode)
        if (!municipality) {
            errors.push(`Municipality code "${input.municipalityCode}" not found`)
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

    if (input.barangayCode !== undefined) {
        const barangay = barangayByCode.get(input.barangayCode)
        if (!barangay) {
            errors.push(`Barangay code "${input.barangayCode}" not found`)
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
