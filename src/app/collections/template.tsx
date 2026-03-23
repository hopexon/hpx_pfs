// for transition animation
// it must be put in every layer

'use client'
import { motion } from 'framer-motion'
import React from 'react'

const variants = {
  hidden: { opacity: 0 },
  enter: { opacity: 1 },
}

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className='site-wrapper'
      variants={variants}
      initial='hidden'
      animate='enter'
      transition={{
        type: 'tween',
        duration: 0.75,
      }}
    >
      {children}
    </motion.div>
  )
}