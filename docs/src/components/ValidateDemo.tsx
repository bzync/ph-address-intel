import { useState } from 'react'
import { TextField, Label, Input, Chip, Card, CardContent, Separator } from '@heroui/react'
import { validate } from '@bzync/ph-address-intel'
import type { ValidationResult } from '@bzync/ph-address-intel'

const PRESETS = [
  {
    label: 'Valid — Calabarzon',
    input: { regionCode: '040000000', provinceCode: '045600000', municipalityCode: '045606000' },
  },
  {
    label: 'Mismatched region/province',
    input: { regionCode: '040000000', provinceCode: '010100000' },
  },
  {
    label: 'Invalid code',
    input: { regionCode: '999999999' },
  },
  {
    label: 'Valid — NCR only',
    input: { regionCode: '130000000', municipalityCode: '137404000' },
  },
]

export default function ValidateDemo() {
  const [regionCode, setRegionCode] = useState('')
  const [provinceCode, setProvinceCode] = useState('')
  const [municipalityCode, setMunicipalityCode] = useState('')
  const [barangayCode, setBarangayCode] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)

  function run() {
    const input: Record<string, string> = {}
    if (regionCode.trim()) input.regionCode = regionCode.trim()
    if (provinceCode.trim()) input.provinceCode = provinceCode.trim()
    if (municipalityCode.trim()) input.municipalityCode = municipalityCode.trim()
    if (barangayCode.trim()) input.barangayCode = barangayCode.trim()
    if (Object.keys(input).length === 0) { setResult(null); return }
    setResult(validate(input))
  }

  function applyPreset(p: typeof PRESETS[number]) {
    setRegionCode(p.input.regionCode ?? '')
    setProvinceCode((p.input as { provinceCode?: string }).provinceCode ?? '')
    setMunicipalityCode((p.input as { municipalityCode?: string }).municipalityCode ?? '')
    setBarangayCode('')
    setResult(validate(p.input))
  }

  const hasInput = regionCode || provinceCode || municipalityCode || barangayCode

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-foreground-400">Presets:</span>
        {PRESETS.map((p) => (
          <Chip
            key={p.label}
            variant="soft"
            size="sm"
            className="cursor-pointer"
            onClick={() => applyPreset(p)}
          >
            {p.label}
          </Chip>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CodeField label="Region Code" value={regionCode} onChange={setRegionCode} placeholder="e.g. 040000000" />
        <CodeField label="Province Code" value={provinceCode} onChange={setProvinceCode} placeholder="e.g. 045600000" />
        <CodeField label="Municipality Code" value={municipalityCode} onChange={setMunicipalityCode} placeholder="e.g. 045606000" />
        <CodeField label="Barangay Code" value={barangayCode} onChange={setBarangayCode} placeholder="e.g. 045606001" />
      </div>

      {/* Run button */}
      <button
        type="button"
        disabled={!hasInput}
        onClick={run}
        className={[
          'px-5 py-2 rounded-xl text-sm font-medium transition-colors border',
          hasInput
            ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
            : 'bg-content2 text-foreground-400 border-divider cursor-not-allowed',
        ].join(' ')}
      >
        Validate
      </button>

      {/* Empty state */}
      {!hasInput && !result && (
        <div className="rounded-xl border-2 border-dashed border-divider p-8 text-center text-foreground-400 text-sm">
          Enter at least one PSGC code above and click Validate
        </div>
      )}

      {/* Result */}
      {result && (
        <Card
          className={[
            'border',
            result.valid ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5',
          ].join(' ')}
        >
          <div className="px-5 py-3 flex items-center gap-3">
            <span className={result.valid ? 'text-success text-base' : 'text-danger text-base'}>
              {result.valid ? '✓' : '✕'}
            </span>
            <span className={['text-sm font-semibold', result.valid ? 'text-success' : 'text-danger'].join(' ')}>
              {result.valid ? 'Valid address' : `Invalid — ${result.errors.length} error${result.errors.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          {result.errors.length > 0 && (
            <>
              <Separator />
              <CardContent className="p-5 space-y-2">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-sm text-danger flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">•</span>
                    <span>{e}</span>
                  </p>
                ))}
              </CardContent>
            </>
          )}
        </Card>
      )}
    </div>
  )
}

function CodeField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <TextField value={value} onChange={onChange}>
      <Label className="text-sm text-foreground-500">{label}</Label>
      <Input
        type="text"
        placeholder={placeholder}
        className="font-mono text-sm"
        autoComplete="off"
        spellCheck={false}
      />
    </TextField>
  )
}
