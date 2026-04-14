import type { MDXComponents } from "mdx/types"
import CodeBlock from '@/components/tips/CodeBlock'
import styles from '@/app/tips/tips.module.css'

const components: MDXComponents = {
  pre: CodeBlock,
  p: ({ children, className }) => <p className={[styles.tips__base__txt, className].filter(Boolean).join(' ')}>{children}</p>
}

export function useMDXComponents(): MDXComponents {
  return components
}