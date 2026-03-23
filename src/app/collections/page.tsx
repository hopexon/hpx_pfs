import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Collections page',
}

const collectionNav = [
  {  name: "Decks", path: "/collections/decks" },
  // { name: "Flyers", path: "/collections/flyers" },
]

export default function Collections() {
  return (
    <div>
      <h1 className='page__ttl'>{String(metadata.title || "")}</h1>
      <div className="main__wrap">
        <section className="section__wrapper">
            <div className="linkitem__wrap space-y-10">
              {collectionNav.map((item) => (
                <Link key={item.name} href={item.path} className='link__item link__twister w-fit bold'>
                  {item.name}
                </Link>
              ))}
            </div>
        </section>
      </div>
    </div>
  )
}