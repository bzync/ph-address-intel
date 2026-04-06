import { regionByCode } from './data/index'
import type { SearchResult } from './types'

/**
 * Common aliases for Philippine regions.
 * All values are 9-digit PSGC codes from the Q4 2025 publication.
 */
const REGION_ALIASES: Record<string, string> = {
    // NCR
    'ncr': '130000000',
    'metro manila': '130000000',
    'national capital region': '130000000',
    // CAR
    'car': '140000000',
    'cordillera': '140000000',
    'cordillera administrative region': '140000000',
    // Region I
    'region i': '010000000',
    'region 1': '010000000',
    'ilocos region': '010000000',
    'ilocos': '010000000',
    // Region II
    'region ii': '020000000',
    'region 2': '020000000',
    'cagayan valley': '020000000',
    // Region III
    'region iii': '030000000',
    'region 3': '030000000',
    'central luzon': '030000000',
    // Region IV-A
    'region iv-a': '040000000',
    'region iva': '040000000',
    'region iv a': '040000000',
    'region 4a': '040000000',
    'calabarzon': '040000000',
    // MIMAROPA
    'region iv-b': '170000000',
    'region ivb': '170000000',
    'region iv b': '170000000',
    'region 4b': '170000000',
    'mimaropa': '170000000',
    'mimaropa region': '170000000',
    // Region V
    'region v': '050000000',
    'region 5': '050000000',
    'bicol region': '050000000',
    'bicol': '050000000',
    // Region VI
    'region vi': '060000000',
    'region 6': '060000000',
    'western visayas': '060000000',
    // Region VII
    'region vii': '070000000',
    'region 7': '070000000',
    'central visayas': '070000000',
    // Region VIII
    'region viii': '080000000',
    'region 8': '080000000',
    'eastern visayas': '080000000',
    // Region IX
    'region ix': '090000000',
    'region 9': '090000000',
    'zamboanga peninsula': '090000000',
    'zamboanga': '090000000',
    // Region X
    'region x': '100000000',
    'region 10': '100000000',
    'northern mindanao': '100000000',
    // Region XI
    'region xi': '110000000',
    'region 11': '110000000',
    'davao region': '110000000',
    'davao': '110000000',
    // Region XII
    'region xii': '120000000',
    'region 12': '120000000',
    'soccsksargen': '120000000',
    // CARAGA
    'region xiii': '160000000',
    'region 13': '160000000',
    'caraga': '160000000',
    // BARMM
    'barmm': '150000000',
    'armm': '150000000',
    'bangsamoro': '150000000',
    'bangsamoro autonomous region': '150000000',
    'bangsamoro autonomous region in muslim mindanao': '150000000',
}

/**
 * Resolves a common alias (region nickname, abbreviation, or number) to a SearchResult.
 * Returns null if the alias is not recognized.
 *
 * @example
 * resolveAlias('NCR')         // → { type: 'region', code: '130000000', ... }
 * resolveAlias('Region IV-A') // → { type: 'region', code: '040000000', ... }
 * resolveAlias('BARMM')       // → { type: 'region', code: '150000000', ... }
 */
export function resolveAlias(alias: string): SearchResult | null {
    const key = alias.toLowerCase().trim()

    // Try region aliases first
    const regionCode = REGION_ALIASES[key]
    if (regionCode !== undefined) {
        const region = regionByCode.get(regionCode)
        if (region) return { type: 'region', code: region.code, name: region.name }
    }

    // Fall through: no alias found
    return null
}
