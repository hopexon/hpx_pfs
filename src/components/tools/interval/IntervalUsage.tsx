'use client';

import { useState } from 'react'
import AccordionWithAnim from '@/components/common/AccordionWithAnim'
import usePcMql from '@/hooks/mql'
import styles from '@/app/tools/interval/interval.module.css'

export default function IntervalUsage() {
  // const { isPc } = usePcMql()
  // const [syncedOpen, setSyncedOpen] = useState(false)
  // const syncProps = isPc
  //   ? { open: syncedOpen, onToggle: () => setSyncedOpen(prev => !prev) }
  //   : {}

  return (
    <>
      <div className={styles.interval__usage__wrap}>
        <AccordionWithAnim defaultOpen={false} summary='◯ 使い方'>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>このアプリについて</dt>
            <dd className='acc__with__anim__dd'><span>・</span>涙が出るほど便利なギター指板アプリです</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>利き手を変更する</dt>
            <dd className='acc__with__anim__dd'><span>・</span>あなたも右利きですか？ 楽しそうですね</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>弦本数の変更</dt>
            <dd className='acc__with__anim__dd'><span>・</span>“Strings”セクションで変更できます<br /><span>・</span>取り急ぎ4弦～9弦まで対応しています</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>各弦チューニングの変更</dt>
            <dd className='acc__with__anim__dd'><span>・</span>“Root”セクションで変更できます<br /><span>・</span>Str1 = 1弦です</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>度数マップモード</dt>
            <dd className='acc__with__anim__dd'><span>・</span>フレット図上の任意のフレットをクリック(タップ)することで、そのフレットを基準とした度数マップ表示モードに切り替わります。選択中のフレットは赤枠で強調されます<br /><span>・</span>通常モードに戻る場合は選択中のフレットを再度押下してください<br /><span>・</span>選択したものと異なるフレットを押下することで基点を変更可能です<br /><span>・</span>度数マップモード中はチューニング変更など通常モードの機能が制限されます<span>・</span>デフォルトではroot、3rd、5th、7th、9th(2nd)、11th(4th)、13th(6th)のみ表示されます<br /><span>・</span>面倒くさいので現状2、4、6度はテンション表記で統一しています</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>表示する度数を選ぶ&nbsp;(度数マップ)</dt>
            <dd className='acc__with__anim__dd'><span>・</span>度数マップモード中はPitchセクションが“Interval”セクションに変化します。表示する度数を変更したい場合に使用してください</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>表示する音名を選ぶ&nbsp;(通常モード)</dt>
            <dd className='acc__with__anim__dd'><span>・</span>“Pitch”セクションの各ボタンで切り替えてください<br /><span>・</span>“Scale”で何かしらスケールを適用している場合、“Reset”ボタンはそのスケールの初期値に戻ります</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>スケールの適用</dt>
            <dd className='acc__with__anim__dd'><span>・</span>“Scale”セクションからプリセットを使用できます。現状適当に追加しているだけなので、随時追加要望お待ちしております(大量でも可)</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>Tuningプリセット</dt>
            <dd className='acc__with__anim__dd'><span>・</span>チューニングの一括変更機能です。現状“Standard”のみの対応となるため、各弦チューニングのリセットボタン代わりに使ってください<br /><span>・</span>追加要望があればご連絡ください</dd>
          </dl>
        </AccordionWithAnim>
        <AccordionWithAnim defaultOpen={false} summary='◯ リリースノート'>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>2026-04-11</dt>
            <dd className='acc__with__anim__dd'><span>・</span>弦数変更機能を追加しました</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>2026-04-09</dt>
            <dd className='acc__with__anim__dd'><span>・</span>SPレイアウトでのフレット横幅を縮小しました</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>2026-03-21</dt>
            <dd className='acc__with__anim__dd'><span>・</span>Intervalモードおよび付随する機能を実装しました<br /><span>・</span>使い方、リリースノートを追加しました<br /><span>・</span>デプロイ環境をAWS S3 + Cloudfront から Vercel へ移行しました</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>2026-02-26</dt>
            <dd className='acc__with__anim__dd'><span>・</span>右利き左利き切り替え機能を追加しました<br /><span>・</span>各弦チューニングの変更機能を追加しました<br /><span>・</span>デザイン全体を更新しました<span>・</span>一般公開を開始しました<br /><span>・</span>内部ロジックを大幅に更新しました。全フレットをチューニングやスケールごとにハードコーディングする悍ましい仕様から脱却し、インデックスと mod で動的生成する方式へ変更できました。よかったね</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>2025-11-08</dt>
            <dd className='acc__with__anim__dd'><span>・</span>SvelteKitの求人はこの世に存在しないと判明したため急遽NextJSへ移行しました<br /><span>・</span>まともに動かなくなりました</dd>
          </dl>
          <dl className='acc__with__anim__dl'>
            <dt className='acc__with__anim__dt'>更新予定</dt>
            <dd className='acc__with__anim__dd'><span>・</span>開放弦のストローク音再生機能を追加</dd>
          </dl>
        </AccordionWithAnim>
      </div>
    </>
  )
}
