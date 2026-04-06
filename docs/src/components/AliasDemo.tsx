import { useState, useMemo } from 'react'
import { TextField, Label, Input, Chip, Card, CardContent, Separator } from '@heroui/react'
import { resolveAlias } from '@bzync/ph-address-intel'
import type { SearchResult } from '@bzync/ph-address-intel'

const PRESETS = [
  'NCR',
  'Metro Manila',
  'CALABARZON',
  'BARMM',
  'Region IV-A',
  'Central Luzon',
  'Davao',
  'Bicol',
  'CARAGA',
  'CAR',
]

export default function AliasDemo() {
  const [alias, setAlias] = useState('')

  const result = useMemo<SearchResult | null | undefined>(() => {
    if (!alias.trim()) return undefined
    return resolveAlias(alias)
  }, [alias])

  return (
    <div className="space-y-6">
      <TextField value={alias} onChange={setAlias} className="max-w-xs">
        <Label className="text-sm text-foreground-500">Region alias</Label>
        <Input
          type="text"
          placeholder="e.g. NCR, CALABARZON, Davao…"
          className="text-base"
          autoComplete="off"
          spellCheck={false}
        />
      </TextField>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-foreground-400">Try:</span>
        {PRESETS.map((p) => (
          <Chip
            key={p}
            variant="soft"
            size="sm"
            className="cursor-pointer"
            onClick={() => setAlias(p)}
          >
            {p}
          </Chip>
        ))}
      </div>

      {result === undefined && (
        <div className="rounded-xl border-2 border-dashed border-divider p-8 text-center text-foreground-400 text-sm">
          Type a region alias above to resolve it to a PSGC code
        </div>
      )}

      {result === null && (
        <Card className="border border-warning/30 bg-warning/10">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-warning">
              No alias match for &ldquo;{alias}&rdquo;
            </p>
            <p className="text-foreground-500 mt-1 text-sm">
              Only region-level aliases are currently supported.
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border border-divider">
          <div className="px-5 py-3 flex items-center gap-2">
            <span className="text-success text-sm">✓</span>
            <span className="text-sm font-medium text-foreground">Resolved alias</span>
          </div>
          <Separator />
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Type">
                <Chip size="sm" color="success" variant="soft" className="capitalize">
                  {result.type}
                </Chip>
              </Field>
              <Field label="Name">
                <span className="text-sm font-medium text-foreground">{result.name}</span>
              </Field>
              <Field label="PSGC Code">
                <code className="font-mono text-sm bg-content2 text-foreground-600 px-2 py-0.5 rounded">
                  {result.code}
                </code>
              </Field>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-foreground-400 font-medium uppercase tracking-wider">{label}</p>
      <div>{children}</div>
    </div>
  )
}
