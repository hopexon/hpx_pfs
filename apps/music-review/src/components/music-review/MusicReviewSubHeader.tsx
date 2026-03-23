'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition, type FormEvent } from 'react'
import styles from '@/app/music-review/music-review.module.css'

type MusicReviewSubHeaderFilters = {
  authorName: string
  genre: string
  keyword: string
}

type Props = {
  initialFilters?: MusicReviewSubHeaderFilters
}

const defaultFilters: MusicReviewSubHeaderFilters = {
  authorName: '',
  genre: '',
  keyword: '',
}

const mobileLayoutQuery = '(max-width: 767px)'
const reviewSearchFormId = 'music-review-search-form'

function toSearchQuery(filters: MusicReviewSubHeaderFilters): string {
  const params = new URLSearchParams()

  const authorName = filters.authorName.trim()
  const keyword = filters.keyword.trim()
  const genre = filters.genre.trim()

  if (authorName) {
    params.set('authorName', authorName)
  }

  if (genre) {
    params.set('genre', genre)
  }

  if (keyword) {
    params.set('keyword', keyword)
  }

  return params.toString()
}

export default function MusicReviewSubHeader({ initialFilters = defaultFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [authorName, setAuthorName] = useState(initialFilters.authorName)
  const [genre, setGenre] = useState(initialFilters.genre)
  const [keyword, setKeyword] = useState(initialFilters.keyword)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    setAuthorName(initialFilters.authorName)
    setGenre(initialFilters.genre)
    setKeyword(initialFilters.keyword)
  }, [initialFilters])

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mobileLayoutQuery)

    const syncSearchPanelState = (matchesMobile: boolean) => {
      // Desktop is always expanded, mobile starts collapsed.
      setIsSearchOpen(!matchesMobile)
    }

    syncSearchPanelState(mediaQueryList.matches)

    const onLayoutChange = (event: MediaQueryListEvent) => {
      syncSearchPanelState(event.matches)
    }

    mediaQueryList.addEventListener('change', onLayoutChange)

    return () => {
      mediaQueryList.removeEventListener('change', onLayoutChange)
    }
  }, [])

  const onCommit = (nextFilters: MusicReviewSubHeaderFilters) => {
    const query = toSearchQuery(nextFilters)
    const destination = query ? `${pathname}?${query}` : pathname

    startTransition(() => {
      router.replace(destination, { scroll: false })
    })
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onCommit({
      authorName,
      genre,
      keyword,
    })
  }

  const onReset = () => {
    setAuthorName('')
    setGenre('')
    setKeyword('')
    onCommit(defaultFilters)
  }

  return (
    <section className={styles.reviewSubHeader} aria-label='Search and Filter'>
      <div className={styles.reviewAccordion}>
        <button
          type='button'
          className={styles.reviewAccordionSummary}
          aria-expanded={isSearchOpen}
          aria-controls={reviewSearchFormId}
          onClick={() => setIsSearchOpen((current) => !current)}
        >
          Search
        </button>

        <form
          id={reviewSearchFormId}
          className={`${styles.reviewSubHeaderForm} ${isSearchOpen ? styles.reviewSubHeaderFormOpen : ''}`}
          onSubmit={onSubmit}
          noValidate
        >
          <label className={styles.reviewInputWrap}>
            <span className={styles.reviewInputLabel}>Search by Author</span>
            <input
              className={styles.reviewInput}
              type='text'
              placeholder='Search by Author'
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              disabled={isPending}
            />
          </label>

          <label className={styles.reviewInputWrap}>
            <span className={styles.reviewInputLabel}>Genre</span>
            <input
              className={styles.reviewInput}
              type='text'
              placeholder='Genre'
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              disabled={isPending}
            />
          </label>

          <label className={styles.reviewInputWrap}>
            <span className={styles.reviewInputLabel}>Keyword Search</span>
            <input
              className={styles.reviewInput}
              type='text'
              placeholder='Album, Artist, Song, Label...'
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              disabled={isPending}
            />
          </label>

          <div className={styles.reviewSortWrap}>
            <button type='submit' className={styles.sortApply} disabled={isPending}>
              ◯
            </button>
            <button
              type='button'
              className={styles.sortReset}
              onClick={onReset}
              disabled={isPending}
              aria-label='Clear search filters'
            >
              ✕
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
