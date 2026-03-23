import { NextResponse } from 'next/server'
import {
  getMusicReviewApi,
} from '@/lib/music-review/reviewApi'
import {
  type ReviewRequestBody,
  normalizeDraft,
  resolveDraftValidationMessage,
  requireActorNickname,
  handleApiRouteError,
} from '@/lib/music-review/reviewRouteUtils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const authorName = searchParams.get('authorName')?.trim() || undefined
  const scope = searchParams.get('scope')?.trim()
  const genre = searchParams.get('genre')?.trim() || undefined
  const keyword = searchParams.get('keyword')?.trim() || undefined
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

  const reviewApi = getMusicReviewApi()

  if (scope === 'own' && authorName) {
    const ownReviews = await reviewApi.listOwnReviews(authorName)

    return NextResponse.json({
      reviews: ownReviews,
    })
  }

  const reviews = await reviewApi.listReviews({
    authorName,
    genre,
    keyword,
    order,
  })

  return NextResponse.json({
    reviews,
  })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReviewRequestBody
    const reviewApi = getMusicReviewApi()

    const actorNickname = requireActorNickname(body)
    if (!actorNickname) {
      return NextResponse.json(
        { message: 'actor.nickname is required' },
        { status: 400 },
      )
    }

    const draft = normalizeDraft(body.draft)
    const draftValidationMessage = resolveDraftValidationMessage(draft)
    if (draftValidationMessage) {
      return NextResponse.json(
        { message: draftValidationMessage, code: 'invalid_input' },
        { status: 400 },
      )
    }

    const review = await reviewApi.createReview({
      actor: {
        authUserId: body.actor?.authUserId ?? null,
        email: body.actor?.email ?? null,
        nickname: actorNickname,
        role: body.actor?.role ?? 'member',
      },
      draft,
      postedAt: body.postedAt,
    })

    return NextResponse.json(
      { review },
      { status: 201 },
    )
  } catch (error) {
    return handleApiRouteError(error, 'POST /api/music-review/reviews')
  }
}
