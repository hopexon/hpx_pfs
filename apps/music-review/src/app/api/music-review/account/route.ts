import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

type AccountActor = {
  authUserId: string | null
  email: string | null
  nickname: string | null
  provider: 'mock' | 'supabase'
}

type AccountRequestBody = {
  actor?: {
    authUserId?: string | null
    email?: string | null
    nickname?: string
    provider?: 'mock' | 'supabase'
  }
  profile?: {
    email?: string
    nickname?: string
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function hasPrismaDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
}

function normalizeText(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeUuid(value: string | null | undefined): string | null {
  const normalized = normalizeText(value)
  if (!normalized) {
    return null
  }

  return UUID_RE.test(normalized) ? normalized : null
}

function normalizeEmail(value: string | null | undefined): string | null {
  const normalized = normalizeText(value)?.toLowerCase() ?? null
  if (!normalized || !EMAIL_RE.test(normalized)) {
    return null
  }

  return normalized
}

function parseActor(raw: AccountRequestBody['actor']): AccountActor | null {
  const authUserId = normalizeUuid(raw?.authUserId)
  const email = normalizeEmail(raw?.email)
  const nickname = normalizeText(raw?.nickname)

  if (!authUserId && !email && !nickname) {
    return null
  }

  return {
    authUserId,
    email,
    nickname,
    provider: raw?.provider === 'supabase' ? 'supabase' : 'mock',
  }
}

async function findPrismaUser(actor: AccountActor) {
  if (!hasPrismaDatabaseUrl()) {
    return null
  }

  if (actor.authUserId) {
    const byAuth = await prisma.musicReviewUser.findUnique({
      where: {
        authUserId: actor.authUserId,
      },
    })

    if (byAuth) {
      return byAuth
    }
  }

  if (actor.email) {
    const byEmail = await prisma.musicReviewUser.findUnique({
      where: {
        email: actor.email,
      },
    })

    if (byEmail) {
      return byEmail
    }
  }

  return null
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization')?.trim()
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return null
  }

  const token = header.slice(7).trim()
  return token.length > 0 ? token : null
}

async function readRequestBody(request: Request): Promise<AccountRequestBody | null> {
  try {
    return (await request.json()) as AccountRequestBody
  } catch {
    return null
  }
}

export async function PATCH(request: Request) {
  const body = await readRequestBody(request)
  const actor = parseActor(body?.actor)

  if (!actor) {
    return NextResponse.json(
      {
        message: 'actor is required',
      },
      {
        status: 400,
      },
    )
  }

  const nextEmail = normalizeEmail(body?.profile?.email)
  const nextNickname = normalizeText(body?.profile?.nickname)

  if (!nextEmail && !nextNickname) {
    return NextResponse.json(
      {
        message: 'profile.email or profile.nickname is required',
      },
      {
        status: 400,
      },
    )
  }

  if (!hasPrismaDatabaseUrl()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
    })
  }

  try {
    const targetUser = await findPrismaUser(actor)
    if (!targetUser) {
      return NextResponse.json({
        ok: true,
        skipped: true,
      })
    }

    const updated = await prisma.musicReviewUser.update({
      where: {
        id: targetUser.id,
      },
      data: {
        email: nextEmail ?? targetUser.email,
        nickname: nextNickname ?? targetUser.nickname,
      },
    })

    if (nextNickname && nextNickname !== targetUser.nickname) {
      await prisma.musicReview.updateMany({
        where: {
          userId: updated.id,
        },
        data: {
          authorName: nextNickname,
        },
      })
    }

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        {
          message: 'This email address is already in use by another account',
        },
        {
          status: 409,
        },
      )
    }

    console.error('[music-review] PATCH /api/music-review/account failed', error)

    return NextResponse.json(
      {
        message: 'Internal server error',
      },
      {
        status: 500,
      },
    )
  }
}

export async function DELETE(request: Request) {
  const body = await readRequestBody(request)
  const actor = parseActor(body?.actor)

  if (!actor) {
    return NextResponse.json(
      {
        message: 'actor is required',
      },
      {
        status: 400,
      },
    )
  }

  try {
    if (actor.provider === 'supabase') {
      if (!actor.authUserId) {
        return NextResponse.json(
          {
            message: 'authUserId is required for supabase provider',
          },
          {
            status: 400,
          },
        )
      }

      const adminClient = getSupabaseAdminClient()
      if (!adminClient) {
        return NextResponse.json(
          {
            message: 'SUPABASE_SERVICE_ROLE_KEY is not set, unable to complete account deletion',
          },
          {
            status: 409,
          },
        )
      }

      const token = getBearerToken(request)
      if (!token) {
        return NextResponse.json(
          {
            message: 'Unauthorized',
          },
          {
            status: 401,
          },
        )
      }

      const { data: userData, error: userError } = await adminClient.auth.getUser(token)
      if (userError || !userData.user) {
        return NextResponse.json(
          {
            message: 'Unauthorized',
          },
          {
            status: 401,
          },
        )
      }

      if (userData.user.id !== actor.authUserId) {
        return NextResponse.json(
          {
            message: 'Forbidden',
          },
          {
            status: 403,
          },
        )
      }

      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(actor.authUserId)
      if (deleteUserError) {
        return NextResponse.json(
          {
            message: deleteUserError.message,
          },
          {
            status: 502,
          },
        )
      }
    }

    if (hasPrismaDatabaseUrl()) {
      const targetUser = await findPrismaUser(actor)
      if (targetUser) {
        await prisma.$transaction([
          prisma.musicReview.deleteMany({
            where: {
              userId: targetUser.id,
            },
          }),
          prisma.musicReviewUser.delete({
            where: {
              id: targetUser.id,
            },
          }),
        ])
      }
    }

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    console.error('[music-review] DELETE /api/music-review/account failed', error)

    return NextResponse.json(
      {
        message: 'Internal server error',
      },
      {
        status: 500,
      },
    )
  }
}
