import { useNavigate, useParams } from 'react-router-dom';
import { formatTime } from '../utils/format';
import { Image as ImageIcon, Mic } from 'lucide-react';
import { usePresence } from '../context/PresenceContext';

export default function ConversationList({ conversations, loading }) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { isOnline } = usePresence();

  if (loading) {
    return (
      <div className="p-2 space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="flex-1">
              <div className="skeleton h-3 w-24 mb-1" />
              <div className="skeleton h-2 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <p className="text-sm font-medium">No conversations</p>
        <p className="text-xs mt-1">Start chatting with a friend to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations?.map((conv) => {
        const isActive = String(conv.user_id) === String(userId);
        const isFromMe = conv.sender_id === conv.user_id;
        const online = isOnline(conv.user_id) || conv.is_online === 1;

        return (
          <button
            key={conv.user_id}
            type="button"
            onClick={() => navigate(`/messages/${conv.user_id}`)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
              isActive ? 'bg-primary-50' : 'hover:bg-slate-50'
            }`}
          >
            <div className="relative shrink-0">
              {conv.profile_image_url ? (
                <img
                  src={conv.profile_image_url}
                  alt={conv.username}
                  className="h-11 w-11 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-11 w-11 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-semibold">
                  {(conv.full_name || conv.username)?.charAt(0).toUpperCase()}
                </div>
              )}
              {online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" aria-label="Online" />
              )}
              {conv.unread_count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {conv.unread_count}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm truncate">{conv.full_name || conv.username}</p>
                {online ? (
                  <span className="text-[10px] text-green-600 font-semibold shrink-0 ml-2">Online</span>
                ) : (
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {formatTime(conv.last_message_at)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">
                {isFromMe && `You: `}
                {conv.message_type === 'image' && (
                  <span className="inline-flex items-center gap-1"><ImageIcon size={12} />Image</span>
                )}
                {conv.message_type === 'voice' && (
                  <span className="inline-flex items-center gap-1"><Mic size={12} />Voice</span>
                )}
                {conv.message_type === 'text' && conv.message_text}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
