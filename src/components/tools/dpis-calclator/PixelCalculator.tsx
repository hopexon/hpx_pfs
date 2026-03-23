'use client'

import { useState, useMemo } from 'react'
import style from '@/app/tools/dpis-calculator/dpi.module.css'

export default function PixelCalculator() {
  const [mm, setMm] = useState('')
  const [dpi, setDpi] = useState('')
  const inchMm = 25.4

  const pxResult = useMemo(() => {
    const mmv = Number(mm)
    const dpiv = Number(dpi)
    if (!Number.isFinite(mmv) || !Number.isFinite(dpiv)) return ''
    if (mmv <= 0 || dpiv <= 0) return '-'
    const px = (mmv / inchMm) * dpiv
    return Number.isFinite(px) ? px.toFixed(2) : ''
  }, [dpi, mm])

  return (
    <>
      <h2 className={style.calculator__ttl}>How Many Pixels Needed</h2>
      <div className={style.dpi__calculator__wrapper}>
        <div className={style.dpi__calc__inner}>
          <div className={`${style.dpi__row} ${style.dpi__row__1}`}>
            <label htmlFor='pxmm'>you wanna print in mm: </label>
            <input id='pxmm' type='number' value={mm} onChange={(e) => setMm(e.target.value)}></input>
          </div>
          <div className={`${style.dpi__row} ${style.dpi__row__2}`}>
            <label htmlFor='pxdpi'>with dpi: </label>
            <input id='pxdpi' type='number' value={dpi} onChange={(e) => setDpi(e.target.value)}></input>
          </div>
          <div className={`${style.dpi__row} ${style.dpi__row__3}`}>
            <label>so you must set:<br /><output><span className={style.dpi__result}>{pxResult === '' ? '-' : pxResult}</span>px</output></label>
          </div>
        </div>
      </div>
      <div className={style.dpi__note__wrapper}>
        <p className={`${style.dpi__note__item} ${style.note__ttl}`}>- note -</p>
        <p className={style.dpi__note__item}><span>・</span>px = (mm of a side you wanna print  ÷ 1inch(25.4mm)) × current dpi</p>
      </div>
    </>
  )
}