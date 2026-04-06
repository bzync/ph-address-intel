import { useState, useMemo, useRef, useEffect } from 'react'
import { Chip } from '@heroui/react'
import {
  search,
  getRegion,
  getProvince,
  getMunicipality,
} from '@bzync/ph-address-intel'
import type { SearchResult } from '@bzync/ph-address-intel'

type EntityType = 'region' | 'province' | 'municipality' | 'barangay'

const TYPE_COLORS: Record<EntityType, 'default' | 'accent' | 'success' | 'warning'> = {
  region: 'success',
  province: 'accent',
  municipality: 'default',
  barangay: 'warning',
}

/** Build parent hierarchy labels for a result (excluding the result name itself) */
function buildBreadcrumb(result: SearchResult): string[] {
  const crumbs: string[] = []

  if (result.type === 'barangay' && result.municipalityCode) {
    const muni = getMunicipality(result.municipalityCode)
    if (muni) {
      crumbs.push(muni.name)
      if (muni.provinceCode) {
        const prov = getProvince(muni.provinceCode)
        if (prov) crumbs.push(prov.name)
      }
      const reg = getRegion(muni.regionCode)
      if (reg) crumbs.push(reg.name)
    }
  } else if (result.type === 'municipality') {
    if (result.provinceCode) {
      const prov = getProvince(result.provinceCode)
      if (prov) crumbs.push(prov.name)
    }
    if (result.regionCode) {
      const reg = getRegion(result.regionCode)
      if (reg) crumbs.push(reg.name)
    }
  } else if (result.type === 'province' && result.regionCode) {
    const reg = getRegion(result.regionCode)
    if (reg) crumbs.push(reg.name)
  }

  return crumbs
}

/** Sort: starts-with matches first, then contains; ties broken by name length */
function rankResults(results: SearchResult[], q: string): SearchResult[] {
  const ql = q.toLowerCase()
  return [...results].sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(ql) ? 0 : 1
    const bStarts = b.name.toLowerCase().startsWith(ql) ? 0 : 1
    if (aStarts !== bStarts) return aStarts - bStarts
    return a.name.length - b.name.length
  })
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SearchDemo() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [selected, setSelected] = useState<SearchResult | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim()
    if (q.length < 2) return []
    return rankResults(search(q, { limit: 30 }), q).slice(0, 10)
  }, [query])

  // Open/close dropdown based on results
  useEffect(() => {
    setOpen(results.length > 0)
    setActiveIdx(-1)
  }, [results])

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return
    const item = listRef.current.children[activeIdx] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelected(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      pickResult(results[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
      inputRef.current?.blur()
    }
  }

  function pickResult(r: SearchResult) {
    const crumbs = buildBreadcrumb(r)
    setQuery([r.name, ...crumbs].join(', '))
    setSelected(r)
    setOpen(false)
    setActiveIdx(-1)
    inputRef.current?.blur()
  }

  function clearInput() {
    setQuery('')
    setSelected(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  const selectedCrumbs = selected ? buildBreadcrumb(selected) : []

  return (
    <div className="space-y-4 min-h-80">
      {/* ── Search input ── */}
      <div ref={containerRef} className="relative">
        <div
          className={[
            'flex items-center gap-3 border bg-content2 rounded-xl px-4 py-3 transition',
            open
              ? 'border-primary/50 ring-1 ring-primary/20 rounded-b-none'
              : 'border-divider focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20',
          ].join(' ')}
        >
          <span className="text-foreground-400 shrink-0">
            <SearchIcon />
          </span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => { if (results.length > 0) setOpen(true) }}
            onKeyDown={handleKeyDown}
            placeholder="Search region, province, municipality, or barangay…"
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-foreground-400"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />

          {query && (
            <button
              type="button"
              onClick={clearInput}
              className="text-foreground-400 hover:text-foreground transition shrink-0"
              aria-label="Clear"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        {/* ── Dropdown ── */}
        {open && results.length > 0 && (
          <div
            ref={listRef}
            role="listbox"
            className="absolute z-50 left-0 right-0 bg-content1 border border-t-0 border-primary/50 rounded-b-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto"
          >
            {results.map((r, i) => {
              const crumbs = buildBreadcrumb(r)
              return (
                <button
                  key={r.code}
                  role="option"
                  aria-selected={i === activeIdx}
                  type="button"
                  className={[
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                    i === activeIdx ? 'bg-content2' : 'hover:bg-content2',
                    i !== 0 ? 'border-t border-divider' : '',
                  ].join(' ')}
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseDown={(e) => { e.preventDefault(); pickResult(r) }}
                >
                  <span className="text-foreground-300 mt-0.5 shrink-0">
                    <PinIcon />
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                    {crumbs.length > 0 && (
                      <p className="text-xs text-foreground-400 truncate mt-0.5">
                        {crumbs.join(' › ')}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-foreground-400 capitalize shrink-0 mt-0.5">
                    {r.type}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Hint ── */}
      {!query && (
        <p className="text-xs text-foreground-400 text-center py-2">
          Type at least 2 characters — e.g.{' '}
          <span className="font-medium text-foreground-500">Manila</span>,{' '}
          <span className="font-medium text-foreground-500">Cebu</span>,{' '}
          <span className="font-medium text-foreground-500">Poblacion</span>
        </p>
      )}

      {/* ── No results ── */}
      {query.trim().length >= 2 && results.length === 0 && !selected && (
        <p className="text-sm text-foreground-400 text-center py-4">
          No results for &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      {/* ── Selected place detail ── */}
      {selected && (
        <div className="rounded-xl border border-divider bg-content2 p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Chip size="sm" color={TYPE_COLORS[selected.type]} variant="soft" className="capitalize shrink-0">
              {selected.type}
            </Chip>
            <span className="text-sm font-semibold text-foreground">{selected.name}</span>
          </div>

          {selectedCrumbs.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-foreground-500">
              <PinIcon className="w-3 h-3 text-foreground-400 shrink-0" />
              {selectedCrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span>{crumb}</span>
                  {i < selectedCrumbs.length - 1 && (
                    <span className="text-foreground-300">›</span>
                  )}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-400">PSGC code</span>
            <code className="text-xs font-mono bg-content3 text-foreground-600 px-2 py-0.5 rounded">
              {selected.code}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}
