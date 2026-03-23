'use client'

import { useFadeInTrigger } from '@/hooks/useFadeInOnView'

export default function FadeInActivator() {
  useFadeInTrigger({ bottomPercent: 20, once: true, selector: '.fadeInTrigger' })
  return null
}