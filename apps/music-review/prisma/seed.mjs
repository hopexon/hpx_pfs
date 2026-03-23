import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleReviews = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    postedAt: new Date("2026-02-24"),
    authorName: "guest_user",
    artistName: "Unknown Artist",
    albumName: "Night Drive EP",
    trackName: "After Hours Mix",
    labelName: "City Pulse",
    genre: "House",
    embedProvider: "SoundCloud",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/830531311&color=%234385be&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true",
    body:
      "ローエンドが過剰にならない絶妙なバランスで、深夜帯のプレイにちょうど良い質感。キックとベースが常に前に出るのに、ハイの抜けが自然なので長時間聴いても疲れにくい。特にブレイク後の再展開で空間が広がるポイントが秀逸で、DJミックスの中でも浮かずに馴染む。",
    references: [
      {
        id: "11111111-aaaa-4111-8111-111111111111",
        title: "Interview with the producer",
        url: "https://example.com/interview-night-drive",
        sortOrder: 0,
      },
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    postedAt: new Date("2026-02-18"),
    authorName: "guest_user",
    artistName: "Various",
    albumName: null,
    trackName: "Warehouse Selection",
    labelName: null,
    genre: "Techno",
    embedProvider: null,
    embedUrl: null,
    body:
      "荒いテクスチャのトラックを軸にしつつ、中盤で温度感の違う楽曲を差し込む構成が見事。単体で聴くよりも前後の流れの中で魅力が増すタイプで、セット全体のテンションコントロールの参考になる。クラブ帯域向けのロー処理が丁寧で、実運用を意識したセレクトだと感じた。",
    references: [],
  },
];

async function main() {
  const guestEmail = process.env.NEXT_PUBLIC_MUSIC_REVIEW_GUEST_EMAIL?.trim() || "guest@your-domain.com";
  const guestAuthUserId = process.env.MUSIC_REVIEW_GUEST_AUTH_USER_ID?.trim() || null;

  const guestUser = await prisma.musicReviewUser.upsert({
    where: {
      email: guestEmail,
    },
    update: {
      nickname: "guest_user",
      role: "guest",
      authUserId: guestAuthUserId,
    },
    create: {
      email: guestEmail,
      nickname: "guest_user",
      role: "guest",
      authUserId: guestAuthUserId,
    },
  });

  for (const sample of sampleReviews) {
    await prisma.musicReview.upsert({
      where: {
        id: sample.id,
      },
      update: {
        userId: guestUser.id,
        postedAt: sample.postedAt,
        authorName: sample.authorName,
        artistName: sample.artistName,
        albumName: sample.albumName,
        trackName: sample.trackName,
        labelName: sample.labelName,
        genre: sample.genre,
        embedProvider: sample.embedProvider,
        embedUrl: sample.embedUrl,
        body: sample.body,
        references: {
          deleteMany: {},
          create: sample.references.map((reference) => ({
            id: reference.id,
            title: reference.title,
            url: reference.url,
            sortOrder: reference.sortOrder,
          })),
        },
      },
      create: {
        id: sample.id,
        userId: guestUser.id,
        postedAt: sample.postedAt,
        authorName: sample.authorName,
        artistName: sample.artistName,
        albumName: sample.albumName,
        trackName: sample.trackName,
        labelName: sample.labelName,
        genre: sample.genre,
        embedProvider: sample.embedProvider,
        embedUrl: sample.embedUrl,
        body: sample.body,
        references: {
          create: sample.references.map((reference) => ({
            id: reference.id,
            title: reference.title,
            url: reference.url,
            sortOrder: reference.sortOrder,
          })),
        },
      },
    });
  }

  console.log("[music-review] seed completed");
}

main()
  .catch((error) => {
    console.error("[music-review] seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
