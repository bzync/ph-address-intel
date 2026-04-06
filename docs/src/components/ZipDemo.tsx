import { useState } from 'react'
import { TextField, Label, Input, Button, Chip, Card, CardHeader, CardContent, Separator } from '@heroui/react'
import { lookupByZip } from '@bzync/ph-address-intel'
import type { ZipLookupResult } from '@bzync/ph-address-intel'

const PRESETS = [
  { zip: '4322', label: 'Sariaya, Quezon' },
  { zip: '1011', label: 'Manila, NCR' },
  { zip: '6000', label: 'Cebu City' },
  { zip: '8000', label: 'Davao City' },
]

export default function ZipDemo() {
  const [zip, setZip] = useState('')
  const [result, setResult] = useState<ZipLookupResult | null | undefined>(undefined)

  function lookup(value: string) {
    const trimmed = value.trim()
    setZip(trimmed)
    if (trimmed.length === 0) { setResult(undefined); return }
    setResult(lookupByZip(trimmed))
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-end">
        <TextField
          value={zip}
          onChange={lookup}
          className="max-w-[180px]"
        >
          <Label className="text-sm text-foreground-500">Philippine ZIP Code</Label>
          <Input
            type="text"
            placeholder="e.g. 4322"
            maxLength={4}
            inputMode="numeric"
            className="font-mono text-base"
          />
        </TextField>
        <Button
          variant="ghost"
          onPress={() => lookup('')}
          className="mb-0.5"
        >
          Clear
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-foreground-400">Try:</span>
        {PRESETS.map(({ zip: z, label }) => (
          <Chip
            key={z}
            variant="soft"
            size="sm"
            className="cursor-pointer font-mono"
            onClick={() => lookup(z)}
          >
            {z} — {label}
          </Chip>
        ))}
      </div>

      {result === undefined && (
        <div className="rounded-xl border-2 border-dashed border-divider p-8 text-center text-foreground-400 text-sm">
          Type a ZIP code above to see the lookup result
        </div>
      )}

      {result === null && (
        <Card className="border border-danger/30 bg-danger/10">
          <CardContent className="p-5">
            <p className="font-medium text-danger text-sm">No match found for ZIP &ldquo;{zip}&rdquo;</p>
            <p className="text-foreground-500 mt-1 text-sm">This ZIP code is not in the dataset.</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border border-divider">
          <CardHeader className="px-5 py-3 flex items-center gap-2">
            <span className="text-success text-sm">✓</span>
            <span className="font-medium text-sm text-foreground">
              Result for ZIP{' '}
              <code className="font-mono bg-content2 px-1.5 py-0.5 rounded text-xs">
                {result.zip}
              </code>
            </span>
          </CardHeader>
          <Separator />
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultField label="Region" value={result.region.name} code={result.region.code} />
              <ResultField
                label="Province"
                value={result.province?.name ?? null}
                code={result.province?.code ?? null}
                nullLabel="N/A — directly under NCR"
              />
              <ResultField
                label="Municipality / City"
                value={result.municipality.name}
                code={result.municipality.code}
                badge={result.municipality.isCity ? 'City' : 'Municipality'}
              />
              <ResultField
                label="Barangays"
                value={`${result.barangays.length} barangays`}
                code={null}
              />
            </div>

            {result.barangays.length > 0 && (
              <div>
                <p className="text-xs text-foreground-400 font-medium uppercase tracking-wider mb-2">
                  Barangays (first 10 of {result.barangays.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.barangays.slice(0, 10).map((b) => (
                    <Chip key={b.code} size="sm" color="accent" variant="soft">
                      {b.name}
                    </Chip>
                  ))}
                  {result.barangays.length > 10 && (
                    <span className="text-xs text-foreground-400 self-center">
                      +{result.barangays.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ResultField({
  label,
  value,
  code,
  badge,
  nullLabel,
}: {
  label: string
  value: string | null
  code: string | null
  badge?: string
  nullLabel?: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-foreground-400 font-medium uppercase tracking-wider">{label}</p>
      {value !== null ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-foreground font-medium text-sm">{value}</span>
          {badge && (
            <Chip size="sm" color="default" variant="soft">{badge}</Chip>
          )}
          {code && (
            <code className="text-xs text-foreground-400 font-mono bg-content2 px-1.5 py-0.5 rounded">
              {code}
            </code>
          )}
        </div>
      ) : (
        <span className="text-foreground-400 text-sm italic">{nullLabel ?? 'null'}</span>
      )}
    </div>
  )
}
