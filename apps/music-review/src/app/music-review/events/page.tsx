import type { Metadata } from "next";
import Link from "next/link";
import ProtectedFormPage from "@/components/music-review/ProtectedFormPage";
import styles from "../music-review.module.css";

export const metadata: Metadata = {
  title: "Music Review Events",
  description: "Event management placeholder page",
};

export default function MusicReviewEventsPage() {
  return (
    <ProtectedFormPage heading="" hiddenHeading={true} lead="" size="normal">
      <div className={styles.formCard}>
        <p className={styles.formLead}>イベント管理機能はStep6時点では準備中です。</p>
        <p className={styles.formHelper}>まずはレビュー管理と投稿導線を優先して公開しています。</p>
        <div className={styles.formActions}>
          <Link href="/music-review/mypage" className={styles.secondaryButton}>
            マイページへ戻る
          </Link>
          <Link href="/music-review/reviews/new" className={styles.primaryButton}>
            レビュー投稿へ
          </Link>
        </div>
      </div>
    </ProtectedFormPage>
  );
}
