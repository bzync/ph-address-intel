import { useState, useMemo } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectPopover,
  ListBox,
  ListBoxItem,
  Label,
  Card,
  CardHeader,
  CardContent,
  Separator,
  Chip,
} from '@heroui/react'
import {
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
} from '@bzync/ph-address-intel'
import type { Region, Province, Municipality, Barangay } from '@bzync/ph-address-intel'

const allRegions = getRegions()

export default function CascadeDemo() {
  const [region, setRegion] = useState<Region | null>(null)
  const [province, setProvince] = useState<Province | null>(null)
  const [municipality, setMunicipality] = useState<Municipality | null>(null)
  const [barangay, setBarangay] = useState<Barangay | null>(null)

  const provinces = useMemo(
    () => (region ? getProvinces(region.code) : []),
    [region],
  )
  const municipalities = useMemo(
    () => (province ? getMunicipalities(province.code) : []),
    [province],
  )
  const barangays = useMemo(
    () => (municipality ? getBarangays(municipality.code) : []),
    [municipality],
  )

  function onRegion(code: string) {
    setRegion(allRegions.find((x) => x.code === code) ?? null)
    setProvince(null)
    setMunicipality(null)
    setBarangay(null)
  }

  function onProvince(code: string) {
    setProvince(provinces.find((x) => x.code === code) ?? null)
    setMunicipality(null)
    setBarangay(null)
  }

  function onMunicipality(code: string) {
    setMunicipality(municipalities.find((x) => x.code === code) ?? null)
    setBarangay(null)
  }

  function onBarangay(code: string) {
    setBarangay(barangays.find((x) => x.code === code) ?? null)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Select
            selectedKey={region?.code ?? null}
            onSelectionChange={(key) => key && onRegion(String(key))}
          >
            <Label className="text-sm text-foreground-500 mb-1 block">Region</Label>
            <SelectTrigger>
              <SelectValue>{({ selectedText }) => selectedText || 'Select a region'}</SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectPopover>
              <ListBox>
                {allRegions.map((r) => (
                  <ListBoxItem key={r.code} id={r.code}>{r.name}</ListBoxItem>
                ))}
              </ListBox>
            </SelectPopover>
          </Select>
        </div>

        <div>
          <Select
            selectedKey={province?.code ?? null}
            onSelectionChange={(key) => key && onProvince(String(key))}
            isDisabled={!region || provinces.length === 0}
          >
            <Label className="text-sm text-foreground-500 mb-1 block">
              {`Province${provinces.length > 0 ? ` (${provinces.length})` : ''}`}
            </Label>
            <SelectTrigger>
              <SelectValue>
                {({ selectedText }) =>
                  selectedText ||
                  (region
                    ? provinces.length === 0
                      ? 'No provinces (NCR)'
                      : 'Select a province'
                    : 'Select a region first')
                }
              </SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectPopover>
              <ListBox>
                {provinces.map((p) => (
                  <ListBoxItem key={p.code} id={p.code}>{p.name}</ListBoxItem>
                ))}
              </ListBox>
            </SelectPopover>
          </Select>
        </div>

        <div>
          <Select
            selectedKey={municipality?.code ?? null}
            onSelectionChange={(key) => key && onMunicipality(String(key))}
            isDisabled={municipalities.length === 0}
          >
            <Label className="text-sm text-foreground-500 mb-1 block">
              {`Municipality / City${municipalities.length > 0 ? ` (${municipalities.length})` : ''}`}
            </Label>
            <SelectTrigger>
              <SelectValue>
                {({ selectedText }) =>
                  selectedText || (province ? 'Select a municipality' : 'Select a province first')
                }
              </SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectPopover>
              <ListBox>
                {municipalities.map((m) => (
                  <ListBoxItem key={m.code} id={m.code}>
                    {m.name}{m.isCity ? ' (City)' : ''}{m.zipCodes.length > 0 ? ` — ${m.zipCodes.join(', ')}` : ''}
                  </ListBoxItem>
                ))}
              </ListBox>
            </SelectPopover>
          </Select>
        </div>

        <div>
          <Select
            selectedKey={barangay?.code ?? null}
            onSelectionChange={(key) => key && onBarangay(String(key))}
            isDisabled={barangays.length === 0}
          >
            <Label className="text-sm text-foreground-500 mb-1 block">
              {`Barangay${barangays.length > 0 ? ` (${barangays.length})` : ''}`}
            </Label>
            <SelectTrigger>
              <SelectValue>
                {({ selectedText }) =>
                  selectedText || (municipality ? 'Select a barangay' : 'Select a municipality first')
                }
              </SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectPopover>
              <ListBox>
                {barangays.map((b) => (
                  <ListBoxItem key={b.code} id={b.code}>{b.name}</ListBoxItem>
                ))}
              </ListBox>
            </SelectPopover>
          </Select>
        </div>
      </div>

      {region ? (
        <Card className="border border-divider">
          <CardHeader className="px-5 py-3 text-sm font-medium text-foreground">
            Selected address
          </CardHeader>
          <Separator />
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-1.5 items-center text-sm">
              <Crumb label={region.name} />
              {province && <><Arrow /><Crumb label={province.name} /></>}
              {municipality && (
                <>
                  <Arrow />
                  <Crumb label={municipality.name} badge={municipality.isCity ? 'City' : undefined} />
                </>
              )}
              {barangay && <><Arrow /><Crumb label={barangay.name} /></>}
            </div>

            {municipality && (
              <div className="mt-4 pt-4 border-t border-divider space-y-3">
                {municipality.zipCodes.length > 0 ? (
                  <div>
                    <p className="text-xs text-foreground-400 font-medium uppercase tracking-wider mb-2">
                      ZIP Code{municipality.zipCodes.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {municipality.zipCodes.map((z) => (
                        <Chip key={z} size="sm" color="accent" variant="soft" className="font-mono font-semibold">
                          {z}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-foreground-400 bg-content2 border border-divider rounded-lg px-3 py-2">
                    No ZIP code mapped for this municipality.
                  </p>
                )}

                {barangay && (
                  <div>
                    <p className="text-xs text-foreground-400 font-medium uppercase tracking-wider mb-2">
                      PSGC Code
                    </p>
                    <code className="font-mono text-sm bg-content2 text-foreground-600 px-3 py-1.5 rounded-lg inline-block">
                      {barangay.code}
                    </code>
                  </div>
                )}

                {!barangay && barangays.length === 0 && (
                  <p className="text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
                    No barangay data available for this municipality in the current dataset.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-divider p-8 text-center text-foreground-400 text-sm">
          Select a region above to begin
        </div>
      )}
    </div>
  )
}

function Crumb({ label, badge }: { label: string; badge?: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-foreground font-medium">{label}</span>
      {badge && <Chip size="sm" color="default" variant="soft">{badge}</Chip>}
    </span>
  )
}

function Arrow() {
  return <span className="text-foreground-300">›</span>
}
