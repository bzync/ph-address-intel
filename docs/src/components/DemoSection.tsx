import { useState } from 'react'
import ZipDemo from './ZipDemo'
import CascadeDemo from './CascadeDemo'
import SearchDemo from './SearchDemo'
import ValidateDemo from './ValidateDemo'
import AliasDemo from './AliasDemo'

type TabId = 'zip' | 'cascade' | 'search' | 'validate' | 'alias'

const TABS: { id: TabId; label: string; desc: string }[] = [
  {
    id: 'zip',
    label: 'ZIP Autofill',
    desc: 'Type a ZIP code → resolve to region, province, municipality & barangays',
  },
  {
    id: 'cascade',
    label: 'Cascading Selection',
    desc: 'Hierarchical dropdowns driven by the PSGC hierarchy',
  },
  {
    id: 'search',
    label: 'Search',
    desc: 'Search across regions, provinces, municipalities, and barangays — exact or fuzzy',
  },
  {
    id: 'validate',
    label: 'Validate',
    desc: 'Validate PSGC codes and check that they form a consistent hierarchy',
  },
  {
    id: 'alias',
    label: 'Alias',
    desc: 'Resolve common region aliases (NCR, CALABARZON, BARMM, …) to PSGC codes',
  },
]

const PANELS: Record<TabId, React.ReactNode> = {
  zip: <ZipDemo />,
  cascade: <CascadeDemo />,
  search: <SearchDemo />,
  validate: <ValidateDemo />,
  alias: <AliasDemo />,
}

export default function DemoSection() {
  const [active, setActive] = useState<TabId>('zip')
  const tab = TABS.find((t) => t.id === active)!

  return (
    <section id="demo" className="py-24 px-4 bg-content1">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Live Demo</h2>
          <p className="mt-3 text-foreground-500 text-lg">
            Fully interactive — calls the library directly in your browser.
          </p>
        </div>

        {/* Tab bar */}
        <div className="border-b border-divider overflow-x-auto">
          <div role="tablist" className="flex min-w-max">
            {TABS.map((t) => {
              const isActive = active === t.id
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={[
                    'relative px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                    'after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-colors',
                    isActive
                      ? 'text-foreground after:bg-primary'
                      : 'text-foreground-400 hover:text-foreground-600 after:bg-transparent',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Panel */}
        <div
          role="tabpanel"
          className="mt-6 rounded-xl border border-divider bg-content2 p-6"
        >
          <p className="text-sm text-foreground-500 mb-6">{tab.desc}</p>
          <div className={active === 'search' ? 'overflow-visible' : ''}>
            {PANELS[active]}
          </div>
        </div>
      </div>
    </section>
  )
}
