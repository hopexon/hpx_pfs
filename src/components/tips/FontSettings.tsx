'use client'

import { useState } from 'react'
import styles from '@/app/tips/contents/css/most_stable_font_settings_2026.module.css'

export default function FontSettings() {
  const [fontSettingClass, setFontSettingClass] = useState('fontsettings__1')

  return (
    <>
      <p className={`${styles.fontsettings__text} ${fontSettingClass}`}>
        この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>

      <section className={styles.fontsettings__btn__wrap}>
        <button onClick={() => setFontSettingClass(styles.fontsettings__1)}>Noto Sans JP</button>
        <button onClick={() => setFontSettingClass(styles.fontsettings__2)}>Neue / Kakugo</button>
        <button onClick={() => setFontSettingClass(styles.fontsettings__3)}>Sans Serif</button>
    </section>
    </>
  )
}