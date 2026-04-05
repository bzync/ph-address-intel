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

export interface PSGCData {
    regions: Region[]
    provinces: Province[]
    municipalities: Municipality[]
    barangays: Barangay[]
}

export interface ZipMap {
    [zip: string]: string
}

export interface SearchResult {
    type: 'region' | 'province' | 'municipality' | 'barangay'
    code: string
    name: string
    regionCode?: string
    provinceCode?: string | null
    municipalityCode?: string
}