import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'
import { hasSupabasePublicEnv } from '@/lib/supabase/env'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { isHttpUrl, validateEmbedPlayerInput } from './embedValidation'
import { musicReviewSamples } from './mockData'
import type { MusicReviewUserRole } from './auth/types'
import type {
  EmbedProvider,
  MusicReview,
  MusicReviewDraft,
  MusicReviewReference,
  MusicReviewSearchFilters,
} from './types'

export type MusicReviewDataProvider = 'mock' | 'supabase' | 'prisma'

export type MusicReviewActor = {
  authUserId?: string | null
  email?: string | null
  nickname: string
  role?: MusicReviewUserRole
}

export type MusicReviewCreateInput = {
  actor: MusicReviewActor
  draft: MusicReviewDraft
  postedAt?: string
}

export type MusicReviewUpdateInput = MusicReviewCreateInput & {
  id: string
}

export type MusicReviewApi = {
  listReviews: (filters?: MusicReviewSearchFilters) => Promise<MusicReview[]>
  listOwnReviews: (authorName: string) => Promise<MusicReview[]>
  getReviewById: (id: string) => Promise<MusicReview | null>
  createReview: (input: MusicReviewCreateInput) => Promise<MusicReview>
  updateReview: (input: MusicReviewUpdateInput) => Promise<MusicReview | null>
  deleteReview: (id: string, actor: MusicReviewActor) => Promise<boolean>
}

export type MusicReviewApiErrorCode = 'invalid_input' | 'forbidden' | 'read_only_provider'

export class MusicReviewApiError extends Error {
  code: MusicReviewApiErrorCode

  constructor(code: MusicReviewApiErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'MusicReviewApiError'
  }
}

const SUPABASE_REVIEW_TABLE = 'music_reviews'
const SUPABASE_REFERENCE_TABLE = 'music_review_references'
const SUPABASE_REVIEW_COLUMNS = 'id, posted_at, author_name, artist_name, album_name, release_date, track_name, label_name, genre, jacket_url, embed_provider, embed_url, body'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const embedProviders: EmbedProvider[] = [
  'YouTube',
  'Bandcamp',
  'Traxsource',
  'Juno Download',
  'Beatport',
  'MixCloud',
  'SoundCloud',
]

type SupabaseReviewRow = {
  id: string
  posted_at: string
  author_name: string
  artist_name: string
  album_name: string | null
  release_date: string | null
  track_name: string | null
  label_name: string | null
  genre: string | null
  jacket_url: string | null
  embed_provider: string | null
  embed_url: string | null
  body: string
}

type SupabaseReferenceRow = {
  id: string
  review_id: string
  title: string
  url: string
  sort_order: number | null
}

type PrismaReviewWithRelations = Prisma.MusicReviewGetPayload<{
  include: {
    user: true
    references: true
  }
}>

type NormalizedReviewDraft = {
  artistName: string
  albumName: string | null
  releaseDate: string | null
  trackName: string | null
  labelName: string | null
  genre: string | null
  jacketUrl: string | null
  embedProvider: EmbedProvider | null
  embedUrl: string | null
  body: string
  references: Array<{
    title: string
    url: string
    sortOrder: number
  }>
}

let mockReviewStore: MusicReview[] = musicReviewSamples.map((review) => ({
  ...review,
  references: review.references.map((reference) => ({
    ...reference,
  })),
}))

function hasPrismaDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
}

function isEmbedProvider(value: string): value is EmbedProvider {
  return embedProviders.includes(value as EmbedProvider)
}

