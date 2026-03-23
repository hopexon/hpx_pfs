'use client'

import { useState } from 'react'

import { IntervalTool } from '@/components/tools/interval/IntervalTool'

import styles from '@/app/tools/interval/interval.module.css'

type Handedness = 'left' | 'right'

export function IntervalPageClient() {
  // to manage handedness state in this page, and pass it to IntervalTool as props
  const [handedness, setHandedness] = useState<Handedness>('left')
  const isRighty = handedness === 'right'

  return (
    <>
      <hgroup className={styles.intervaltool__ttl__wrapper}>
        <h1 className="page__ttl">
          Fingerboard Sheet for{' '}
          <span className={isRighty ? styles.ttl__lefty__strikethrough : ''}>Lefty</span>
        </h1>
        <p className={`${styles.ttl__note} ${isRighty ? styles.ttl__note__visible : ''}`}>
          Fxxk off Heretic!!
        </p>
      </hgroup>

      <div className="main__wrap">
        <section className="section__wrapper">
          {/* handedness state and its setter will be passed to IntervalTool, so you can change handedness in IntervalTool and reflect it in this page title */ }
          <IntervalTool handedness={handedness} onHandednessChange={setHandedness} />
        </section>
      </div>
    </>
  )
}