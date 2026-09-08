import { useState, useEffect } from 'react';
import { getStatuses } from '../api/status';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/AuthContext';
import { timeUntilExpiry } from '../utils/format';

export default function StatusList({ onViewStatus, statuses, loading }) {
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto py-2 px-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="skeleton h-16 w-16 rounded-full" />
            <div className="skeleton h-3 w-14" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-thin">
      {statuses?.length > 0 ? (
        statuses.map((status) => (
          <button
            key={status.id}
            type="button"
            onClick={() => onViewStatus?.(status)}
            className="flex flex-col items-center gap-1 shrink-0 group"
          >
            <div className="p-[3px] rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 group-hover:opacity-80 transition-opacity">
              <div className="p-[2px] bg-white rounded-full">
                <UserAvatar src={status.profile_image_url} alt={status.username} size="lg" />
              </div>
            </div>
            <span className="text-xs font-medium text-slate-700 max-w-[72px] truncate">
              {status.username}
            </span>
            <span className="text-[10px] text-slate-400">{timeUntilExpiry(status.expires_at)}</span>
          </button>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 w-full">
          <p className="text-sm">No active statuses right now</p>
          {user && (
            <p className="text-xs mt-1">Upload a status to share with your friends.</p>
          )}
        </div>
      )}
    </div>
  );
}
