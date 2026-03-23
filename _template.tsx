import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Collections page',
}

export default function Works() {
  return (
    <div>
      <h1 className='page__ttl'>{String(metadata.title || "")}</h1>
      <div className="main__wrap">
        <section className="section__wrapper">
          
        </section>
      </div>
    </div>
  )
}