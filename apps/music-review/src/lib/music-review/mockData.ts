import type { MusicReview } from './types'

export const musicReviewSamples: MusicReview[] = [
  {
    id: 'mr-001',
    postedAt: '2026-02-24',
    authorName: 'guest_user',
    artistName: 'Unknown Artist',
    albumName: 'Night Drive EP',
    releaseDate: null,
    trackName: 'After Hours Mix',
    labelName: 'City Pulse',
    genre: 'House',
    jacketUrl: null,
    embedProvider: 'SoundCloud',
    embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/830531311&color=%234385be&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
    body: 'ローエンドが過剰にならない絶妙なバランスで、深夜帯のプレイにちょうど良い質感。キックとベースが常に前に出るのに、ハイの抜けが自然なので長時間聴いても疲れにくい。特にブレイク後の再展開で空間が広がるポイントが秀逸で、DJミックスの中でも浮かずに馴染む。',
    references: [
      {
        id: 'ref-001',
        title: 'Interview with the producer',
        url: 'https://example.com/interview-night-drive',
      },
    ],
  },
  {
    id: 'mr-002',
    postedAt: '2026-02-18',
    authorName: 'mix_archivist',
    artistName: 'Various',
    albumName: null,
    releaseDate: null,
    trackName: 'Warehouse Selection',
    labelName: null,
    genre: 'Techno',
    jacketUrl: null,
    embedProvider: null,
    embedUrl: null,
    body: '荒いテクスチャのトラックを軸にしつつ、中盤で温度感の違う楽曲を差し込む構成が見事。単体で聴くよりも前後の流れの中で魅力が増すタイプで、セット全体のテンションコントロールの参考になる。クラブ帯域向けのロー処理が丁寧で、実運用を意識したセレクトだと感じた。',
    references: [],
  },
]

export function truncateReviewBody(body: string, limit = 200): {
  preview: string
  hasMore: boolean
} {
  if (body.length <= limit) {
    return {
      preview: body,
      hasMore: false,
    }
  }

  return {
    preview: `${body.slice(0, limit)}...`,
    hasMore: true,
  }
}
