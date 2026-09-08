import { useState } from 'react';
import { followUser, unfollowUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/format';
import ButtonLoader from './ButtonLoader';

export default function FollowButton({ userId, initialFollowing = false, onToggle, size = 'md' }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user || user.id === userId) return null;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      onToggle?.(!wasFollowing);
    } catch (err) {
      setFollowing(wasFollowing);
      setError(getErrorMessage(err, 'Action failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`${sizeClasses[size]} rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 ${
          following
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400'
            : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
        }`}
      >
        {loading ? (
          <ButtonLoader label={following ? '...' : '...'} />
        ) : following ? (
          'Following'
        ) : (
          'Follow'
        )}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
