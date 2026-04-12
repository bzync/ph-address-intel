import {
    zipToMunCode,
    regionByCode,
    provinceByCode,
    municipalityByCode,
    barangaysByMunicipalityCode,
} from './data/index'
import type { ZipLookupResult } from './types'

/** Philippine ZIP codes are exactly 4 decimal digits. */
const ZIP_RE = /^\d{4}$/

export function lookupByZip(zip: string): ZipLookupResult | null {
    if (typeof zip !== 'string' || !ZIP_RE.test(zip)) return null

    const munCode = zipToMunCode[zip]
    if (munCode === undefined) return null

    const municipality = municipalityByCode.get(munCode)
    if (!municipality) return null

    const region = regionByCode.get(municipality.regionCode)
    if (!region) return null

    const province = municipality.provinceCode !== null
        ? (provinceByCode.get(municipality.provinceCode) ?? null)
        : null

    const barangays = barangaysByMunicipalityCode.get(munCode) ?? []

    return { zip, region, province, municipality, barangays }
}
