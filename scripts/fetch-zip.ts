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

const SOURCE_URL = 'https://phlpost.gov.ph/zip-code-locator/'
const OUTPUT_DIR = path.resolve(process.cwd(), 'src/data')
const RAW_OUTPUT_FILE = path.join(OUTPUT_DIR, 'zip-raw.json')
const MAP_OUTPUT_FILE = path.join(OUTPUT_DIR, 'zip.json')

/** Maximum response body size accepted (5 MB). Prevents memory exhaustion from unexpectedly large responses. */
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024

/** Request timeout in milliseconds. */
const FETCH_TIMEOUT_MS = 30_000

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
    // Enforce HTTPS to prevent MITM on the data fetch
    if (!url.startsWith('https://')) {
        throw new Error(`Refusing to fetch over non-HTTPS URL: ${url}`)
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    let res: Response
    try {
        res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'user-agent': 'Mozilla/5.0 ph-address zip data builder'
            }
        })
    } finally {
        clearTimeout(timer)
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
    }

    // Guard against unexpectedly large responses
    const contentLength = res.headers.get('content-length')
    if (contentLength !== null && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
        throw new Error(`Response too large: content-length ${contentLength} exceeds ${MAX_RESPONSE_BYTES} bytes`)
    }

    const buffer = await res.arrayBuffer()
    if (buffer.byteLength > MAX_RESPONSE_BYTES) {
        throw new Error(`Response body too large: ${buffer.byteLength} bytes exceeds ${MAX_RESPONSE_BYTES} bytes`)
    }

    return new TextDecoder().decode(buffer)
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

        if (!zipMap[zip]!.includes(municipality)) {
            zipMap[zip]!.push(municipality)
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
    console.log(`Fetching ZIP locator from ${SOURCE_URL}`)

    const html = await fetchHtml(SOURCE_URL)
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
