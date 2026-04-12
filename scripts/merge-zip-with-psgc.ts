import fs from 'fs/promises'
import path from 'path'

type Municipality = {
    code: string
    name: string
    regionCode: string
    provinceCode: string | null
    isCity: boolean
    zipCodes: string[]
}

type PSGCData = {
    regions: Array<{ code: string; name: string }>
    provinces: Array<{ code: string; name: string; regionCode: string }>
    municipalities: Municipality[]
    barangays: Array<{ code: string; name: string; municipalityCode: string }>
}

type ZipRawMap = Record<string, string[]>
type ZipCodeMap = Record<string, string[]>

const PSGC_FILE = path.resolve(process.cwd(), 'src/data/psgc.json')
const ZIP_FILE = path.resolve(process.cwd(), 'src/data/zip.json')
const OUTPUT_FILE = path.resolve(process.cwd(), 'src/data/zip-to-psgc.json')
const UNMATCHED_FILE = path.resolve(process.cwd(), 'src/data/zip-unmatched.json')

const MANUAL_ALIASES: Record<string, string> = {
    // NCR / Manila districts
    pandacan: 'manila',
    'santa mesa': 'manila',
    'sta mesa': 'manila',

    // Rizal / nearby
    'rodriguez montalban': 'rodriguez',
    mayamot: 'antipolo',
    'bagong nayon cogeo': 'antipolo',
    langhaya: 'binangonan',
    mambagat: 'rodriguez',
    'jala-jala': 'jala jala',
    'jalajala': 'jala jala',

    // Pampanga / Clark / Angeles / Mabalacat
    'basa airbase': 'floridablanca',
    'angeles city': 'angeles',
    'csez clark': 'mabalacat',
    'santa cruz lubao': 'lubao',
    'dau mabalacat': 'mabalacat',

    // Bataan
    lamao: 'limay',
    'fab freefort area of bataan': 'mariveles',
    cabcaben: 'mariveles',

    // Zambales / Pangasinan / Benguet
    'olongapo city': 'olongapo',
    'san carlos city': 'san carlos',
    'baguio city': 'baguio',
    'philippine military academy pma': 'baguio',

    // Bulacan
    baliuag: 'baliwag',
    'sapang palay': 'san jose del monte',
    'cruz na daan': 'san rafael',

    // Nueva Ecija / Isabela / CAR / Kalinga
    'cabanatuan city': 'cabanatuan',
    'gen tinio': 'general tinio',
    'general tinio': 'general tinio',
    'gapan city': 'gapan',
    'munoz': 'science city of munoz',
    'central luzon state university': 'science city of munoz',
    carrangalan: 'carranglan',
    'gen m natividad': 'general mamerto natividad',
    'general m natividad': 'general mamerto natividad',
    'fort magsaysay': 'laur',
    'palayan city': 'palayan',
    'talugtog': 'talugtug',
    naguillan: 'naguilian',
    'santiago city': 'santiago',
    'alfonso castaneda': 'alfonso castaneda',
    'tabuk city': 'tabuk',
    pinukpok: 'pinukpuk',

    // Laguna / Cavite / Batangas / Quezon
    'san pablo city': 'san pablo',
    botocan: 'majayjay',
    caluan: 'calauan',
    'college los banos': 'los banos',
    'laguna technopark': 'binan',
    'cavite city': 'cavite',
    'gen trias': 'general trias',
    'general trias': 'general trias',
    'trece martirez city': 'trece martires',
    'dasmarinas resettlement area': 'dasmarinas',
    'gen aguinaldo bailen': 'general emilio aguinaldo',
    'general aguinaldo bailen': 'general emilio aguinaldo',
    molino: 'bacoor',
    'lipa city': 'lipa',
    'fernando airbase': 'lipa',
    'mataas na kahoy': 'mataasnakahoy',
    'quezon capitol': 'lucena',
    'lucena city': 'lucena',
    hondagua: 'lopez',
    polilio: 'polillo',

    // Bicol
    'naga city': 'naga',
    sagnay: 'sagnay',
    'iriga city': 'iriga',
    'legazpi city': 'legazpi',
    'daraga locsin': 'daraga',
    'pio duran malacbalac': 'pio duran',
    'tulay na lupa': 'daet',
    bacon: 'sorsogon',

    // MIMAROPA
    palauan: 'paluan',
    tilik: 'lubang',
    'puerto princesa city': 'puerto princesa',
    'iwahig penal colony': 'puerto princesa',
    'narra panacan': 'narra',
    batazara: 'bataraza',
    'el nido baquit': 'el nido',
    'rizal marcos': 'rizal',
    'pio v corpuz': 'pio v corpus',
    'banton jones': 'banton',

    // Eastern Visayas
    wright: 'paranas',
    'calbayog city': 'calbayog',

    // Northern Mindanao / Davao / Caraga / BARMM
    'ozamis city': 'ozamiz',
    'oroquieta city': 'oroquieta',
    'tangub city': 'tangub',
    'davao city': 'davao',
    ateneo: 'davao',
    calinan: 'davao',
    'davao international airport': 'davao',
    mandug: 'davao',
    matina: 'davao',
    mintal: 'davao',
    talomo: 'davao',
    tibungco: 'davao',
    toril: 'davao',
    'university of mindanao': 'davao',
    babak: 'island garden city of samal',
    kaputian: 'island garden city of samal',
    'gov generoso': 'governor generoso',
    'governor generoso': 'governor generoso',
    cortez: 'santa maria',
    malixi: 'santa maria',
    'surigao city': 'surigao',
    'libjo formerly albor': 'libjo',
    'gen luna': 'general luna',
    'general luna': 'general luna',
    'butuan city': 'butuan',
    phillips: 'manolo fortich',
    musuan: 'maramag',
    'cagayan de oro city': 'cagayan de oro',
    'gingoog city': 'gingoog',
    'iligan city': 'iligan',
    'pre roxas': 'president roxas',
    'pres roxas': 'president roxas',
    'gen santos city': 'general santos',
    'general santos city': 'general santos',
    'mariano marcos': 'aleosan',
    'pres quirino': 'president quirino',
    'esperanza ampatuan': 'esperanza',
    'lebak salaman': 'lebak',
}

