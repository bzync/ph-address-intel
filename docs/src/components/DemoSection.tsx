import { Tabs, Tab, Card, CardBody, CardHeader } from '@heroui/react'
import ZipDemo from './ZipDemo'
import CascadeDemo from './CascadeDemo'

export default function DemoSection() {
  return (
    <section id="demo" className="py-24 px-4 bg-content1">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Live Demo</h2>
          <p className="mt-3 text-foreground-500 text-lg">
            Fully interactive — calls the library directly in your browser.
          </p>
        </div>

        <Tabs
          aria-label="Demo tabs"
          color="primary"
          variant="underlined"
          classNames={{
            tabList: 'gap-6 border-b border-divider',
            tab: 'pb-4',
            cursor: 'bg-primary',
          }}
        >
          <Tab
            key="zip"
            title={
              <span className="flex items-center gap-2">
                <span>🔢</span> ZIP Autofill
              </span>
            }
          >
            <Card shadow="none" className="border border-divider mt-4">
              <CardHeader className="text-sm text-foreground-500 px-6 py-4">
                Type a ZIP code → resolve to region, province, municipality &amp; barangays
              </CardHeader>
              <CardBody className="p-6">
                <ZipDemo />
              </CardBody>
            </Card>
          </Tab>
          <Tab
            key="cascade"
            title={
              <span className="flex items-center gap-2">
                <span>🗂️</span> Cascading Selection
              </span>
            }
          >
            <Card shadow="none" className="border border-divider mt-4">
              <CardHeader className="text-sm text-foreground-500 px-6 py-4">
                Hierarchical dropdowns driven by the PSGC hierarchy
              </CardHeader>
              <CardBody className="p-6">
                <CascadeDemo />
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </section>
  )
}
