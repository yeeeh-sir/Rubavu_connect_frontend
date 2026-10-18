import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, UserSearch, X } from 'lucide-react';
import { searchUsers } from '../api/users';
import UserAvatar from './UserAvatar';
import { getErrorMessage } from '../utils/format';

export default function SearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(focusTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSearched(false);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      setError(null);
      setLoading(false);
      return undefined;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchUsers(trimmed);
        setResults(response.data.data.users || []);
        setSearched(true);
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to search'));
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, open]);

  if (!open) return null;

  const goToProfile = (username) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} role="presentation">
      <div
        className="mx-auto mt-16 w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-zoom-in sm:mt-24"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search people"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
          <SearchIcon size={19} className="shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people by username or name"
            aria-label="Search people by username or name"
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {loading && (
            <span className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-label="Searching" />
          )}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          {error ? (
            <p className="px-4 py-8 text-center text-sm text-red-500">{error}</p>
          ) : loading && !results.length ? (
            <div className="space-y-3 px-4 py-5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-36 rounded" />
                    <div className="skeleton h-2.5 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1.5">
              {results.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => goToProfile(person.username)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-primary-50"
                  >
                    <UserAvatar src={person.profile_image_url} alt={person.username} size="md" as="span" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-800">{person.full_name || person.username}</span>
                      <span className="block truncate text-xs text-slate-400">@{person.username}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : searched ? (
            <div className="px-4 py-10 text-center">
              <UserSearch size={36} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">No people found. Try another name.</p>
            </div>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-slate-400">Search by username or display name to meet new people.</p>
          )}
        </div>
      </div>
    </div>
  );
}
