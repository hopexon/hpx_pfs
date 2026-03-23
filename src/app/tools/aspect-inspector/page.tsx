import type {  Metadata } from 'next'
import AspectInspector from '@/components/tools/AspectInspector'

export const metadata: Metadata = {
  title: 'Aspect Inspector',
  description: 'A tool to inspect image aspect ratios.',
}

export default function AspectInspectorPage() {
  return (
    <div>
      <h1 className='page__ttl'>{String(metadata.title || "")}</h1>
      <div className="main__wrap">
        <section className="section__wrapper">
          <AspectInspector />
        </section>
      </div>
    </div>
  )
}