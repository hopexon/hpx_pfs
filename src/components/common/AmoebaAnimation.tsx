"use client"

import { useEffect, useRef } from "react"

const NUM_PSEUDOPODS = 6
const SEGMENT_EASINGS = [
  "cubic-bezier(0.22, 1, 0.36, 1)",
  "cubic-bezier(0.4, 0, 0.2, 1)",
  "cubic-bezier(0.16, 1, 0.3, 1)",
  "cubic-bezier(0.7, 0, 0.84, 0)",
]

function pickRandom<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

export function AmoebaAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    // iOS Safari: url('#goo') のフラグメント参照が SPA コンテキストで
    // 正しく解決されない問題を回避。明示的にフルURLを指定する。
    const href = window.location.href.split('#')[0]
    container.style.filter = `url('${href}#goo')`

    const cleanupCallbacks: Array<() => void> = []

    const createPseudopod = () => {
      const element = document.createElement("div")
      element.classList.add("pseudopod")
      container.appendChild(element)

      let isStopped = false
      let runningAnimation: Animation | null = null
      let nextCycleTimer: number | null = null

      const runCycle = () => {
        if (isStopped) {
          return
        }

        const angle = Math.random() * 360
        const distance = 80 + Math.random() * 70
        const duration = 4000 + Math.random() * 4000
        const outwardRatio = 0.2 + Math.random() * 0.2
        const outwardEasing = pickRandom(SEGMENT_EASINGS)
        const returnEasing = pickRandom(SEGMENT_EASINGS)

        runningAnimation = element.animate(
          [
            {
              offset: 0,
              transform: `rotate(${angle}deg) translateX(0px) scale(0.5)`,
              easing: outwardEasing,
            },
            {
              offset: outwardRatio,
              transform: `rotate(${angle}deg) translateX(${distance}px) scale(1.2)`,
              easing: returnEasing,
            },
            {
              offset: 1,
              transform: `rotate(${angle}deg) translateX(0px) scale(0.5)`,
            },
          ],
          {
            duration,
            iterations: 1,
            easing: "linear",
            fill: "forwards",
          },
        )

        runningAnimation.finished
          .then(() => {
            if (isStopped) {
              return
            }

            nextCycleTimer = window.setTimeout(() => {
              runCycle()
            }, Math.random() * 300)
          })
          .catch(() => {
            return
          })
      }

      nextCycleTimer = window.setTimeout(() => {
        runCycle()
      }, Math.random() * 1500)

      cleanupCallbacks.push(() => {
        isStopped = true

        if (nextCycleTimer !== null) {
          window.clearTimeout(nextCycleTimer)
        }

        if (runningAnimation) {
          runningAnimation.cancel()
        }

        element.remove()
      })
    }

    for (let index = 0; index < NUM_PSEUDOPODS; index += 1) {
      createPseudopod()
    }

    return () => {
      container.style.filter = ''
      cleanupCallbacks.forEach((cleanup) => cleanup())
    }
  }, [])

  return (
    <div className="amoeba-container" id="amoebaContainer" ref={containerRef}>
      {/* SVG filter定義: iOS Safari互換のためコンテナ内部に配置 */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clipPath: "inset(50%)",
        }}
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            />
          </filter>
        </defs>
      </svg>
      <div className="amoeba-body"></div>
    </div>
  )
}
