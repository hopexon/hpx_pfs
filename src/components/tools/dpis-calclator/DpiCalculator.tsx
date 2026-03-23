'use client'

import { useState, useMemo } from 'react'
import style from '@/app/tools/dpis-calculator/dpi.module.css'

export default function DpiCalculator() {
  const [px, setPx] = useState('')
  const [mm, setMm] = useState('')
  const inchMm = 25.4

  const dpiResult = useMemo(() => {
    const pxv = Number(px)
    const mmv = Number(mm)
    if (!Number.isFinite(pxv) || !Number.isFinite(mmv)) return ''
    if (pxv <= 0 || mmv <= 0) return '-'
    const dpi = pxv / (mmv / inchMm)
    return Number.isFinite(dpi) ? dpi.toFixed(2) : ''
  }, [px, mm])

  return (
    <>
      <h2 className={style.calculator__ttl}>Is dpi Enough?</h2>
      <div className={style.dpi__calculator__wrapper}>
        <div className={style.dpi__calc__inner}>
          <div className={`${style.dpi__row} ${style.dpi__row__1}`}>
            <label htmlFor='dpipx'>you set the site of px to: </label>
            <input id='dpipx' type='number' value={px} onChange={(e) => setPx(e.target.value)}></input>
          </div>
          <div className={`${style.dpi__row} ${style.dpi__row__2}`}>
            <label htmlFor='dpimm'>and wanna print in mm: </label>
            <input id='dpimm' type='number' value={mm} onChange={(e) => setMm(e.target.value)}></input>
          </div>
          <div className={`${style.dpi__row} ${style.dpi__row__3}`}>
            <label>dpi: <output><span className={style.dpi__result}>{dpiResult === '' ? '-' : dpiResult}</span></output></label>
          </div>
        </div>
      </div>
      <div className={style.dpi__note__wrapper}>
        <p className={`${style.dpi__note__item} ${style.note__ttl}`}>- note -</p>
        <p className={style.dpi__note__item}><span>・</span>dpi = pxs of a side ÷ (mm of a side you wanna print  ÷ 1inch(25.4mm))</p>
        <p className={style.dpi__note__item}><span>・</span>If the design size is set based on the correct aspect ratio, the other dpi should also be identical. </p>
        <p className={style.dpi__note__item}><span>・</span>keep your mind if you've add layers with raster format, you also have to pay attention to the dpi separately from the design.</p>
      </div>
    </>
  )
}