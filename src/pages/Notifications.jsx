import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Heart, MessageCircle, UserPlus, Mail, Users, Check, X, Radio, ShieldCheck } from 'lucide-react';
import { getNotifications, markNotificationsRead } from '../api/notifications';
import { updateCollaboratorStatus } from '../api/posts';
import { formatTime, getErrorMessage } from '../utils/format';
import UserAvatar from '../components/UserAvatar';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Loading from '../components/Loading';

const typeIcons = {
  follow: UserPlus,
  like: Heart,
  comment: MessageCircle,
  message: Mail,
  connection_request: Users,
  connection_accepted: UserPlus,
  collaboration_invite: Users,
  collaboration_accepted: Users,
  live: Radio,
  report: ShieldCheck,
};

const typeColors = {
  follow: 'text-accent-600 bg-accent-50',
  like: 'text-red-500 bg-red-50',
  comment: 'text-primary-600 bg-primary-50',
  message: 'text-emerald-600 bg-emerald-50',
  connection_request: 'text-violet-600 bg-violet-50',
  connection_accepted: 'text-violet-600 bg-violet-50',
  collaboration_invite: 'text-accent-600 bg-accent-50',
  collaboration_accepted: 'text-accent-600 bg-accent-50',
  live: 'text-red-500 bg-red-50',
  report: 'text-amber-600 bg-amber-50',
};

const typeMessages = {
  follow: 'started following you',
  like: 'liked your post',
  comment: 'commented on your post',
  message: 'sent you a message',
  connection_request: 'sent you a connection request',
  connection_accepted: 'accepted your connection request',
  collaboration_invite: 'invited you to collaborate on their post',
  collaboration_accepted: 'accepted your collaboration invitation',
  live: 'started a live session',
  report: 'A report you submitted was reviewed',
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioning, setActioning] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications(1, 50);
      setNotifications(res.data.data.notifications);
      await markNotificationsRead();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleClick = (notification) => {
    if (
      notification.type === 'like' ||
      notification.type === 'comment' ||
      notification.type === 'collaboration_invite' ||
      notification.type === 'collaboration_accepted'
    ) {
      if (notification.post_id) navigate(`/post/${notification.post_id}`);
      else navigate(`/profile/${notification.from_username}`);
    } else if (notification.type === 'message') {
      navigate('/messages');
    } else if (notification.type === 'live') {
      navigate('/live');
    } else {
      navigate(`/profile/${notification.from_username}`);
    }
  };

  const handleCollabAction = async (event, notification, action) => {
    event.stopPropagation();
    if (!notification.post_id || actioning) return;
    setActioning(notification.id);
    try {
      await updateCollaboratorStatus(notification.post_id, action);
      loadNotifications();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to update collaboration'));
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Notifications</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 text-sm" role="alert">{error}</div>}

      {loading ? (
        <Loading label="Loading notifications..." />
      ) : error && notifications.length === 0 ? (
        <ErrorState message={error} onRetry={loadNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState message="No notifications yet" />
      ) : (
        <div className="card divide-y divide-slate-100">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            const color = typeColors[notification.type] || 'text-slate-600 bg-slate-100';
            const isCollabInvite = notification.type === 'collaboration_invite';

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleClick(notification)}
                className={`flex items-center gap-3 w-full text-left p-4 hover:bg-slate-50 transition-colors ${isCollabInvite ? 'bg-accent-50/40' : ''}`}
              >
                <div className="relative">
                  <UserAvatar
                    src={notification.from_profile_image_url}
                    alt={notification.from_username}
                    size="md"
                  />
                  <span className={`absolute -bottom-1 -right-1 p-1 rounded-full ${color}`}>
                    <Icon size={12} />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">@{notification.from_username}</span>{' '}
                    {typeMessages[notification.type] || 'sent you an update'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatTime(notification.created_at)}</p>
                </div>
                {!notification.is_read && (
                  <span className="h-2.5 w-2.5 bg-primary-600 rounded-full shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Collaboration invite action buttons (rendered outside the main list) */}
      {notifications.some((n) => n.type === 'collaboration_invite' && n.post_id) && (
        <div className="mt-4 space-y-2">
          {notifications
            .filter((n) => n.type === 'collaboration_invite' && n.post_id)
            .map((notification) => (
              <div key={`actions-${notification.id}`} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">@{notification.from_username}</span> invited you to collaborate
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">View the post to accept or decline</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/post/${notification.post_id}`)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent-600 px-4 py-2 text-xs font-bold text-white hover:bg-accent-700 transition-colors"
                  >
                    <Check size={14} /> Review
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}