import { useNavigate } from 'react-router-dom';
import { MessageCircle, Settings } from 'lucide-react';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';
import ConnectionButton from './ConnectionButton';
import { usePresence } from '../context/PresenceContext';

export default function ProfileHeader({ profile, isOwn, onFollowToggle }) {
  const navigate = useNavigate();
  const { isOnline } = usePresence();

  const online = isOnline(profile.id) || profile.is_online === 1;

  const statItems = [
    { label: 'Posts', value: profile.post_count || 0 },
    { label: 'Followers', value: profile.follower_count || 0 },
    { label: 'Following', value: profile.following_count || 0 },
  ];

  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <UserAvatar
          src={profile.profile_image_url}
          alt={profile.username}
          size="2xl"
          online={online}
          className="ring-4 ring-primary-100 mx-auto sm:mx-0"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h1 className="text-xl font-bold text-slate-900">{profile.full_name}</h1>
            <span className="text-sm text-slate-500">@{profile.username}</span>
            {online && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Online now
              </span>
            )}
          </div>
          {profile.bio && <p className="mt-2 text-sm text-slate-700">{profile.bio}</p>}

          <div className="flex justify-center sm:justify-start gap-6 mt-4">
            {statItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.label === 'Followers' || item.label === 'Following' ? undefined : undefined}
                className={`${statItems[0].label === item.label ? '' : 'hover:opacity-80 transition-opacity'} text-center`}
              >
                <div className="text-lg font-bold text-slate-900">{item.value}</div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
            {isOwn ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/settings/profile')}
              >
                <Settings size={16} />
                Edit Profile
              </button>
            ) : (
              <>
                <FollowButton
                  userId={profile.id}
                  initialFollowing={profile.is_following}
                  onToggle={onFollowToggle}
                />
                <ConnectionButton userId={profile.id} size="sm" />
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => navigate(`/messages/${profile.id}`)}
                >
                  <MessageCircle size={16} />
                  Message
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
