import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StatusViewer({ statuses, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const status = statuses[index];

  const next = useCallback(() => {
    if (index < statuses.length - 1) {
      setIndex(index + 1);
    } else {
      onClose();
    }
  }, [index, statuses.length, onClose]);

  const prev = useCallback(() => {
    if (index > 0) setIndex(index - 1);
  }, [index]);

  useEffect(() => {
    if (!status) return;
    if (status.media_type === 'image' && playing) {
      timerRef.current = setTimeout(next, 5000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, playing, status, next]);

  useEffect(() => {
    if (status?.media_type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [index, status]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, next, prev]);

  if (!status) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1">
        {statuses.map((s, i) => (
          <div key={s.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white"
              style={{ width: i <= index ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          {status.profile_image_url ? (
            <img
              src={status.profile_image_url}
              alt={status.username}
              className="h-10 w-10 rounded-full object-cover border-2 border-white/80"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-white/20" />
          )}
          <div>
            <p className="font-semibold">{status.username}</p>
            <p className="text-xs text-white/60">{status.full_name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close status"
        >
          <X size={24} />
        </button>
      </div>

      {/* Media */}
      <div className="max-w-lg w-full max-h-[80vh] flex items-center justify-center">
        {status.media_type === 'image' ? (
          <img
            src={status.media_url}
            alt="Status"
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <video
            ref={videoRef}
            src={status.media_url}
            className="max-w-full max-h-[80vh] object-contain rounded-lg bg-black"
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            onEnded={next}
          >
            Your browser does not support videos.
          </video>
        )}
      </div>

      {/* Navigation arrows */}
      {index > 0 && (
        <button
          type="button"
          onClick={prev}
          className="absolute left-2 sm:left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Previous status"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {index < statuses.length - 1 && (
        <button
          type="button"
          onClick={next}
          className="absolute right-2 sm:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Next status"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
