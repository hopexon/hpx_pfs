import type { Metadata } from 'next'

import { IntervalPageClient } from '@/app/tools/interval/IntervalPageClient'

export const metadata: Metadata = {
  title: 'Fingerboard Sheet for Lefty',
  description: 'Interval fingerboard tool',
}

export default function IntervalPage() {
  return <IntervalPageClient />
}