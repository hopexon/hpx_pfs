import { codeToHtml } from 'shiki'
import { Children, isValidElement, type ReactNode } from 'react'
import CopyBtn from '@/components/tips/CopyBtn'

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode }
    if (props.children) return extractText(props.children)
  }
  return ''
}

function extractLang(children: ReactNode): string {
  const child = Children.toArray(children)[0]
  if (isValidElement(child)) {
    const cls = (child.props as { className?: string }).className ?? ''
    const m = cls.match(/language-(\w+)/)
    if (m) return m[1]
  }
  return ''
}

export default async function CodeBlock({ children }: { children?: ReactNode }) {
  const raw = extractText(children).replace(/\n$/, '')
  const lang = extractLang(children)

  const html = await codeToHtml(raw, {
    lang: lang || 'text',
    theme: 'github-dark',
  })

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-700 my-6 text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 text-zinc-400">
        <span className="text-xs font-mono uppercase tracking-wider">{lang}</span>
        <CopyBtn code={raw} />
      </div>
      <div
        className="[&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:bg-zinc-900! [&_pre]:m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
