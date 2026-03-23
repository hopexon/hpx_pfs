export type EmbedProvider =
  | 'YouTube'
  | 'Bandcamp'
  | 'Traxsource'
  | 'Juno Download'
  | 'Beatport'
  | 'MixCloud'
  | 'SoundCloud'

export type MusicReviewReference = {
  id: string
  title: string
  url: string
}

export type MusicReview = {
  id: string
  postedAt: string
  authorName: string
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
  references: MusicReviewReference[]
}

export type MusicReviewDraftReference = {
  title: string
  url: string
}

export type MusicReviewDraft = {
  artistName: string
  albumName: string
  releaseDate: string
  trackName: string
  labelName: string
  genre: string
  jacketUrl: string
  embedProvider: EmbedProvider | ''
  embedUrl: string
  body: string
  references: MusicReviewDraftReference[]
}

export type MusicReviewSearchFilters = {
  authorName?: string
  genre?: string
  keyword?: string
  order?: 'asc' | 'desc'
}
