"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import styles from '@/app/tools/aspect-inspector/aspect-inspector.module.css'

function gcd(a: number, b: number) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

async function getImageSize(file: File): Promise<{ width: number; height: number }> {
  try {
    const bmp = await createImageBitmap(file)
    return { width: bmp.width, height: bmp.height }
  } catch (e) {
    return await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
        URL.revokeObjectURL(url)
      }
      img.onerror = (err) => {
        URL.revokeObjectURL(url)
        reject(err)
      }
      img.src = url
    })
  }
}

function formatRatio(width: number, height: number) {
  const g = gcd(width, height) || 1
  const w = Math.round(width / g)
  const h = Math.round(height / g)
  const floatRatio = (width / height).toFixed(5)
  return `${w} : ${h} — ${floatRatio} : 1`
}

function computeCoverCrop(origW: number, origH: number, targetW: number, targetH: number) {
  const targetAspect = targetW / targetH
  const origAspect = origW / origH

  let cropW = origW
  let cropH = origH
  if (origAspect > targetAspect) {
    cropH = origH
    cropW = Math.round(origH * targetAspect)
  } else {
    cropW = origW
    cropH = Math.round(origW / targetAspect)
  }
  const x = Math.round((origW - cropW) / 2)
  const y = Math.round((origH - cropH) / 2)
  return { x, y, w: cropW, h: cropH }
}

const PRESETS: { id: string; label: string; w: number; h: number }[] = [
  { id: "16-9", label: "16:9", w: 16, h: 9 },
  { id: "4-3", label: "4:3", w: 4, h: 3 },
  { id: "1-1", label: "1:1", w: 1, h: 1 },
  { id: "3-2", label: "3:2", w: 3, h: 2 },
  { id: "9-16", label: "9:16 (vertical)", w: 9, h: 16 },
]

type ImageItem = {
  id: string
  file: File
  url: string
  width: number
  height: number
  ratioText: string
  presetId: string | null
  crop: { x: number; y: number; w: number; h: number } | null
  croppedPreviewUrl?: string | null
  thumbUrl?: string | null
  thumbPending?: boolean
  processing?: boolean
  customW?: number | null
  customH?: number | null
}