function clean(text: string): string {
    return text.replace(/\s+/g, ' ').trim()
}

function normalizeName(name: string): string {
    return clean(name)
        .toLowerCase()
        .replace(/ñ/g, 'n')
        .replace(/^city of\s+/i, '')
        .replace(/^municipality of\s+/i, '')
        .replace(/\(formerly.*$/i, '')
        .replace(/\((.*?)\)/g, ' $1 ')
        .replace(/\bsta\b\.?/g, 'santa')
        .replace(/\bsto\b\.?/g, 'santo')
        .replace(/\bgen\b\.?/g, 'general')
        .replace(/\bgov\b\.?/g, 'governor')
        .replace(/\bpre\b\.?/g, 'president')
        .replace(/\bpres\b\.?/g, 'president')
        .replace(/\bv\./g, 'v')
        .replace(/[.&,/'()-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function applyAlias(name: string): string {
    const normalized = normalizeName(name)
    // Use hasOwnProperty to avoid prototype pollution via specially crafted names
    return Object.prototype.hasOwnProperty.call(MANUAL_ALIASES, normalized) ? MANUAL_ALIASES[normalized]! : normalized
}

function buildMunicipalityIndex(municipalities: Municipality[]): Map<string, Municipality[]> {
    const index = new Map<string, Municipality[]>()

    for (const municipality of municipalities) {
        const normalized = normalizeName(municipality.name)

        const keys = new Set<string>([
            normalized,
            normalized.replace(/^city\s+/, '').trim(),
            normalized.replace(/\bcity\b/g, '').replace(/\s+/g, ' ').trim()
        ])

        for (const key of keys) {
            if (!key) continue

            const existing = index.get(key) ?? []
            existing.push(municipality)
            index.set(key, existing)
        }
    }

    return index
}

/**
 * Validates the shape of a parsed PSGC JSON object.
 * Throws if any required array is missing or empty.
 */
function validatePsgcSchema(data: unknown): asserts data is PSGCData {
    if (typeof data !== 'object' || data === null) {
        throw new Error('psgc.json is not a valid JSON object')
    }
    const d = data as Record<string, unknown>
    for (const key of ['regions', 'provinces', 'municipalities', 'barangays'] as const) {
        if (!Array.isArray(d[key])) {
            throw new Error(`psgc.json is missing required array: "${key}"`)
        }
        if ((d[key] as unknown[]).length === 0) {
            throw new Error(`psgc.json has empty array for "${key}" — possible corruption`)
        }
    }
}

/**
 * Validates the shape of a parsed ZIP JSON map.
 * Throws if the object is invalid or if any key is not a 4-digit ZIP code.
 */
function validateZipSchema(data: unknown): asserts data is ZipRawMap {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error('zip.json is not a valid JSON object')
    }
    const d = data as Record<string, unknown>
    for (const [key, val] of Object.entries(d)) {
        if (!/^\d{4}$/.test(key)) {
            throw new Error(`zip.json contains invalid ZIP key: "${key}" (must be 4 digits)`)
        }
        if (!Array.isArray(val) || val.some((v) => typeof v !== 'string')) {
            throw new Error(`zip.json entry for "${key}" must be an array of strings`)
        }
    }
}

async function readJson(filePath: string): Promise<unknown> {
    const content = await fs.readFile(filePath, 'utf8')
    return JSON.parse(content) as unknown
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

async function main(): Promise<void> {
    const rawPsgc = await readJson(PSGC_FILE)
    validatePsgcSchema(rawPsgc)
    const psgc: PSGCData = rawPsgc

    const rawZip = await readJson(ZIP_FILE)
    validateZipSchema(rawZip)
    const zipMap: ZipRawMap = rawZip

    const municipalityIndex = buildMunicipalityIndex(psgc.municipalities)

    const merged: ZipCodeMap = {}
    const unmatched: Record<string, string[]> = {}

    for (const [zip, names] of Object.entries(zipMap)) {
        const matchedCodes = new Set<string>()
        const missingNames: string[] = []

        for (const rawName of names) {
            const normalized = applyAlias(rawName)
            const matches = municipalityIndex.get(normalized) ?? []

            if (matches.length === 0) {
                missingNames.push(rawName)
                continue
            }

            for (const match of matches) {
                matchedCodes.add(match.code)
            }
        }

        if (matchedCodes.size > 0) {
            merged[zip] = Array.from(matchedCodes).sort()
        }

        if (missingNames.length > 0) {
            unmatched[zip] = missingNames
        }
    }

    const sortedMerged = Object.fromEntries(
        Object.entries(merged).sort(([a], [b]) => a.localeCompare(b))
    )

    const sortedUnmatched = Object.fromEntries(
        Object.entries(unmatched).sort(([a], [b]) => a.localeCompare(b))
    )

    await writeJson(OUTPUT_FILE, sortedMerged)
    await writeJson(UNMATCHED_FILE, sortedUnmatched)

    console.log(`Saved merged ZIP map to ${OUTPUT_FILE}`)
    console.log(`Saved unmatched ZIP names to ${UNMATCHED_FILE}`)
    console.log(`Matched ZIP entries: ${Object.keys(sortedMerged).length}`)
    console.log(`Unmatched ZIP entries: ${Object.keys(sortedUnmatched).length}`)
}

void main().catch((error: unknown) => {
    console.error(error)
    process.exit(1)
})
