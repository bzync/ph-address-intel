export interface Region {
    code: string
    name: string
}

export interface Province {
    code: string
    name: string
    regionCode: string
}

export interface Municipality {
    code: string
    name: string
    regionCode: string
    provinceCode: string | null
    isCity: boolean
    zipCodes: string[]
}

export interface Barangay {
    code: string
    name: string
    municipalityCode: string
}

export interface ZipLookupResult {
    zip: string
    region: Region
    province: Province | null
    municipality: Municipality
    barangays: Barangay[]
}

export interface SearchResult {
    type: 'region' | 'province' | 'municipality' | 'barangay'
    code: string
    name: string
    score?: number
    regionCode?: string
    provinceCode?: string | null
    municipalityCode?: string
}

export interface SearchOptions {
    fuzzy?: boolean
    limit?: number
    types?: Array<'region' | 'province' | 'municipality' | 'barangay'>
    parentCode?: string
}

export interface FullPath {
    region: Region
    province: Province | null
    municipality: Municipality | null
    barangay: Barangay | null
}

export interface ValidationInput {
    regionCode?: string
    provinceCode?: string
    municipalityCode?: string
    barangayCode?: string
}

export interface ValidationResult {
    valid: boolean
    errors: string[]
}