export default function AspectInspector() {
  const [items, setItems] = useState<ImageItem[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)
  const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]
  const [error, setError] = useState<string | null>(null)

  const THUMB_MAX_WIDTH = 320
  const MAX_CONCURRENCY = 3

  useEffect(() => {
    return () => {
      items.forEach((it) => {
        if (it.url) URL.revokeObjectURL(it.url)
        if (it.croppedPreviewUrl) URL.revokeObjectURL(it.croppedPreviewUrl)
        if (it.thumbUrl) URL.revokeObjectURL(it.thumbUrl)
      })
    }
  }, [items])

  async function makeThumbnailBlobUrl(file: File, maxWidth = THUMB_MAX_WIDTH) {
    try {
      let bmp: ImageBitmap
      try {
        // @ts-ignore
        bmp = await createImageBitmap(file, { resizeWidth: maxWidth, resizeHeight: undefined, resizeQuality: 'high' })
      } catch (e) {
        bmp = await createImageBitmap(file)
      }

      const scale = Math.min(1, maxWidth / bmp.width)
      const w = Math.max(1, Math.round(bmp.width * scale))
      const h = Math.max(1, Math.round(bmp.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(bmp, 0, 0, bmp.width, bmp.height, 0, 0, w, h)
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/jpeg', 0.8))
      if (!blob) throw new Error('toBlob returned null')
      return URL.createObjectURL(blob)
    } catch (e) {
      console.error('makeThumbnailBlobUrl error', e)
      throw e
    }
  }

  async function processTasksWithConcurrency(tasks: Array<() => Promise<void>>, concurrency = MAX_CONCURRENCY) {
    let idx = 0
    const workers: Promise<void>[] = []
    const runNext = async () => {
      if (idx >= tasks.length) return
      const i = idx++
      try { await tasks[i]() } catch (e) { console.error('task error', e) }
      await runNext()
    }
    for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
      workers.push(runNext())
    }
    await Promise.all(workers)
  }

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return
    setError(null)
    const arr = Array.from(files)
    const newItems: ImageItem[] = []

    for (const file of arr) {
      if (!ACCEPTED.includes(file.type)) continue
      try {
        const { width, height } = await getImageSize(file)
        const url = URL.createObjectURL(file)
        const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        newItems.push({
          id,
          file,
          url,
          width,
          height,
          ratioText: formatRatio(width, height),
          presetId: null,
          crop: null,
          croppedPreviewUrl: null,
          thumbUrl: null,
          thumbPending: true,
          processing: false,
          customW: null,
          customH: null,
        })
      } catch (e) {
        console.error(e)
        setError((prev) => (prev ? prev + "; " : "") + `Failed to read ${file.name}`)
      }
    }

    setItems((prev) => [...prev, ...newItems])

    const tasks = newItems.map((it) => async () => {
      try {
        const blobUrl = await makeThumbnailBlobUrl(it.file, THUMB_MAX_WIDTH)
        setItems((prev) => prev.map(p => p.id === it.id ? { ...p, thumbUrl: blobUrl, thumbPending: false } : p))
      } catch {
        setItems((prev) => prev.map(p => p.id === it.id ? { ...p, thumbPending: false } : p))
      }
    })
    await processTasksWithConcurrency(tasks, MAX_CONCURRENCY)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files) }, [handleFiles])
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }, [])
  const onPick = useCallback(() => inputRef.current?.click(), [])
  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { handleFiles(e.target.files); if (inputRef.current) inputRef.current.value = "" }, [handleFiles])
  const setPresetForItem = useCallback((id: string, presetId: string | null) => { setItems((prev) => prev.map((it) => it.id === id ? { ...it, presetId } : it)) }, [])

  const generateCroppedBlobUrl = useCallback(async (file: File, crop: { x: number; y: number; w: number; h: number }) => {
    try {
      const bmp = await createImageBitmap(file)
      const canvas = document.createElement('canvas')
      canvas.width = crop.w
      canvas.height = crop.h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(bmp, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h)
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), file.type))
      if (!blob) return null
      return URL.createObjectURL(blob)
    } catch (e) {
      console.error(e)
      setError('Failed to generate cropped preview')
      return null
    }
  }, [])

  const applyPresetToItem = useCallback(async (id: string) => {
    const it = items.find(i => i.id === id)
    if (!it) return
    setItems(prev => prev.map(p => p.id === id ? { ...p, processing: true } : p))
    const preset = PRESETS.find(p => p.id === it.presetId)
    if (it.customW && it.customH) {
      const crop = computeCoverCrop(it.width, it.height, it.customW, it.customH)
      const blobUrl = await generateCroppedBlobUrl(it.file, crop)
      setItems(prev => prev.map(p => p.id === id ? { ...p, crop, croppedPreviewUrl: blobUrl, processing: false } : p))
      return
    }
    if (!preset) {
      setItems(prev => prev.map(p => p.id === id ? { ...p, processing: false } : p))
      return
    }
    const crop = computeCoverCrop(it.width, it.height, preset.w, preset.h)
    const blobUrl = await generateCroppedBlobUrl(it.file, crop)
    setItems(prev => prev.map(p => p.id === id ? { ...p, crop, croppedPreviewUrl: blobUrl, processing: false } : p))
  }, [items, generateCroppedBlobUrl])

  const clearAll = useCallback(() => {
    items.forEach((it) => {
      if (it.url) URL.revokeObjectURL(it.url)
      if (it.croppedPreviewUrl) URL.revokeObjectURL(it.croppedPreviewUrl)
      if (it.thumbUrl) URL.revokeObjectURL(it.thumbUrl)
    })
    setItems([])
  }, [items])

  const openCroppedInNewTab = useCallback((id: string) => {
    const it = items.find(i => i.id === id)
    if (!it || !it.croppedPreviewUrl) return
    window.open(it.croppedPreviewUrl, '_blank')
  }, [items])

  const removeItem = useCallback((id: string) => {
    const it = items.find(i => i.id === id)
    if (it) {
      if (it.url) URL.revokeObjectURL(it.url)
      if (it.croppedPreviewUrl) URL.revokeObjectURL(it.croppedPreviewUrl)
      if (it.thumbUrl) URL.revokeObjectURL(it.thumbUrl)
    }
    setItems((prev) => prev.filter(i => i.id !== id))
  }, [items])

  const setCustomDims = useCallback((id: string, w: number | null, h: number | null) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, customW: w, customH: h } : i))
  }, [])

  const resetItem = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, presetId: null, crop: null, croppedPreviewUrl: null, customW: null, customH: null, processing: false } : i))
  }, [])

  const resetAll = useCallback(() => {
    setItems(prev => prev.map(i => ({ ...i, presetId: null, crop: null, croppedPreviewUrl: null, customW: null, customH: null, processing: false })))
  }, [])

  return (
  <div className="w-full">
    {/* 画像選択エリア */}
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-solid"
      role="button"
      onClick={onPick}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.avif,image/*"
        className="hidden"
        multiple
        onChange={onInputChange}
      />
      <p className="mb-2">
        DnD or Click here to select image(s) (jpg / png / gif / webp / avif)
      </p>
      <p className="text-sm text-gray-500">
        Selected images will be displayed in a list, and you can crop each one individually using presets or custom width/height.
      </p>
    </div>

    {/* 操作ボタン */}
    <div className="mt-4 flex gap-2 items-center">
      <button onClick={resetAll} className={styles.btn__ai}>
        Reset all
      </button>
      <button onClick={clearAll} className={styles.btn__ai}>
        Clear all
      </button>
    </div>

    {error && <p className="text-red-600 mt-3">{error}</p>}

    {/* 画像リスト */}
    <div className="">
      {items.map((it) => (
        <div
          key={it.id}
          style={{ filter: it.processing ? 'brightness(0.5)' : undefined }}
          className={styles.item__wrapper}
        >
          {/* サムネイル */}
          <div className={styles.thumb__wrapper}>
            {it.thumbUrl ? (
              <img
                src={it.thumbUrl}
                alt={it.file.name}
                className={styles.thumb__img}
              />
            ) : (
              <div className="text-xs text-gray-500">
                {it.thumbPending ? 'サムネ生成中...' : 'プレビューなし'}
              </div>
            )}
          </div>

          {/* 詳細情報 */}
          <div className={styles.info__wrapper}>
            <div className={styles.info__header}>
              <div>
                <div className="">{it.file.name}</div>
                <div className="">
                  {it.width} × {it.height} — {it.ratioText}
                </div>
              </div>
              <div className="">
                <button
                  onClick={() => removeItem(it.id)}
                  className={styles.btn__ai}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* クロップ・プリセット操作 */}
            <div className={styles.custom__wrapper}>
              <p>choose resize preset</p>
              <select
                value={it.presetId ?? ''}
                onChange={(e) => setPresetForItem(it.id, e.target.value || null)}
                className={`${styles.btn__ai} ${styles.select__preset}`}
              >
                <option value="">-- Preset --</option>
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>

              <div className={styles.custom__input__group}>
                <p>or enter custom dimensions</p>
                {/* <label className={styles.label__custom}>or cut to</label> */}
                <input
                  type="number"
                  className={styles.custom__input}
                  value={it.customW ?? ''}
                  onChange={(e) =>
                    setCustomDims(
                      it.id,
                      e.target.value ? Number(e.target.value) : null,
                      it.customH ?? null
                    )
                  }
                  placeholder="enter width"
                />
                <span className={styles.custom__input__separator}>×</span>
                {/* <label className="">H</label> */}
                <input
                  type="number"
                  className={styles.custom__input}
                  value={it.customH ?? ''}
                  onChange={(e) =>
                    setCustomDims(
                      it.id,
                      it.customW ?? null,
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  placeholder="enter height"
                />
              </div>
              <div className={styles.action__btn__group}>
                <button
                  onClick={() => void applyPresetToItem(it.id)}
                  disabled={!it.presetId && !(it.customW && it.customH)}
                  className={styles.btn__ai}
                >
                  Submit
                </button>

                <button
                  onClick={() => resetItem(it.id)}
                  className={`${styles.btn__ai} ${styles.btn__reset}`}
                >
                  Reset
                </button>

                <button
                  onClick={() => openCroppedInNewTab(it.id)}
                  disabled={!it.croppedPreviewUrl}
                  className={`${styles.btn__ai} ${styles.btn__prev}`}
                >
                  Prev →
                </button>

                <button
                  onClick={async () => {
                    if (!it.croppedPreviewUrl || !it.crop) return
                    const a = document.createElement('a')
                    a.href = it.croppedPreviewUrl
                    const ext = it.file.name.split('.').pop() || 'png'
                    a.download = `${it.file.name.replace(/\.[^.]+$/, '')}_cropped.${ext}`
                    a.click()
                  }}
                  disabled={!it.croppedPreviewUrl}
                  className={`${styles.btn__ai} ${styles.btn__dl}`}
                >
                  DL
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)
}
