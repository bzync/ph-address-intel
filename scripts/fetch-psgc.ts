// NOTE: xlsx is not listed as a devDependency due to known CVEs (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9).
// To run this script, install it temporarily: npm install xlsx && npx tsx scripts/fetch-psgc.ts
import fs from 'fs/promises'
import path from 'path'
// @ts-ignore — xlsx is intentionally not in devDependencies; install ad-hoc when needed
import * as XLSX from 'xlsx'

type Region = {
    code: string
    name: string
}

type Province = {
    code: string
    name: string
    regionCode: string
}

type Municipality = {
    code: string
    name: string
    regionCode: string
    provinceCode: string | null
    isCity: boolean
    zipCodes: string[]
}

type Barangay = {
    code: string
    name: string
    municipalityCode: string
}

type PSGCRow = Record<string, unknown>

const LOCAL_XLSX_FILE = path.resolve(
    process.cwd(),
    'src/data/PSGC-4Q-2025-Publication-Datafile.xlsx',
)

const OUTPUT_FILE = path.resolve(process.cwd(), 'src/data/psgc.json')

function clean(value: unknown): string {
    return String(value ?? '')
        .replace(/\s+/g, ' ')
        .trim()
}

function digitsOnly(value: unknown): string {
    return clean(value).replace(/\D/g, '')
}

function padPsgc(code: unknown): string {
    const digits = digitsOnly(code)
    return digits ? digits.padStart(9, '0') : ''
}

function normalizeLevel(value: unknown): string {
    const level = clean(value).toLowerCase()

    if (!level) return ''
    if (level === 'reg' || level.includes('region')) return 'Reg'
    if (level === 'prov' || level.includes('province')) return 'Prov'
    if (level === 'city') return 'City'
    if (level === 'mun' || level.includes('municipality')) return 'Mun'
    if (level === 'bgy' || level === 'brgy' || level.includes('barangay')) return 'Bgy'

    return ''
}

function isCityName(name: string): boolean {
    return /\bcity\b/i.test(name)
}

function deriveRegionCode(code: string): string {
    return `${code.slice(0, 2)}0000000`
}

function deriveProvinceCode(code: string): string | null {
    return code.slice(2, 5) === '000' ? null : `${code.slice(0, 5)}0000`
}

function deriveMunicipalityCode(code: string): string {
    return `${code.slice(0, 6)}000`
}

function pick(row: PSGCRow, candidates: string[]): unknown {
    const keys = Object.keys(row)

    for (const candidate of candidates) {
        const found = keys.find(
            (key) => key.toLowerCase().trim() === candidate.toLowerCase().trim(),
        )
        if (found) return row[found]
    }

    for (const candidate of candidates) {
        const found = keys.find((key) =>
            key.toLowerCase().includes(candidate.toLowerCase()),
        )
        if (found) return row[found]
    }

    return undefined
}

function parseSheetWithBestHeader(sheet: XLSX.WorkSheet): PSGCRow[] {
    for (let headerRow = 0; headerRow <= 15; headerRow++) {
        const rows = XLSX.utils.sheet_to_json<PSGCRow>(sheet, {
            defval: '',
            raw: false,
            range: headerRow
        })

        if (rows.length === 0) continue

        const keys = Object.keys(rows[0] ?? {}).map((k) => k.toLowerCase())

        const looksLikePsgcHeader =
            keys.some((k) => k.includes('code')) &&
            (
                keys.some((k) => k.includes('geographic')) ||
                keys.some((k) => k.includes('name')) ||
                keys.some((k) => k.includes('correspondence'))
            )

        if (looksLikePsgcHeader) {
            console.log(`Detected PSGC header row at sheet row index: ${headerRow}`)
            console.log('Detected keys:', Object.keys(rows[0] ?? {}))
            return rows
        }
    }

    return []
}

async function main(): Promise<void> {
    console.log(`Reading local PSGC workbook from ${LOCAL_XLSX_FILE}`)

    const fileBuffer = await fs.readFile(LOCAL_XLSX_FILE)
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

    console.log('Sheet names:', workbook.SheetNames)

    const sheetName = workbook.SheetNames.includes('PSGC') ? 'PSGC' : workbook.SheetNames[0]
    console.log('Selected sheet:', sheetName)

    const sheet = workbook.Sheets[sheetName!]
    if (!sheet) {
        throw new Error(`Could not find worksheet: ${sheetName}`)
    }

    const rows = parseSheetWithBestHeader(sheet)

    console.log('Parsed rows:', rows.length)
    console.log('First 3 rows:', rows.slice(0, 3))

    if (rows.length === 0) {
        throw new Error('Could not detect the actual PSGC header row in the PSGC sheet.')
    }

    const regions: Region[] = []
    const provinces: Province[] = []
    const municipalities: Municipality[] = []
    const barangays: Barangay[] = []

    for (const row of rows) {
        const code = padPsgc(
            pick(row, [
                'code',
                'psgc code',
                'geographic code'
            ])
        )

        const name = clean(
            pick(row, [
                'geographic area',
                'geographic area name',
                'name',
                'area name'
            ])
        )

        const level = normalizeLevel(
            pick(row, [
                'geographic level',
                'level',
                'inter level',
                'geo level'
            ])
        )

        if (!code || !name || !level) continue

        const regionCode =
            padPsgc(
                pick(row, [
                    'region code',
                    'reg code'
                ])
            ) || deriveRegionCode(code)

        const provinceCodeRaw = padPsgc(
            pick(row, [
                'province code',
                'prov code'
            ])
        )

        const municipalityCodeRaw = padPsgc(
            pick(row, [
                'city/municipality code',
                'city municipality code',
                'municipality code',
                'city code'
            ])
        )

        if (level === 'Reg') {
            regions.push({ code, name })
            continue
        }

        if (level === 'Prov') {
            provinces.push({
                code,
                name,
                regionCode
            })
            continue
        }

        if (level === 'City' || level === 'Mun') {
            municipalities.push({
                code,
                name,
                regionCode,
                provinceCode: provinceCodeRaw || deriveProvinceCode(code),
                isCity: level === 'City' || isCityName(name),
                zipCodes: []
            })
            continue
        }

        if (level === 'Bgy') {
            barangays.push({
                code,
                name,
                municipalityCode: municipalityCodeRaw || deriveMunicipalityCode(code)
            })
        }
    }

    const output = {
        regions,
        provinces,
        municipalities,
        barangays
    }

    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true })
    await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

    console.log(`Saved PSGC data to ${OUTPUT_FILE}`)
    console.log(`Regions: ${regions.length}`)
    console.log(`Provinces: ${provinces.length}`)
    console.log(`Municipalities: ${municipalities.length}`)
    console.log(`Barangays: ${barangays.length}`)
}

void main().catch((error: unknown) => {
    console.error(error)
    process.exit(1)
})