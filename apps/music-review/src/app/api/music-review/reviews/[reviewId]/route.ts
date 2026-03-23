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

type Params = {
  params: Promise<{
    reviewId: string
  }>
}

export async function GET(_request: Request, { params }: Params) {
  const { reviewId } = await params
  const reviewApi = getMusicReviewApi()
  const review = await reviewApi.getReviewById(reviewId)

  if (!review) {
    return NextResponse.json(
      {
        message: 'Review not found',
      },
      {
        status: 404,
      },
    )
  }

  return NextResponse.json({
    review,
  })
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { reviewId } = await params
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

    const review = await reviewApi.updateReview({
      id: reviewId,
      actor: {
        authUserId: body.actor?.authUserId ?? null,
        email: body.actor?.email ?? null,
        nickname: actorNickname,
        role: body.actor?.role ?? 'member',
      },
      draft,
      postedAt: body.postedAt,
    })

    if (!review) {
      return NextResponse.json(
        { message: 'Review not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ review })
  } catch (error) {
    return handleApiRouteError(error, 'PUT /api/music-review/reviews/[reviewId]')
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { reviewId } = await params
    const body = (await request.json()) as ReviewRequestBody
    const reviewApi = getMusicReviewApi()

    const actorNickname = requireActorNickname(body)
    if (!actorNickname) {
      return NextResponse.json(
        { message: 'actor.nickname is required' },
        { status: 400 },
      )
    }

    const deleted = await reviewApi.deleteReview(reviewId, {
      authUserId: body.actor?.authUserId ?? null,
      email: body.actor?.email ?? null,
      nickname: actorNickname,
      role: body.actor?.role ?? 'member',
    })

    if (!deleted) {
      return NextResponse.json(
        { message: 'Review not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiRouteError(error, 'DELETE /api/music-review/reviews/[reviewId]')
  }
}
