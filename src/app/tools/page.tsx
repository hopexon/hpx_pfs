import type {  Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tools',
  description: 'Tools page',
}

const ToolList = [
  { title: 'Fingerboard Sheet', url: '/tools/interval' },
  { title: 'dpis Calculator', url: '/tools/dpis-calculator' },
  { title: 'Aspect Inspector', url: '/tools/aspect-inspector' },
]

export default function Tools() {
  return (
    <div>
      <h1 className='page__ttl'>{String(metadata.title || "")}</h1>
      <div className="main__wrap">
        <section className="section__wrapper">
          <div className="linkitem__wrap space-y-10">
            {ToolList.map((tool) => (
              <Link href={tool.url} key={tool.url} className="link__twister w-fit bold">
                {tool.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}