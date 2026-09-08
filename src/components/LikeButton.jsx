import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { likePost, unlikePost } from '../api/posts';
import { getErrorMessage, formatCount } from '../utils/format';

export default function LikeButton({ postId, initialLiked, initialCount, onUpdate }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inFlight = useRef(false);

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount || 0);
  }, [initialLiked, initialCount, postId]);

  const handleClick = async () => {
    if (loading || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      const res = wasLiked ? await unlikePost(postId) : await likePost(postId);
      const newCount = res.data.data.likes_count;
      setCount(newCount);
      onUpdate?.({ liked: !wasLiked, count: newCount });
    } catch (err) {
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : c - 1));
      setError(getErrorMessage(err, 'Unable to update like'));
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center gap-1.5 transition-all focus:outline-none disabled:opacity-60 ${
          liked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'
        }`}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
      </button>
      <span className="text-sm font-medium text-slate-700">{formatCount(count)}</span>
    </div>
  );
}
