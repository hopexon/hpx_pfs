import type { Metadata } from 'next'
import { works } from './data'
import WorksList from '@/components/works/WorksList'

export const metadata: Metadata = {
  title: 'Works',
  description: 'Works page',
}

export default function Works() {
  return (
    <div>
      <h1 className='page__ttl'>{String(metadata.title || "")}</h1>
      <div className="main__wrap">
        <section className="section__wrapper">
          {works.map((work, i) => (
            <WorksList 
              key={work.imgBaseName ?? work.title}
              title={work.title}
              venue={work.venue}
              date={work.date}
              imgBaseName={work.imgBaseName}
              alt={work.alt}
              width={work.width}
              height={work.height}
              index={i}
            />
          ))}
        </section>
      </div>
    </div>
  )
}