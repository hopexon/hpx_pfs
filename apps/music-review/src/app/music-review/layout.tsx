import type { ReactNode } from 'react'
import MusicReviewTopBar from '@/components/music-review/MusicReviewTopBar'
import ToTopBtn from '@/components/music-review/ToTopBtn'

type Props = {
  children: ReactNode
}

const footerMenuList = [
  { name: 'TOP', path: 'https://hpx-pfproject01.vercel.app/' },
  { name: 'Tools', path: 'https://hpx-pfproject01.vercel.app/tools/' },
  { name: 'Works', path: 'https://hpx-pfproject01.vercel.app/works/' },
  { name: 'Collections', path: 'https://hpx-pfproject01.vercel.app/collections/' },
]

export default function MusicReviewLayout({ children }: Props) {
  return (
    <div className='app__shell'>
      <MusicReviewTopBar />
      <main className='app__main'>
        {children}
        <ToTopBtn />
      </main>
      <footer className='globalfooter'>
        <div className='globalfooter__inner'>
          {footerMenuList.map((item) => (
            <a key={item.name} href={item.path} className='globalFooter__linkItem nav__linkItem'>
              {item.name}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
