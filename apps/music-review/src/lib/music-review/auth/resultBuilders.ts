import type {
  MusicReviewAuthErrors,
  MusicReviewAuthResult,
  MusicReviewAuthActionResult,
  MusicReviewSession,
} from './types'

export function failure(errors: MusicReviewAuthErrors): MusicReviewAuthResult {
  return { ok: false, errors }
}

export function success(session: MusicReviewSession): MusicReviewAuthResult {
  return { ok: true, session }
}

export function actionFailure(errors: MusicReviewAuthErrors): MusicReviewAuthActionResult {
  return { ok: false, errors }
}

export function actionSuccess(message: string, session?: MusicReviewSession | null): MusicReviewAuthActionResult {
  return { ok: true, message, session }
}
