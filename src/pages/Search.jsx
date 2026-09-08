import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, UserSearch, UserRoundPlus } from 'lucide-react';
import { searchUsers } from '../api/users';
import UserAvatar from '../components/UserAvatar';
import FollowButton from '../components/FollowButton';
import ConnectionButton from '../components/ConnectionButton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Loading from '../components/Loading';
import { getErrorMessage } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchTimer = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setNotFound(false);
      return;
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);

    searchTimer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchUsers(query.trim());
        setResults(res.data.data.users);
        setSearched(true);
        setNotFound(res.data.data.users.length === 0);
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to search'));
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="headline-font text-3xl font-extrabold text-primary-900">Discover Friends</h1>
      </div>

      <div className="relative mb-6">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pl-12 py-3 text-base"
          placeholder="Search people by username or name"
          aria-label="Search people by username or name"
        />
      </div>

      {loading ? (
        <Loading label="Finding people..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setQuery(query)} />
      ) : notFound ? (
        <EmptyState
          icon={UserSearch}
          message="No people found. Try another name or username."
        />
      ) : results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((u) => (
            <div key={u.id} className="card flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:border-primary-200">
              <button
                type="button"
                className="flex items-center gap-3 text-left"
                onClick={() => navigate(`/profile/${u.username}`)}
              >
                <UserAvatar src={u.profile_image_url} alt={u.username} size="lg" />
                <div>
                  <p className="font-semibold text-slate-900">{u.full_name}</p>
                  <p className="text-sm text-slate-500">@{u.username}</p>
                  {u.bio && <p className="mt-1 line-clamp-2 text-xs text-slate-400">{u.bio}</p>}
                </div>
              </button>
              {user && user.id !== u.id && (
                <span className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400"><UserRoundPlus size={14} /> Connect</span>
                  <FollowButton userId={u.id} size="sm" />
                  <ConnectionButton userId={u.id} size="sm" />
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        !searched && (
          <div className="text-center py-16 text-slate-400">
            <UserSearch size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Search by username or display name to meet people.</p>
          </div>
        )
      )}
    </div>
  );
}