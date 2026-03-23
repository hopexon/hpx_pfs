import type { MusicReviewDraft } from './types'
import { isHttpUrl, validateEmbedPlayerInput } from './embedValidation'

const RELEASE_DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/

export type MusicReviewDraftErrors = Partial<
  Record<
    | 'artistName'
    | 'releaseDate'
    | 'embedProvider'
    | 'embedUrl'
    | 'body'
    | 'references'
    | 'form',
    string
  >
>

export function validateMusicReviewDraft(draft: MusicReviewDraft): MusicReviewDraftErrors {
  const errors: MusicReviewDraftErrors = {}

  if (!draft.artistName.trim()) {
    errors.artistName = 'Enter the Artist Name'
  }

  if (draft.releaseDate.trim() && !RELEASE_DATE_RE.test(draft.releaseDate.trim())) {
    errors.releaseDate = 'Release Date must be in YYYY-MM-DD format (YYYY or YYYY-MM also accepted)'
  }

  const embedValidation = validateEmbedPlayerInput(draft.embedProvider, draft.embedUrl)
  if (!embedValidation.ok) {
    if (!draft.embedProvider.trim() && draft.embedUrl.trim()) {
      errors.embedProvider = embedValidation.message
    } else {
      errors.embedUrl = embedValidation.message
    }
  }

  if (!draft.body.trim()) {
    errors.body = 'Enter the review text'
  } else if (draft.body.length > 5000) {
    errors.body = 'Review text must be within 5000 characters'
  }

  const hasInvalidReference = draft.references.some((ref) => {
    const hasEither = ref.title.trim().length > 0 || ref.url.trim().length > 0
    const hasBoth = ref.title.trim().length > 0 && ref.url.trim().length > 0

    return hasEither && !hasBoth
  })

  const hasInvalidReferenceUrl = draft.references.some((ref) => {
    const title = ref.title.trim()
    const url = ref.url.trim()

    if (!title || !url) {
      return false
    }

    return !isHttpUrl(url)
  })

  if (hasInvalidReference) {
    errors.references = 'Please enter both Title and URL for the references, or leave both empty'
  } else if (hasInvalidReferenceUrl) {
    errors.references = 'Reference URL must start with http(s)'
  }

  return errors
}

export function hasReviewDraftErrors(errors: MusicReviewDraftErrors): boolean {
  return Object.keys(errors).length > 0
}
