import { useState } from 'react'
import { Button, Tooltip } from '@heroui/react'

interface Props {
  code: string
  language?: string
  filename?: string
}

export default function CodeBlock({ code, language = 'typescript', filename }: Props) {
  const [copied, setCopied] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-divider">
      <div className="flex items-center justify-between bg-content2 px-4 py-2 border-b border-divider">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-content3" />
          <span className="w-3 h-3 rounded-full bg-content3" />
          <span className="w-3 h-3 rounded-full bg-content3" />
          {filename && (
            <span className="ml-2 text-xs text-foreground-400 font-mono">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-foreground-400 font-mono">{language}</span>
          <Tooltip content={copied ? 'Copied!' : 'Copy'} size="sm" placement="left">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={copy}
              className="w-6 h-6 min-w-6 text-foreground-400"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </Tooltip>
        </div>
      </div>
      <pre className="bg-content1 px-5 py-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className="text-foreground-700">{code}</code>
      </pre>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
