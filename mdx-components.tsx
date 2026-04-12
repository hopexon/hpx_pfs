import type { MDXComponents } from "mdx/types"
import CodeBlock from '@/components/tips/CodeBlock'

const components: MDXComponents = {
  pre: CodeBlock,
}

export function useMDXComponents(): MDXComponents {
  return components
}