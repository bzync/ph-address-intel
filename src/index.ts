export type {
    Region,
    Province,
    Municipality,
    Barangay,
    ZipLookupResult,
    SearchResult,
    SearchOptions,
    ValidationInput,
    ValidationResult,
} from './types'
export {
    getRegions,
    getProvinces,
    getMunicipalities,
    getBarangays,
    getRegion,
    getProvince,
    getMunicipality,
    getBarangay,
    search,
} from './lookup'
export { lookupByZip } from './zip'
export { resolveAlias } from './aliases'
export { validate } from './validate'
