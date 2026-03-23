'use client'

import type { ReactNode } from 'react'

type AccordionWithAnimProps = {
  wrapperClassName?: string
  detailsClassName?: string
  summaryClassName?: string
  summary: ReactNode
  defaultOpen?: boolean
  // open?: boolean
  // onToggle?: () => void
  children: ReactNode
}

export default function AccordionWithAnim({
  wrapperClassName,
  detailsClassName,
  summaryClassName,
  summary,
  defaultOpen,
  // open,
  // onToggle,
  children
}: AccordionWithAnimProps){
  // const isControlled = false
  return (
    <div className={`acc__with__anim ${wrapperClassName || ''}`}>
      <details className={detailsClassName} open={defaultOpen}>
        <summary
          className={summaryClassName}
          
        >{summary}</summary>
        <div className='acc__with__anim__hidden'>
          <div className="content__wrapper">
            {children}
          </div>
        </div>
      </details>
    </div>
  )
}