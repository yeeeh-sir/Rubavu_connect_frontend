import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatTime } from '../utils/format';

export default function MessageBubble({ message, isOwn }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const bubbleClass = isOwn
    ? 'bg-primary-600 text-white self-end'
    : 'bg-white text-slate-800 self-start border border-slate-200';

  return (
    <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${bubbleClass}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          {message.message_type === 'text' && message.message_text && (
            <p className="text-sm break-words">{message.message_text}</p>
          )}

          {message.message_type === 'image' && message.media_url && (
            <a href={message.media_url} target="_blank" rel="noopener noreferrer">
              <img
                src={message.media_url}
                alt="Message attachment"
                className="max-w-full max-h-60 rounded-lg mt-1 hover:opacity-90 transition-opacity"
                loading="lazy"
              />
            </a>
          )}

          {message.message_type === 'voice' && message.media_url && (
            <div className="flex items-center gap-2 mt-1">
              <audio
                ref={audioRef}
                src={message.media_url}
                className="hidden"
                onEnded={() => setPlaying(false)}
              />
              <button
                type="button"
                onClick={() => {
                  if (playing) {
                    audioRef.current.pause();
                    setPlaying(false);
                  } else {
                    audioRef.current.play();
                    setPlaying(true);
                  }
                }}
                className={`p-1.5 rounded-full ${
                  isOwn ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'
                } hover:opacity-80 transition-opacity`}
                aria-label={playing ? 'Pause voice note' : 'Play voice note'}
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <span className="text-xs">
                {message.message_text || 'Voice message'}
              </span>
            </div>
          )}
        </div>
        <span className={`text-[10px] self-end shrink-0 ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
          {formatTime(message.created_at)}
        </span>
      </div>
      {!message.is_read && !isOwn && (
        <div className="mt-1">
          <span className="text-[10px] font-medium text-accent-600">New</span>
        </div>
      )}
    </div>
  );
}
