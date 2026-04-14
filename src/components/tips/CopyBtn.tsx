'use client'
import { useState } from 'react'

export default function CopyBtn({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} className='text-xs hover:text-white transition-colors'>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}