import type { Metadata } from 'next'
import './global.css'

export const metadata: Metadata = {
  title: 'Music Review',
  description: 'Standalone music review application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='ja'>
      <body className='antialiased'>{children}</body>
    </html>
  )
}
