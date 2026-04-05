import fs from 'fs/promises'
import path from 'path'
import * as cheerio from 'cheerio'

type ZipRow = {
    region: string
    province: string
    municipality: string
    zip: string
}

type ZipMap = Record<string, string[]>

const URL = 'https://phlpost.gov.ph/zip-code-locator/'
const OUTPUT_DIR = path.resolve(process.cwd(), 'src/data')
const RAW_OUTPUT_FILE = path.join(OUTPUT_DIR, 'zip-raw.json')
const MAP_OUTPUT_FILE = path.join(OUTPUT_DIR, 'zip.json')

function clean(text: string): string {
    return text.replace(/\s+/g, ' ').trim()
}

function normalizeMunicipality(name: string): string {
    return clean(name)
        .replace(/^City of\s+/i, '')
        .replace(/\s*\(formerly.*?\)\s*/gi, ' ')
        .replace(/\bSta\./gi, 'Santa')
        .replace(/\bSto\./gi, 'Santo')
        .replace(/\bMun\./gi, 'Municipality')
        .trim()
}

async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url, {
        headers: {
            'user-agent': 'Mozilla/5.0 ph-address zip data builder'
        }
    })

    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
    }

    return await res.text()
}

function parseTableRows(html: string): ZipRow[] {
    const $ = cheerio.load(html)
    const rows: ZipRow[] = []

    $('table tr').each((_, tr) => {
        const cells = $(tr)
            .find('th, td')
            .map((__, cell) => clean($(cell).text()))
            .get()
            .filter(Boolean)

        if (cells.length !== 4) return
        if (/^region$/i.test(cells[0] ?? '')) return

        const [region, province, municipality, zip] = cells

        if (!region || !province || !municipality || !zip) return
        if (!/^\d{4}$/.test(zip)) return

        rows.push({
            region,
            province,
            municipality,
            zip
        })
    })

    return rows
}

function buildZipMap(rows: ZipRow[]): ZipMap {
    const zipMap: ZipMap = {}

    for (const row of rows) {
        const zip = row.zip
        const municipality = normalizeMunicipality(row.municipality)

        if (!zipMap[zip]) {
            zipMap[zip] = []
        }

        if (!zipMap[zip].includes(municipality)) {
            zipMap[zip].push(municipality)
        }
    }

    return Object.fromEntries(
        Object.entries(zipMap).sort(([a], [b]) => a.localeCompare(b))
    ) as ZipMap
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

async function main(): Promise<void> {
    console.log(`Fetching ZIP locator from ${URL}`)

    const html = await fetchHtml(URL)
    const rows = parseTableRows(html)

    if (rows.length === 0) {
        throw new Error(
            'No ZIP rows parsed from the page. Inspect the page structure and update the selectors.'
        )
    }

    const zipMap = buildZipMap(rows)

    await writeJson(RAW_OUTPUT_FILE, rows)
    await writeJson(MAP_OUTPUT_FILE, zipMap)

    console.log(`Saved ${rows.length} rows to ${RAW_OUTPUT_FILE}`)
    console.log(`Saved ${Object.keys(zipMap).length} ZIP entries to ${MAP_OUTPUT_FILE}`)
}

void main().catch((error: unknown) => {
    console.error(error)
    process.exit(1)
})