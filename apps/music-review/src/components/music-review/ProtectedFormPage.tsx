import type { ReactNode } from 'react'
import RequireMusicReviewAuth from '@/components/music-review/RequireMusicReviewAuth'

type ProtectedFormPageProps = {
  heading: string
  hiddenHeading?: boolean
  lead?: string
  size?: 'normal' | 'narrow'
  children: ReactNode
}

export default function ProtectedFormPage({
  heading,
  hiddenHeading = true,
  lead,
  size = 'narrow',
  children,
}: ProtectedFormPageProps) {
  const sectionClass = size === 'narrow' ? 'content__section__narrow' : 'content__section'
  const headingClass = hiddenHeading ? 'visually-hidden page__heading' : 'page__heading'

  return (
    <RequireMusicReviewAuth>
      <section className={sectionClass}>
        <div className='form__page'>
          <h1 className={headingClass}>{heading}</h1>
          {lead ? <p className='form__lead'>{lead}</p> : null}
          {children}
        </div>
      </section>
    </RequireMusicReviewAuth>
  )
}
