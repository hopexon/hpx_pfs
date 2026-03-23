import type { Metadata } from 'next'
import style from '@/app/tools/dpis-calculator/dpi.module.css'
import DpiCalculator from '@/components/tools/dpis-calclator/DpiCalculator'
import PixelCalculator from '@/components/tools/dpis-calclator/PixelCalculator'
import MmsCalculator from '@/components/tools/dpis-calclator/MmsCalculator'
import DpiCheetSheet from '@/components/tools/dpis-calclator/DpiCheetSheet'
import { ArticleGap } from '@/components/common/ArticleGap'


export const metadata: Metadata = {
  title: 'dpi(s) Calculator',
  description: 'dpi Calculator page',
}

export default function DpisCalculator() {
  return (
    <div>
      <h1 className='page__ttl'>{String(metadata.title || "")}</h1>
      <div className="main__wrap">
        <section className="section__wrapper">
          <DpiCalculator />
          <ArticleGap />
          <MmsCalculator />
          <ArticleGap />
          <PixelCalculator />
          <ArticleGap />
          <DpiCheetSheet />
        </section>
      </div>
    </div>
  )
}