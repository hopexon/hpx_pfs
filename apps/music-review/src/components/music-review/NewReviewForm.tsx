'use client'

import { useCallback, useId, useMemo, useRef, useState, type FormEvent, type DragEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/app/music-review/music-review.module.css'
import { useMusicReviewAuth } from '@/hooks/useMusicReviewAuth'
import { buildActorFromSession } from '@/lib/music-review/auth/actor'
import {
  hasReviewDraftErrors,
  validateMusicReviewDraft,
} from '@/lib/music-review/reviewValidation'
import type {
  EmbedProvider,
  MusicReviewDraft,
  MusicReviewDraftReference,
} from '@/lib/music-review/types'

type NewReviewFormMode = 'create' | 'edit'

type NewReviewFormProps = {
  mode?: NewReviewFormMode
  reviewId?: string
  initialDraft?: MusicReviewDraft
  initialPostedAt?: string
}

function createEmptyReference(): MusicReviewDraftReference {
  return {
    title: '',
    url: '',
  }
}

const defaultDraft: MusicReviewDraft = {
  artistName: '',
  albumName: '',
  releaseDate: '',
  trackName: '',
  labelName: '',
  genre: '',
  jacketUrl: '',
  embedProvider: '',
  embedUrl: '',
  body: '',
  references: [createEmptyReference()],
}

const embedProviderOptions: Array<EmbedProvider> = [
  'YouTube',
  'Bandcamp',
  'Traxsource',
  'Juno Download',
  'Beatport',
  'MixCloud',
  'SoundCloud',
]

const JACKET_MAX_SIZE = 200 * 1024 // 200KB
const JACKET_ACCEPTED_TYPES = ['image/webp', 'image/avif', 'image/jpeg', 'image/png']
const JACKET_MAX_DIMENSION = 600

function normalizeDraftInput(draft?: MusicReviewDraft): MusicReviewDraft {
  if (!draft) {
    return {
      ...defaultDraft,
      references: [createEmptyReference()],
    }
  }

  return {
    artistName: draft.artistName,
    albumName: draft.albumName,
    releaseDate: draft.releaseDate ?? '',
    trackName: draft.trackName,
    labelName: draft.labelName,
    genre: draft.genre,
    jacketUrl: draft.jacketUrl ?? '',
    embedProvider: draft.embedProvider,
    embedUrl: draft.embedUrl,
    body: draft.body,
    references: draft.references.length > 0
      ? draft.references.map((reference) => ({
        title: reference.title,
        url: reference.url,
      }))
      : [createEmptyReference()],
  }
}

async function compressImageToWebp(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img
      if (width > JACKET_MAX_DIMENSION || height > JACKET_MAX_DIMENSION) {
        const ratio = Math.min(JACKET_MAX_DIMENSION / width, JACKET_MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }

          if (blob.size > JACKET_MAX_SIZE) {
            canvas.toBlob(
              (lowQBlob) => {
                if (!lowQBlob || lowQBlob.size > JACKET_MAX_SIZE) {
                  reject(new Error('Image is too large even after compression. Please use a smaller image.'))
                  return
                }
                resolve(lowQBlob)
              },
              'image/webp',
              0.6,
            )
            return
          }

          resolve(blob)
        },
        'image/webp',
        0.85,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}

export default function NewReviewForm({
  mode = 'create',
  reviewId,
  initialDraft: initialDraftInput,
  initialPostedAt,
}: NewReviewFormProps) {
  const formId = useId()
  const router = useRouter()
  const { session } = useMusicReviewAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<MusicReviewDraft>(() => normalizeDraftInput(initialDraftInput))
  const [isVariousArtist, setIsVariousArtist] = useState(
    () => normalizeDraftInput(initialDraftInput).artistName === 'Various',
  )
  const [isNoImage, setIsNoImage] = useState(
    () => mode === 'edit' && !normalizeDraftInput(initialDraftInput).jacketUrl,
  )
  const [jacketPreview, setJacketPreview] = useState<string>(
    () => normalizeDraftInput(initialDraftInput).jacketUrl ?? '',
  )
  const [isUploadingJacket, setIsUploadingJacket] = useState(false)
  const [jacketError, setJacketError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const validationErrors = useMemo(() => {
    const errors = validateMusicReviewDraft(draft)
    if (formError) {
      errors.form = formError
    }

    return errors
  }, [draft, formError])

  const visibleValidationErrors = hasAttemptedSubmit ? validationErrors : {}

  const onDraftChange = <K extends keyof MusicReviewDraft>(key: K, value: MusicReviewDraft[K]) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const onReferenceChange = (index: number, key: keyof MusicReviewDraftReference, value: string) => {
    setDraft((prev) => {
      const references = prev.references.map((reference, referenceIndex) => {
        if (referenceIndex !== index) {
          return reference
        }

        return {
          ...reference,
          [key]: value,
        }
      })

      return {
        ...prev,
        references,
      }
    })
  }

  const onAddReference = () => {
    setDraft((prev) => ({
      ...prev,
      references: [...prev.references, createEmptyReference()],
    }))
  }

  const onRemoveReference = (index: number) => {
    setDraft((prev) => {
      const nextReferences = prev.references.filter((_, referenceIndex) => referenceIndex !== index)

      return {
        ...prev,
        references: nextReferences.length > 0 ? nextReferences : [createEmptyReference()],
      }
    })
  }

  const onToggleVarious = (checked: boolean) => {
    setIsVariousArtist(checked)
    onDraftChange('artistName', checked ? 'Various' : '')
  }

  const uploadJacketFile = useCallback(async (file: File) => {
    setJacketError(null)

    if (!JACKET_ACCEPTED_TYPES.includes(file.type)) {
      setJacketError('Unsupported file type. Use webp, avif, jpg, or png.')
      return
    }

    setIsUploadingJacket(true)

    try {
      const compressed = await compressImageToWebp(file)

      const formData = new FormData()
      formData.append('file', compressed, 'jacket.webp')

      const response = await fetch('/api/music-review/jacket', {
        method: 'POST',
        body: formData,
      })

      const payload = (await response.json().catch(() => null)) as {
        url?: string
        message?: string
      } | null

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Failed to upload image')
      }

      if (payload?.url) {
        onDraftChange('jacketUrl', payload.url)
        setJacketPreview(payload.url)
        setIsNoImage(false)
      }
    } catch (error) {
      setJacketError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploadingJacket(false)
    }
  }, [])

  const onFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadJacketFile(file)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      uploadJacketFile(file)
    }
  }

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const onDragLeave = () => {
    setIsDragOver(false)
  }

  const onToggleNoImage = (checked: boolean) => {
    setIsNoImage(checked)
    if (checked) {
      onDraftChange('jacketUrl', '')
      setJacketPreview('')
    }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasAttemptedSubmit(true)
    setFormError(null)

    if (mode === 'edit' && !reviewId) {
      setFormError('Review ID is not specified')
      return
    }

    const errors = validateMusicReviewDraft(draft)
    if (hasReviewDraftErrors(errors)) {
      return
    }

    const activeSession = session
    const nickname = activeSession?.user.nickname?.trim()
    if (!activeSession || !nickname) {
      setFormError('Login is required to submit a review')
      return
    }

    setIsSubmitting(true)

    try {
      const endpoint = mode === 'edit' ? `/api/music-review/reviews/${reviewId}` : '/api/music-review/reviews'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actor: {
            ...buildActorFromSession(activeSession),
            nickname,
          },
          draft,
          postedAt: initialPostedAt,
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        message?: string
        review?: {
          id: string
        }
      } | null

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Failed to submit review')
      }

      router.replace('/music-review')
      router.refresh()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='form__card'>
        <form id={formId} className='form__grid' onSubmit={onSubmit} noValidate>

        {/* Jacket Image */}
        <div className='form__control'>
          <span className='form__label'>Jacket Image</span>
          <div
            className={`${styles.jacketDropZone} ${isDragOver ? styles.jacketDropZoneActive : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            {jacketPreview && !isNoImage ? (
              <img src={jacketPreview} alt='Jacket preview' className={styles.jacketPreviewImg} />
            ) : (
              <p className={styles.jacketDropText}>
                {isUploadingJacket ? 'Uploading...' : 'Drop image here or click to select'}
              </p>
            )}
            <input
              ref={fileInputRef}
              type='file'
              accept={JACKET_ACCEPTED_TYPES.join(',')}
              onChange={onFileSelect}
              disabled={isNoImage || isUploadingJacket || isSubmitting}
              className={styles.jacketFileInput}
            />
          </div>
          <span className='form__note'>
            <label>
              <input
                type='checkbox'
                checked={isNoImage}
                onChange={(event) => onToggleNoImage(event.target.checked)}
                disabled={isUploadingJacket || isSubmitting}
              />
              {' '}
              No Image
            </label>
            {' — '}Max 200KB, webp/avif/jpg/png (auto-converted to webp)
          </span>
          {jacketError ? <span className='form__error'>{jacketError}</span> : null}
        </div>

        <label className='form__control'>
          <input
            className='form__input'
            type='text'
            placeholder='Artist / Composer Name'
            value={draft.artistName}
            disabled={isVariousArtist || isSubmitting}
            onChange={(event) => onDraftChange('artistName', event.target.value)}
          />
          <span className='form__note'>
            <label>
              <input
                type='checkbox'
                checked={isVariousArtist}
                onChange={(event) => onToggleVarious(event.target.checked)}
                disabled={isSubmitting}
              />
              {' '}
              Various
            </label>
          </span>
          {visibleValidationErrors.artistName ? (
            <span className='form__error'>{visibleValidationErrors.artistName}</span>
          ) : null}
        </label>

        <label className='form__control'>
          <input
            className='form__input'
            type='text'
            placeholder='Album Name'
            value={draft.albumName}
            onChange={(event) => onDraftChange('albumName', event.target.value)}
            disabled={isSubmitting}
          />
        </label>

        <label className='form__control'>
          <input
            className='form__input'
            type='text'
            placeholder='YYYY-MM-DD'
            value={draft.releaseDate}
            onChange={(event) => onDraftChange('releaseDate', event.target.value)}
            disabled={isSubmitting}
          />
          <span className='form__note'>Release Date — YYYY, YYYY-MM, or YYYY-MM-DD</span>
          {visibleValidationErrors.releaseDate ? (
            <span className='form__error'>{visibleValidationErrors.releaseDate}</span>
          ) : null}
        </label>

        <label className='form__control'>
          <input
            className='form__input'
            type='text'
            placeholder='Track Name / Mix Name'
            value={draft.trackName}
            onChange={(event) => onDraftChange('trackName', event.target.value)}
            disabled={isSubmitting}
          />
        </label>

        <label className='form__control'>
          <input
            className='form__input'
            type='text'
            placeholder='Label Name'
            value={draft.labelName}
            onChange={(event) => onDraftChange('labelName', event.target.value)}
            disabled={isSubmitting}
          />
        </label>

        <label className='form__control'>
          <input
            className='form__input'
            type='text'
            placeholder='Genre'
            value={draft.genre}
            onChange={(event) => onDraftChange('genre', event.target.value)}
            disabled={isSubmitting}
          />
        </label>

        <label className='form__control'>
          <span className='form__label'>Choose embedded player provider</span>
          <select
            className='form__select'
            value={draft.embedProvider}
            onChange={(event) => onDraftChange('embedProvider', event.target.value as EmbedProvider | '')}
            disabled={isSubmitting}
          >
            <option value=''>Do not embed</option>
            {embedProviderOptions.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
          {visibleValidationErrors.embedProvider ? (
            <span className='form__error'>{visibleValidationErrors.embedProvider}</span>
          ) : null}
        </label>

        <label className='form__control'>
          <span className='form__label'>Put embedded player URL / iframe down</span>
          <textarea
            className='form__textarea form__textarea__compact'
            placeholder='{https://...} or {iframe}  / if you wanna do embedding a player'
            value={draft.embedUrl}
            onChange={(event) => onDraftChange('embedUrl', event.target.value)}
            disabled={isSubmitting}
          />
          <span className='form__note'>
            Supported: YouTube / Bandcamp / MixCloud / Traxsource / Juno Download / Beatport / SoundCloud（Only one iframe allowed）
          </span>
          {visibleValidationErrors.embedUrl ? <span className='form__error'>{visibleValidationErrors.embedUrl}</span> : null}
        </label>

        <label className='form__control'>
          <span className='form__label'>Review Text (within 5000 characters)</span>
          <textarea
            className='form__textarea'
            placeholder='Review text'
            value={draft.body}
            onChange={(event) => onDraftChange('body', event.target.value)}
            disabled={isSubmitting}
          />
          {visibleValidationErrors.body ? <span className='form__error'>{visibleValidationErrors.body}</span> : null}
        </label>

        <div className='form__control'>
          <span className='form__label'>Reference</span>
          <div className={styles.reviewManageList}>
            {draft.references.map((reference, index) => (
              <div key={index} className={styles.reviewManageItem}>
                <label className='form__control'>
                  <span className='form__label'>Reference Title</span>
                  <input
                    className='form__input'
                    type='text'
                    placeholder='Reference title'
                    value={reference.title}
                    onChange={(event) => onReferenceChange(index, 'title', event.target.value)}
                    disabled={isSubmitting}
                  />
                </label>

                <label className='form__control'>
                  <span className='form__label'>Reference URL</span>
                  <input
                    className='form__input'
                    type='url'
                    placeholder='https://...'
                    value={reference.url}
                    onChange={(event) => onReferenceChange(index, 'url', event.target.value)}
                    disabled={isSubmitting}
                  />
                </label>

                <div className={styles.referenceActions}>
                  <button
                    type='button'
                    className='destructive__button'
                    onClick={() => onRemoveReference(index)}
                    disabled={isSubmitting}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.referenceAddActionWrap}>
            <button
              type='button'
              className={styles.referenceAddButton}
              onClick={onAddReference}
              disabled={isSubmitting}
              aria-label='Add Reference'
              title='Add Reference'
            >
              +
            </button>
          </div>
          {visibleValidationErrors.references ? <span className='form__error'>{visibleValidationErrors.references}</span> : null}
        </div>

        {visibleValidationErrors.form ? <p className='form__error'>{visibleValidationErrors.form}</p> : null}

        </form>
      </div>

      <div className={styles.formSubmitOutside}>
        <button type='submit' form={formId} className='primary__button' disabled={isSubmitting || isUploadingJacket}>
          {isSubmitting ? mode === 'edit' ? 'Updating...' : 'Applying...' : mode === 'edit' ? 'Update' : 'Submit'}
        </button>
      </div>
    </>
  )
}
