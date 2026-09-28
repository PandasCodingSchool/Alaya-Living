'use client';

import { Star } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type ReviewTargetKind = 'USER' | 'PG' | 'FLAT' | 'ROOM';

interface ReviewSummary {
  average: number;
  count: number;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    reviewer: { id: string; name: string; photoUrl: string | null };
  }[];
}

export function ReviewSection({ targetKind, targetId }: { targetKind: ReviewTargetKind; targetId: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<ReviewSummary | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  function load() {
    api<ReviewSummary>(`/reviews?targetKind=${targetKind}&targetId=${targetId}`)
      .then(setData)
      .catch(() => setData({ average: 0, count: 0, reviews: [] }));
  }

  useEffect(() => {
    load();
  }, [targetKind, targetId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    try {
      await api('/reviews', {
        method: 'POST',
        body: JSON.stringify({ targetKind, targetId, rating, comment: comment.trim() || undefined }),
      });
      setComment('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit review');
    }
  }

  return (
    <section className="panel mt-8 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Reviews</h2>
          <p className="mt-1 text-sm text-muted">
            {data?.count ? `${data.average} / 5 · ${data.count} review${data.count === 1 ? '' : 's'}` : 'No reviews yet'}
          </p>
        </div>
      </div>

      {user && (
        <form onSubmit={submit} className="mt-5 space-y-3 border-t border-sand pt-5">
          <p className="text-sm font-medium">Leave a review</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="p-1"
                aria-label={`Rate ${value} stars`}
              >
                <Star className={`h-5 w-5 ${value <= rating ? 'fill-clay text-clay' : 'text-muted'}`} />
              </button>
            ))}
          </div>
          <textarea
            className="field py-2 text-sm"
            placeholder="Optional comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Submit review
          </button>
          {error && <p className="text-sm text-clay">{error}</p>}
        </form>
      )}

      <div className="mt-5 space-y-4">
        {data?.reviews.map((review) => (
          <div key={review.id} className="flex gap-3 border-t border-sand pt-4 first:border-t-0 first:pt-0">
            <Avatar name={review.reviewer.name} photoUrl={review.reviewer.photoUrl} size={36} />
            <div>
              <p className="text-sm font-medium">{review.reviewer.name}</p>
              <p className="text-xs text-clay">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
              {review.comment && <p className="mt-1 text-sm text-muted">{review.comment}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
