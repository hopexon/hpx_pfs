import type { Metadata } from 'next'
import { normalizeSlug } from '@/hooks/slug'
import { tipsList, tipsMap } from '@/app/tips/data'
// import FadeInActivator from '@/hooks/fadeInActivator'
import { notFound } from 'next/navigation'
import styles from '@/app/tips/tips.module.css'

type Params = { slug: string }

export async function generateStaticParams() {
  return tipsList.map(n => ({ slug: n.url }))
}

export async function generateMetadata({ params }: {params: Promise<Params>}): Promise<Metadata> {
  const { slug } = await params
  const key = normalizeSlug(slug)
  const tips = tipsMap.get(key)
  if (!tips) return { title: 'Note not found' }
  return {
    title: `${tips.title} - Notes`,
    description: `${tips.title} - Note`,
  }
}

export default async function NotePage({ params }: {params: Promise<Params>}) {
  const { slug } = await params
  const key = normalizeSlug(slug)
  const tips = tipsMap.get(key)
  if (!tips) notFound()

  let Post: React.ComponentType
  try {
    const mod = await import(`@/app/tips/contents/${key}.mdx`)
    Post = mod.default
  } catch {
    notFound()
  }

  return (
    <div>
      {/* <FadeInActivator /> */}
      <hgroup className={styles.tips__hg}>
        <p className={styles.tips__date}>{tips.date}</p>
        <h1 className={`page__ttl ${styles.tips__page__ttl}`}>{tips.title}</h1>
      </hgroup>
      <div className="main__wrap">
        <section className={`section__wrapper ${styles.tips__section__wrapper}`}>
          <Post />
        </section>
      </div>
    </div>
  )
}