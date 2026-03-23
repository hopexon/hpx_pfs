'use client'

import { useState, useMemo } from 'react'
import style from '@/app/tools/dpis-calculator/dpi.module.css'

export default function MmsCalculator() {
  const [px, setPx] = useState('')
  const [dpi, setDpi] = useState('')
  const inchMm = 25.4

  const MmResult = useMemo(() => {
    const pxv = Number(px)
    const dpiv = Number(dpi)
    if (!Number.isFinite(pxv) || !Number.isFinite(dpiv)) return ''
    if (pxv <= 0 || dpiv <= 0) return '-'
    const mmv = (pxv / dpiv) * inchMm
    return Number.isFinite(mmv) ? mmv.toFixed(2) : ''
  }, [px, dpi])

  return (
    <>
      <h2 className={style.calculator__ttl}>What it's really like, in mm</h2>
      <div className={style.dpi__calculator__wrapper}>
        <div className={style.dpi__calc__inner}>
          <div className={`${style.dpi__row} ${style.dpi__row__1}`}>
            <label htmlFor='pxmm'>you set the site of px: </label>
            <input id='pxmm' type='number' value={px} onChange={(e) => setPx(e.target.value)}></input>
          </div>
          <div className={`${style.dpi__row} ${style.dpi__row__2}`}>
            <label htmlFor='pxdpi'>with dpi: </label>
            <input id='pxdpi' type='number' value={dpi} onChange={(e) => setDpi(e.target.value)}></input>
          </div>
          <div className={`${style.dpi__row} ${style.dpi__row__3}`}>
            <label>so you could print up to a max of:<br /><output><span className={style.dpi__result}>{MmResult === '' ? '-' : MmResult}</span> mm</output></label>
          </div>
        </div>
      </div>
      <div className={style.dpi__note__wrapper}>
        <p className={`${style.dpi__note__item} ${style.note__ttl}`}>- note -</p>
        <p className={style.dpi__note__item}><span>・</span>max mm = (px ÷ dpi) × 1inch(25.4mm)</p>
      </div>
    </>
  )
}