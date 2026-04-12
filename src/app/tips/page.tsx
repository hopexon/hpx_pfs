import type {  Metadata } from 'next'
import Link from 'next/link'
import { tipsList } from './data.js'

export const metadata: Metadata = {
  title: 'Tips',
  description: 'Tips page',
}

export default function Tips() {
  return (
    <div>
      <h1 className='page__ttl'>{String(metadata.title || "")}</h1>
      <div className="main__wrap">
        <section className="section__wrapper">
          <div className="linkitem__wrap space-y-10">
            {tipsList.map((tip) => (
              <Link href={`/tips/${tip.url}`} key={tip.url} className="link__twister w-fit bold">
                {tip.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}