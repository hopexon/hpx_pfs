import type { Metadata } from 'next'
import DeckBrandsAcc from '@/components/decks/DeckBrandsAcc'
import styles from '@/app/collections/decks/decks.module.css'
import { decks } from '@/app/collections/decks/data'
import DecksList from '@/components/decks/DecksList'

export const metadata: Metadata = {
  title: 'Decks',
  description: 'Decks collection page',
}

export default function Decks() {
  return (
    <div>
      <h1 className='page__ttl'>{String(metadata.title || "")}</h1>
      <div className="main__wrap">
        <section className="section__wrapper">
          <DeckBrandsAcc />
          <div className={styles.decks__wrapper}>
            {decks.map((d, i) => (
              <DecksList 
                key={d.imgBaseName}
                brand={d.brand}
                id={d.id}
                model={d.model}
                title={d.title}
                imgBaseName={d.imgBaseName}
                alt={d.alt}
                index={i}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}