'use client';

import { Bookmark } from 'lucide-react';
import { useBookmarks, type BookmarkKind } from '@/lib/bookmarks';
import { useAuth } from '@/lib/auth';

export function SaveButton({
  kind,
  targetId,
  hide,
  variant = 'overlay',
  className = '',
}: {
  kind: BookmarkKind;
  targetId: string;
  hide?: boolean;
  variant?: 'overlay' | 'icon' | 'label';
  className?: string;
}) {
  const { user } = useAuth();
  const { isSaved, toggle } = useBookmarks();

  if (!user || hide) return null;

  const saved = isSaved(kind, targetId);
  const styles = {
    overlay: 'grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/90 text-ink shadow-sm backdrop-blur hover:bg-white',
    icon: 'grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-[#FFF1F5] hover:text-ink',
    label: 'btn-ghost',
  };

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggle(kind, targetId);
      }}
      aria-label={saved ? 'Remove from saved' : 'Save'}
      className={`${styles[variant]} ${className}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? 'fill-clay text-clay' : ''}`} />
      {variant === 'label' && <span className="ml-1.5">{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
