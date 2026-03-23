import { NextResponse } from 'next/server'
import {
  MusicReviewApiError,
} from '@/lib/music-review/reviewApi'
import {
  hasReviewDraftErrors,
  validateMusicReviewDraft,
} from '@/lib/music-review/reviewValidation'
import type {
  EmbedProvider,
  MusicReviewDraft,
  MusicReviewDraftReference,
} from '@/lib/music-review/types'

export type ReviewRequestBody = {
  actor?: {
    authUserId?: string | null
    email?: string | null
    nickname?: string
    role?: 'guest' | 'member'
  }
  draft?: {
    artistName?: string
    albumName?: string
    releaseDate?: string
    trackName?: string
    labelName?: string
    genre?: string
    jacketUrl?: string
    embedProvider?: EmbedProvider | ''
    embedUrl?: string
    body?: string
    references?: Array<{
      title?: string
      url?: string
    }>
  }
  postedAt?: string
}

export function normalizeDraft(body?: ReviewRequestBody['draft']): MusicReviewDraft {
  const references = Array.isArray(body?.references)
    ? body.references
      .map((reference) => ({
        title: reference?.title?.trim() ?? '',
        url: reference?.url?.trim() ?? '',
      }))
      .filter((reference) => reference.title.length > 0 || reference.url.length > 0)
    : []

  return {
    artistName: body?.artistName?.trim() ?? '',
    albumName: body?.albumName?.trim() ?? '',
    releaseDate: body?.releaseDate?.trim() ?? '',
    trackName: body?.trackName?.trim() ?? '',
    labelName: body?.labelName?.trim() ?? '',
    jacketUrl: body?.jacketUrl?.trim() ?? '',
    genre: body?.genre ?? '',
    embedProvider: body?.embedProvider ?? '',
    embedUrl: body?.embedUrl?.trim() ?? '',
    body: body?.body ?? '',
    references: references as MusicReviewDraftReference[],
  }
}

export function resolveDraftValidationMessage(draft: MusicReviewDraft): string | null {
  const errors = validateMusicReviewDraft(draft)
  if (!hasReviewDraftErrors(errors)) {
    return null
  }

  return errors.artistName
    ?? errors.embedProvider
    ?? errors.embedUrl
    ?? errors.body
    ?? errors.references
    ?? errors.form
    ?? 'Invalid input'
}

export function requireActorNickname(body: ReviewRequestBody): string | null {
  return body.actor?.nickname?.trim() || null
}

export function handleApiRouteError(error: unknown, label: string): NextResponse {
  if (error instanceof MusicReviewApiError) {
    const status = error.code === 'forbidden' ? 403 : error.code === 'invalid_input' ? 400 : 409
    return NextResponse.json(
      { message: error.message, code: error.code },
      { status },
    )
  }

  console.error(`[music-review] ${label} failed`, error)

  return NextResponse.json(
    { message: 'Internal server error' },
    { status: 500 },
  )
}
