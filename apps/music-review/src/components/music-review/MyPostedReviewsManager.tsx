"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/app/music-review/music-review.module.css";
import { useMusicReviewAuth } from "@/hooks/useMusicReviewAuth";
import { buildActorFromSession } from "@/lib/music-review/auth/actor";
import type { MusicReview } from "@/lib/music-review/types";

type ReviewsApiPayload = {
  reviews?: MusicReview[];
  message?: string;
};

function textOrHyphen(value: string | null): string {
  if (!value || value.trim().length === 0) {
    return "-";
  }

  return value;
}

export default function MyPostedReviewsManager() {
  const router = useRouter();
  const { session } = useMusicReviewAuth();

  const [reviews, setReviews] = useState<MusicReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [activeMenuReviewId, setActiveMenuReviewId] = useState<string | null>(
    null,
  );
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setReviews([]);
      setIsLoadingReviews(false);
      return;
    }

    let isMounted = true;
    setIsLoadingReviews(true);
    setReviewError(null);

    const query = new URLSearchParams({
      authorName: session.user.nickname,
      order: "desc",
      scope: "own",
    });

    fetch(`/api/music-review/reviews?${query.toString()}`, {
      method: "GET",
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response
          .json()
          .catch(() => null)) as ReviewsApiPayload | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? "Failed to fetch reviews");
        }

        if (!isMounted) {
          return;
        }

        setReviews(Array.isArray(payload?.reviews) ? payload.reviews : []);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setReviewError(
          error instanceof Error ? error.message : "Failed to fetch reviews",
        );
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setIsLoadingReviews(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const onEditReview = (reviewId: string) => {
    router.push(`/music-review/reviews/edit/${reviewId}`);
  };

  const onDeleteReview = async (reviewId: string) => {
    if (!session) {
      return;
    }

    const shouldDelete = window.confirm(
      "Are you sure you want to delete this review?",
    );
    if (!shouldDelete) {
      return;
    }

    setDeletingReviewId(reviewId);
    setReviewError(null);

    try {
      const response = await fetch(`/api/music-review/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actor: buildActorFromSession(session),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(payload?.message ?? "Failed to delete review");
      }

      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      setActiveMenuReviewId((prev) => (prev === reviewId ? null : prev));
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "Failed to delete review",
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <div className="form__card">
      {isLoadingReviews ? (
        <p className="form__note">Loading reviews...</p>
      ) : null}
      {reviewError ? <p className="form__error">{reviewError}</p> : null}

      {!isLoadingReviews && reviews.length === 0 ? (
        <p className="form__note">No reviews posted</p>
      ) : (
        <div className={styles.reviewManageList}>
          {reviews.map((review) => {
            const isDeleting = deletingReviewId === review.id;
            const isMenuOpen = activeMenuReviewId === review.id;

            return (
              <article key={review.id} className={styles.reviewManageItem}>
                <div className={styles.reviewManageContentWrap}>
                  {review.jacketUrl ? (
                    <img
                      src={review.jacketUrl}
                      alt=""
                      className={styles.reviewManageThumbnail}
                    />
                  ) : (
                    <div className={styles.reviewJacketFallback}>No Image</div>
                  )}
                  <div className={styles.reviewManageMetaWrap}>
                    <p className={styles.reviewManageMeta}>
                      Posted on: {review.postedAt}
                    </p>
                    <p className={styles.reviewManageMeta}>
                      Album: {textOrHyphen(review.albumName)}
                    </p>
                    <p className={styles.reviewManageMeta}>
                      Track: {textOrHyphen(review.trackName)}
                    </p>
                    {/* <p className={styles.reviewManageMeta}>Genre: {textOrHyphen(review.genre)}</p> */}
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.reviewMenuToggle}
                  onClick={() =>
                    setActiveMenuReviewId((prev) =>
                      prev === review.id ? null : review.id,
                    )
                  }
                  aria-label="Review actions menu toggle"
                  aria-expanded={isMenuOpen}
                  disabled={isDeleting}
                >
                  ...
                </button>
                  <div
                    className={`${styles.reviewMenuPanel}${
                      isMenuOpen ? ` ${styles.reviewMenuPanelOpen}` : ""
                    }`}
                    aria-hidden={!isMenuOpen}
                  >
                    <div className={styles.reviewMenuPanelInner}>
                      <button
                        type="button"
                        className="secondary__button"
                        onClick={() => onEditReview(review.id)}
                        disabled={isDeleting || !isMenuOpen}
                        tabIndex={isMenuOpen ? 0 : -1}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="destructive__button"
                        onClick={() => onDeleteReview(review.id)}
                        disabled={isDeleting || !isMenuOpen}
                        tabIndex={isMenuOpen ? 0 : -1}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
