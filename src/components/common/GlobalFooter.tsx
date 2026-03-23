'use client'

import Link from 'next/link'

import NAV from './json/contentsList.json'

export default function GlobalFooter() {
  return (
    <footer className="globalfooter">
      <nav className="globalfooter__inner">
        {NAV.map((item) => (
          <Link key={item.name} href={item.path} className="globalFooter__linkItem nav__linkItem">
            {item.name}
          </Link>
        ))}
      </nav>
    </footer>
  )
}