import { Link, Divider, Chip } from '@heroui/react'

export default function Footer() {
  return (
    <footer className="bg-content1 border-t border-divider py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground-500">
        <div className="flex items-center gap-3">
          <span className="text-primary font-mono font-semibold">PH</span>
          <span className="text-foreground-400">Address Library</span>
          <Divider orientation="vertical" className="h-4" />
          <Chip size="sm" variant="flat" color="default" className="font-mono">v0.1.0</Chip>
        </div>

        <div className="flex items-center gap-5">
          <span>
            Data:{' '}
            <Link
              href="https://psa.gov.ph/classification/psgc"
              target="_blank"
              size="sm"
              color="foreground"
              className="underline underline-offset-2"
            >
              PSA PSGC 4Q-2025
            </Link>
          </span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  )
}