function normalizePostedAt(value: string): string {
  const trimmed = value.trim()
  return trimmed.includes('T') ? trimmed.slice(0, 10) : trimmed
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function normalizeNullableText(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeUuid(value: string | null | undefined): string | null {
  const trimmed = normalizeNullableText(value)
  if (!trimmed) {
    return null
  }

  return UUID_RE.test(trimmed) ? trimmed : null
}

function resolvePostedAtDate(raw?: string): Date {
  const candidate = raw?.trim() ? new Date(raw) : new Date()

  if (Number.isNaN(candidate.getTime())) {
    const today = new Date()
    return new Date(today.toISOString().slice(0, 10))
  }

  return new Date(candidate.toISOString().slice(0, 10))
}

function resolveActorNickname(actor: MusicReviewActor): string {
  const nickname = actor.nickname.trim()
  if (nickname.length > 0) {
    return nickname
  }

  const email = normalizeNullableText(actor.email)
  if (email) {
    const byEmail = email.split('@')[0]
    if (byEmail) {
      return byEmail
    }
  }

  return 'user'
}

function resolveActorEmail(actor: MusicReviewActor, nickname: string): string {
  const email = normalizeNullableText(actor.email)?.toLowerCase()
  if (email && EMAIL_RE.test(email)) {
    return email
  }

  const localPart = nickname
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${localPart || 'user'}@music-review.local`
}

function normalizeDraftForStorage(draft: MusicReviewDraft): NormalizedReviewDraft {
  const requestedEmbedProvider = draft.embedProvider.trim()
  if (requestedEmbedProvider && !isEmbedProvider(requestedEmbedProvider)) {
    throw new MusicReviewApiError('invalid_input', 'Unsupported Embedded Player Provider')
  }

  const embedProvider = requestedEmbedProvider as EmbedProvider | ''
  const embedValidation = validateEmbedPlayerInput(embedProvider, draft.embedUrl)
  if (!embedValidation.ok) {
    throw new MusicReviewApiError('invalid_input', embedValidation.message)
  }

  const normalizedEmbedUrl = normalizeNullableText(embedValidation.normalizedUrl)
  const normalizedEmbedProvider = embedProvider && normalizedEmbedUrl ? (embedProvider as EmbedProvider) : null

  return {
    artistName: draft.artistName.trim(),
    albumName: normalizeNullableText(draft.albumName),
    releaseDate: normalizeNullableText(draft.releaseDate),
    trackName: normalizeNullableText(draft.trackName),
    labelName: normalizeNullableText(draft.labelName),
    genre: normalizeNullableText(draft.genre),
    jacketUrl: normalizeNullableText(draft.jacketUrl),
    embedProvider: normalizedEmbedProvider,
    embedUrl: normalizedEmbedUrl,
    body: draft.body.trim(),
    references: draft.references
      .map((reference) => ({
        title: reference.title.trim(),
        url: reference.url.trim(),
      }))
      .filter((reference) => reference.title.length > 0 && reference.url.length > 0 && isHttpUrl(reference.url))
      .map((reference, index) => ({
        ...reference,
        sortOrder: index,
      })),
  }
}

function assertNormalizedDraft(normalized: NormalizedReviewDraft): void {
  if (!normalized.artistName) {
    throw new MusicReviewApiError('invalid_input', 'Enter the Artist Name')
  }

  if (!normalized.body) {
    throw new MusicReviewApiError('invalid_input', 'Enter the review text')
  }

  if (normalized.body.length > 5000) {
    throw new MusicReviewApiError('invalid_input', 'Review text must be within 5000 characters')
  }

  if (normalized.embedUrl && !normalized.embedProvider) {
    throw new MusicReviewApiError('invalid_input', 'Select an Embedded Player Provider for the provided URL')
  }

  if (!normalized.embedUrl && normalized.embedProvider) {
    throw new MusicReviewApiError('invalid_input', 'Enter the Embedded Player URL')
  }
}

function mapReferences(rows: SupabaseReferenceRow[]): Map<string, MusicReviewReference[]> {
  const byReviewId = new Map<string, MusicReviewReference[]>()

  rows.forEach((row) => {
    const current = byReviewId.get(row.review_id) ?? []
    current.push({
      id: row.id,
      title: row.title,
      url: row.url,
    })
    byReviewId.set(row.review_id, current)
  })

  return byReviewId
}

function mapSupabaseReviewRow(row: SupabaseReviewRow, references: MusicReviewReference[]): MusicReview {
  const genre = normalizeNullableText(row.genre)
  const embedUrl = normalizeNullableText(row.embed_url)
  const embedProvider = embedUrl && row.embed_provider && isEmbedProvider(row.embed_provider)
    ? row.embed_provider
    : null

  return {
    id: row.id,
    postedAt: normalizePostedAt(row.posted_at),
    authorName: row.author_name,
    artistName: row.artist_name,
    albumName: row.album_name,
    releaseDate: normalizeNullableText(row.release_date),
    trackName: row.track_name,
    labelName: row.label_name,
    genre,
    jacketUrl: normalizeNullableText(row.jacket_url),
    embedProvider,
    embedUrl,
    body: row.body,
    references,
  }
}

function mapPrismaReviewRow(row: PrismaReviewWithRelations): MusicReview {
  const genre = normalizeNullableText(row.genre)
  const embedUrl = normalizeNullableText(row.embedUrl)
  const embedProvider = embedUrl && row.embedProvider && isEmbedProvider(row.embedProvider)
    ? row.embedProvider
    : null
  const sortedReferences = [...row.references].sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    id: row.id,
    postedAt: toDateString(row.postedAt),
    authorName: row.user?.nickname ?? row.authorName,
    artistName: row.artistName,
    albumName: row.albumName,
    releaseDate: normalizeNullableText(row.releaseDate),
    trackName: row.trackName,
    labelName: row.labelName,
    genre,
    jacketUrl: normalizeNullableText(row.jacketUrl),
    embedProvider,
    embedUrl,
    body: row.body,
    references: sortedReferences.map((reference) => ({
      id: reference.id,
      title: reference.title,
      url: reference.url,
    })),
  }
}

function toOrLikePattern(keyword: string): string {
  return keyword.trim().replace(/[%_]/g, '')
}

function filterReviews(source: MusicReview[], filters?: MusicReviewSearchFilters): MusicReview[] {
  if (!filters) {
    return source
  }

  const keyword = filters.keyword?.trim().toLowerCase() ?? ''

  return source
    .filter((review) => {
      if (filters.authorName && !review.authorName.toLowerCase().includes(filters.authorName.toLowerCase())) {
        return false
      }

      if (filters.genre && (!review.genre || !review.genre.toLowerCase().includes(filters.genre.toLowerCase()))) {
        return false
      }

      if (keyword) {
        const target = [review.artistName, review.albumName, review.trackName, review.labelName]
          .filter((value): value is string => Boolean(value))
          .join(' ')
          .toLowerCase()

        return target.includes(keyword)
      }

      return true
    })
    .sort((a, b) => {
      if (filters.order === 'asc') {
        return a.postedAt.localeCompare(b.postedAt)
      }

      return b.postedAt.localeCompare(a.postedAt)
    })
}

function toMockReferenceId(reviewId: string, index: number): string {
  return `ref-${reviewId}-${index + 1}`
}

function canEditReview(review: MusicReview, actor: MusicReviewActor): boolean {
  const nickname = resolveActorNickname(actor)
  if (review.authorName === nickname) {
    return true
  }

  const emailUserPart = normalizeNullableText(actor.email)?.split('@')[0] ?? ''
  return emailUserPart.length > 0 && review.authorName === emailUserPart
}

async function fetchSupabaseReferences(reviewIds: string[]): Promise<Map<string, MusicReviewReference[]>> {
  if (reviewIds.length === 0) {
    return new Map()
  }

  const client = getSupabaseServerClient()
  if (!client) {
    return new Map()
  }

  const { data, error } = await client
    .from(SUPABASE_REFERENCE_TABLE)
    .select('id, review_id, title, url, sort_order')
    .in('review_id', reviewIds)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[music-review] failed to fetch references from Supabase', error.message)
    return new Map()
  }

  return mapReferences((data ?? []) as SupabaseReferenceRow[])
}

async function fetchSupabaseReviews(filters?: MusicReviewSearchFilters): Promise<MusicReview[] | undefined> {
  const client = getSupabaseServerClient()
  if (!client) {
    return undefined
  }

  let query = client
    .from(SUPABASE_REVIEW_TABLE)
    .select(SUPABASE_REVIEW_COLUMNS)
    .order('posted_at', { ascending: filters?.order === 'asc' })

  if (filters?.authorName?.trim()) {
    query = query.ilike('author_name', `%${filters.authorName.trim()}%`)
  }

  if (filters?.genre) {
    query = query.ilike('genre', `%${toOrLikePattern(filters.genre)}%`)
  }

  if (filters?.keyword?.trim()) {
    const keyword = toOrLikePattern(filters.keyword)
    query = query.or(
      `artist_name.ilike.%${keyword}%,album_name.ilike.%${keyword}%,track_name.ilike.%${keyword}%,label_name.ilike.%${keyword}%`,
    )
  }

  const { data, error } = await query
  if (error) {
    console.error('[music-review] failed to fetch reviews from Supabase', error.message)
    return undefined
  }

  const rows = (data ?? []) as SupabaseReviewRow[]
  const referencesByReviewId = await fetchSupabaseReferences(rows.map((row) => row.id))

  return rows.map((row) => {
    const references = referencesByReviewId.get(row.id) ?? []
    return mapSupabaseReviewRow(row, references)
  })
}

async function fetchSupabaseReviewById(id: string): Promise<MusicReview | null | undefined> {
  const client = getSupabaseServerClient()
  if (!client) {
    return undefined
  }

  const { data, error } = await client
    .from(SUPABASE_REVIEW_TABLE)
    .select(SUPABASE_REVIEW_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[music-review] failed to fetch review detail from Supabase', error.message)
    return undefined
  }

  if (!data) {
    return null
  }

  const referencesByReviewId = await fetchSupabaseReferences([id])
  return mapSupabaseReviewRow(data as SupabaseReviewRow, referencesByReviewId.get(id) ?? [])
}

function buildPrismaWhere(filters?: MusicReviewSearchFilters): Prisma.MusicReviewWhereInput {
  if (!filters) {
    return {}
  }

  const conditions: Prisma.MusicReviewWhereInput[] = []
  const authorName = filters.authorName?.trim()
  const keyword = filters.keyword?.trim()

  if (authorName) {
    conditions.push({
      OR: [
        {
          authorName: {
            contains: authorName,
            mode: 'insensitive',
          },
        },
        {
          user: {
            is: {
              nickname: {
                contains: authorName,
                mode: 'insensitive',
              },
            },
          },
        },
      ],
    })
  }

  if (filters.genre) {
    conditions.push({
      genre: {
        contains: filters.genre,
        mode: 'insensitive',
      },
    })
  }

  if (keyword) {
    conditions.push({
      OR: [
        {
          artistName: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          albumName: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          trackName: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          labelName: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
      ],
    })
  }

  if (conditions.length === 0) {
    return {}
  }

  return {
    AND: conditions,
  }
}

async function fetchPrismaReviews(filters?: MusicReviewSearchFilters): Promise<MusicReview[] | undefined> {
  if (!hasPrismaDatabaseUrl()) {
    return undefined
  }

  try {
    const rows = await prisma.musicReview.findMany({
      where: buildPrismaWhere(filters),
      include: {
        user: true,
        references: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: [
        {
          postedAt: filters?.order === 'asc' ? 'asc' : 'desc',
        },
        {
          createdAt: filters?.order === 'asc' ? 'asc' : 'desc',
        },
      ],
    })

    return rows.map((row) => mapPrismaReviewRow(row))
  } catch (error) {
    console.error('[music-review] failed to fetch reviews with Prisma', error)
    return undefined
  }
}

async function fetchPrismaOwnReviews(authorName: string): Promise<MusicReview[] | undefined> {
  if (!hasPrismaDatabaseUrl()) {
    return undefined
  }

  const target = authorName.trim()
  if (!target) {
    return []
  }

  try {
    const rows = await prisma.musicReview.findMany({
      where: {
        OR: [
          {
            authorName: {
              equals: target,
              mode: 'insensitive',
            },
          },
          {
            user: {
              is: {
                nickname: {
                  equals: target,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      },
      include: {
        user: true,
        references: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: [
        {
          postedAt: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    })

    return rows.map((row) => mapPrismaReviewRow(row))
  } catch (error) {
    console.error('[music-review] failed to fetch own reviews with Prisma', error)
    return undefined
  }
}

async function fetchPrismaReviewById(id: string): Promise<MusicReview | null | undefined> {
  if (!hasPrismaDatabaseUrl()) {
    return undefined
  }

  try {
    const row = await prisma.musicReview.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        references: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    if (!row) {
      return null
    }

    return mapPrismaReviewRow(row)
  } catch (error) {
    console.error('[music-review] failed to fetch review detail with Prisma', error)
    return undefined
  }
}

async function ensurePrismaUser(actor: MusicReviewActor) {
  const nickname = resolveActorNickname(actor)
  const email = resolveActorEmail(actor, nickname)
  const authUserId = normalizeUuid(actor.authUserId)

  if (authUserId) {
    const userByAuth = await prisma.musicReviewUser.findUnique({
      where: {
        authUserId,
      },
    })

    if (userByAuth) {
      return prisma.musicReviewUser.update({
        where: {
          id: userByAuth.id,
        },
        data: {
          email,
          nickname,
          role: actor.role ?? userByAuth.role,
        },
      })
    }
  }

  const userByEmail = await prisma.musicReviewUser.findUnique({
    where: {
      email,
    },
  })

  if (userByEmail) {
    return prisma.musicReviewUser.update({
      where: {
        id: userByEmail.id,
      },
      data: {
        nickname,
        role: actor.role ?? userByEmail.role,
        authUserId: userByEmail.authUserId ?? authUserId,
      },
    })
  }

  return prisma.musicReviewUser.create({
    data: {
      email,
      nickname,
      role: actor.role ?? 'member',
      authUserId,
    },
  })
}

function isPrismaReviewOwner(row: PrismaReviewWithRelations, actor: MusicReviewActor): boolean {
  const authUserId = normalizeUuid(actor.authUserId)
  if (authUserId && row.user?.authUserId === authUserId) {
    return true
  }

  const email = normalizeNullableText(actor.email)?.toLowerCase()
  if (email && row.user?.email.toLowerCase() === email) {
    return true
  }

  return row.authorName === resolveActorNickname(actor)
}

async function createPrismaReview(input: MusicReviewCreateInput): Promise<MusicReview | undefined> {
  if (!hasPrismaDatabaseUrl()) {
    return undefined
  }

  const normalized = normalizeDraftForStorage(input.draft)
  assertNormalizedDraft(normalized)

  const actorUser = await ensurePrismaUser(input.actor)

  const created = await prisma.musicReview.create({
    data: {
      userId: actorUser.id,
      postedAt: resolvePostedAtDate(input.postedAt),
      authorName: actorUser.nickname,
      artistName: normalized.artistName,
      albumName: normalized.albumName,
      releaseDate: normalized.releaseDate,
      trackName: normalized.trackName,
      labelName: normalized.labelName,
      genre: normalized.genre,
      jacketUrl: normalized.jacketUrl,
      embedProvider: normalized.embedProvider,
      embedUrl: normalized.embedUrl,
      body: normalized.body,
      references: {
        create: normalized.references,
      },
    },
    include: {
      user: true,
      references: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  })

  return mapPrismaReviewRow(created)
}

async function updatePrismaReview(input: MusicReviewUpdateInput): Promise<MusicReview | null | undefined> {
  if (!hasPrismaDatabaseUrl()) {
    return undefined
  }

  const existing = await prisma.musicReview.findUnique({
    where: {
      id: input.id,
    },
    include: {
      user: true,
      references: true,
    },
  })

  if (!existing) {
    return null
  }

  if (!isPrismaReviewOwner(existing, input.actor)) {
    throw new MusicReviewApiError('forbidden', 'You do not have permission to edit this review')
  }

  const normalized = normalizeDraftForStorage(input.draft)
  assertNormalizedDraft(normalized)

  const actorUser = await ensurePrismaUser(input.actor)

  const updated = await prisma.musicReview.update({
    where: {
      id: input.id,
    },
    data: {
      userId: actorUser.id,
      postedAt: input.postedAt ? resolvePostedAtDate(input.postedAt) : existing.postedAt,
      authorName: actorUser.nickname,
      artistName: normalized.artistName,
      albumName: normalized.albumName,
      releaseDate: normalized.releaseDate,
      trackName: normalized.trackName,
      labelName: normalized.labelName,
      genre: normalized.genre,
      jacketUrl: normalized.jacketUrl,
      embedProvider: normalized.embedProvider,
      embedUrl: normalized.embedUrl,
      body: normalized.body,
      references: {
        deleteMany: {},
        create: normalized.references,
      },
    },
    include: {
      user: true,
      references: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  })

  return mapPrismaReviewRow(updated)
}

async function deletePrismaReview(id: string, actor: MusicReviewActor): Promise<boolean | undefined> {
  if (!hasPrismaDatabaseUrl()) {
    return undefined
  }

  const existing = await prisma.musicReview.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      references: true,
    },
  })

  if (!existing) {
    return false
  }

  if (!isPrismaReviewOwner(existing, actor)) {
    throw new MusicReviewApiError('forbidden', 'You do not have permission to delete this review')
  }

  await prisma.musicReview.delete({
    where: {
      id,
    },
  })

  return true
}

function createReadOnlyProviderError(provider: MusicReviewDataProvider): MusicReviewApiError {
  return new MusicReviewApiError(
    'read_only_provider',
    `The current data provider (${provider}) does not support write operations.`,
  )
}

export const mockMusicReviewApi: MusicReviewApi = {
  listReviews: async (filters) => {
    return filterReviews(mockReviewStore, filters)
  },

  listOwnReviews: async (authorName) => {
    const trimmed = authorName.trim()
    if (!trimmed) {
      return []
    }

    return mockReviewStore.filter((review) => review.authorName === trimmed)
  },

  getReviewById: async (id) => {
    return mockReviewStore.find((review) => review.id === id) ?? null
  },

  createReview: async (input) => {
    const normalized = normalizeDraftForStorage(input.draft)
    assertNormalizedDraft(normalized)

    const id = `mr-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    const authorName = resolveActorNickname(input.actor)

    const nextReview: MusicReview = {
      id,
      postedAt: toDateString(resolvePostedAtDate(input.postedAt)),
      authorName,
      artistName: normalized.artistName,
      albumName: normalized.albumName,
      releaseDate: normalized.releaseDate,
      trackName: normalized.trackName,
      labelName: normalized.labelName,
      genre: normalized.genre,
      jacketUrl: normalized.jacketUrl,
      embedProvider: normalized.embedProvider,
      embedUrl: normalized.embedUrl,
      body: normalized.body,
      references: normalized.references.map((reference, index) => ({
        id: toMockReferenceId(id, index),
        title: reference.title,
        url: reference.url,
      })),
    }

    mockReviewStore = [nextReview, ...mockReviewStore]
    return nextReview
  },

  updateReview: async (input) => {
    const targetIndex = mockReviewStore.findIndex((review) => review.id === input.id)
    if (targetIndex < 0) {
      return null
    }

    const targetReview = mockReviewStore[targetIndex]
    if (!canEditReview(targetReview, input.actor)) {
      throw new MusicReviewApiError('forbidden', 'You do not have permission to edit this review')
    }

    const normalized = normalizeDraftForStorage(input.draft)
    assertNormalizedDraft(normalized)

    const nextReview: MusicReview = {
      ...targetReview,
      postedAt: input.postedAt ? toDateString(resolvePostedAtDate(input.postedAt)) : targetReview.postedAt,
      authorName: resolveActorNickname(input.actor),
      artistName: normalized.artistName,
      albumName: normalized.albumName,
      releaseDate: normalized.releaseDate,
      trackName: normalized.trackName,
      labelName: normalized.labelName,
      genre: normalized.genre,
      embedProvider: normalized.embedProvider,
      embedUrl: normalized.embedUrl,
      body: normalized.body,
      references: normalized.references.map((reference, index) => ({
        id: toMockReferenceId(targetReview.id, index),
        title: reference.title,
        url: reference.url,
      })),
    }

    mockReviewStore = [
      ...mockReviewStore.slice(0, targetIndex),
      nextReview,
      ...mockReviewStore.slice(targetIndex + 1),
    ]

    return nextReview
  },

  deleteReview: async (id, actor) => {
    const target = mockReviewStore.find((review) => review.id === id)
    if (!target) {
      return false
    }

    if (!canEditReview(target, actor)) {
      throw new MusicReviewApiError('forbidden', 'You do not have permission to delete this review')
    }

    mockReviewStore = mockReviewStore.filter((review) => review.id !== id)
    return true
  },
}

function createSupabaseMusicReviewApi(): MusicReviewApi {
  return {
    listReviews: async (filters) => {
      const reviews = await fetchSupabaseReviews(filters)
      if (reviews !== undefined) {
        return reviews
      }

      return mockMusicReviewApi.listReviews(filters)
    },

    listOwnReviews: async (authorName) => {
      const reviews = await fetchSupabaseReviews({
        authorName,
        order: 'desc',
      })

      if (reviews !== undefined) {
        return reviews
      }

      return mockMusicReviewApi.listOwnReviews(authorName)
    },

    getReviewById: async (id) => {
      const review = await fetchSupabaseReviewById(id)
      if (review !== undefined) {
        return review
      }

      return mockMusicReviewApi.getReviewById(id)
    },

    createReview: async () => {
      throw createReadOnlyProviderError('supabase')
    },

    updateReview: async () => {
      throw createReadOnlyProviderError('supabase')
    },

    deleteReview: async () => {
      throw createReadOnlyProviderError('supabase')
    },
  }
}

function createPrismaMusicReviewApi(): MusicReviewApi {
  return {
    listReviews: async (filters) => {
      const prismaReviews = await fetchPrismaReviews(filters)
      if (prismaReviews !== undefined) {
        return prismaReviews
      }

      const supabaseReviews = await fetchSupabaseReviews(filters)
      if (supabaseReviews !== undefined) {
        return supabaseReviews
      }

      return mockMusicReviewApi.listReviews(filters)
    },

    listOwnReviews: async (authorName) => {
      const prismaReviews = await fetchPrismaOwnReviews(authorName)
      if (prismaReviews !== undefined) {
        return prismaReviews
      }

      const supabaseReviews = await fetchSupabaseReviews({
        authorName,
        order: 'desc',
      })

      if (supabaseReviews !== undefined) {
        return supabaseReviews
      }

      return mockMusicReviewApi.listOwnReviews(authorName)
    },

    getReviewById: async (id) => {
      const prismaReview = await fetchPrismaReviewById(id)
      if (prismaReview !== undefined) {
        return prismaReview
      }

      const supabaseReview = await fetchSupabaseReviewById(id)
      if (supabaseReview !== undefined) {
        return supabaseReview
      }

      return mockMusicReviewApi.getReviewById(id)
    },

    createReview: async (input) => {
      const review = await createPrismaReview(input)
      if (review === undefined) {
        throw createReadOnlyProviderError('prisma')
      }

      return review
    },

    updateReview: async (input) => {
      const review = await updatePrismaReview(input)
      if (review === undefined) {
        throw createReadOnlyProviderError('prisma')
      }

      return review
    },

    deleteReview: async (id, actor) => {
      const deleted = await deletePrismaReview(id, actor)
      if (deleted === undefined) {
        throw createReadOnlyProviderError('prisma')
      }

      return deleted
    },
  }
}

let activeApi: MusicReviewApi | null = null
let activeProvider: MusicReviewDataProvider | null = null

export function getMusicReviewApi(): MusicReviewApi {
  if (activeApi) {
    return activeApi
  }

  const shouldUsePrisma = hasPrismaDatabaseUrl()
  const shouldUseSupabase = !shouldUsePrisma && hasSupabasePublicEnv()

  activeProvider = shouldUsePrisma ? 'prisma' : shouldUseSupabase ? 'supabase' : 'mock'
  activeApi = shouldUsePrisma
    ? createPrismaMusicReviewApi()
    : shouldUseSupabase
      ? createSupabaseMusicReviewApi()
      : mockMusicReviewApi

  return activeApi
}

export function getMusicReviewDataProvider(): MusicReviewDataProvider {
  if (!activeProvider) {
    getMusicReviewApi()
  }

  return activeProvider ?? 'mock'
}
