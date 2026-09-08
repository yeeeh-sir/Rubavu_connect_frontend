import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

function MediaItem({ media, playing, muted, onPlay, onPause, onToggleAudio, onToggleZoom, onRegisterVideo, onProgress }) {
  const { media_type, media_url, thumbnail_url } = media;
  const videoRef = useRef(null);

  useEffect(() => {
    if (media_type === 'video' && videoRef.current) {
      videoRef.current.load();
      onProgress?.(0);
    }
  }, [media_url, media_type, onProgress]);

  if (media_type === 'image') {
    return (
      <>
        <img
          src={media_url}
          alt="Post"
          className="w-full h-auto max-h-[85vh] object-contain bg-black cursor-pointer post-img-hd"
          loading="lazy"
          onClick={(e) => {
            e.stopPropagation();
            onToggleZoom();
          }}
        />
        <div className="absolute bottom-3 right-3 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleZoom();
            }}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <video
        ref={(node) => {
          videoRef.current = node;
          onRegisterVideo?.(node);
        }}
        src={media_url}
        poster={thumbnail_url}
        className="w-full h-auto max-h-[85vh] object-contain"
        playsInline
        preload="metadata"
        muted={muted}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration) onProgress?.((el.currentTime / el.duration) * 100);
        }}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={() => {
          onPause();
          onProgress?.(0);
        }}
        onClick={(e) => e.stopPropagation()}
      >
        Your browser does not support videos.
      </video>

      {!playing && (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-transparent to-black/10 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          }}
          aria-label="Play video"
        >
          <span className="h-20 w-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl backdrop-blur-sm play-btn-pulse transition-transform hover:scale-110">
            <Play size={32} className="text-primary-700 ml-1.5" fill="currentColor" />
          </span>
        </button>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
          playing ? 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-3 pt-1 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 backdrop-blur-sm transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  if (videoRef.current.paused) {
                    videoRef.current.play().catch(() => {});
                  } else {
                    videoRef.current.pause();
                  }
                }
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 backdrop-blur-sm transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAudio();
              }}
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 backdrop-blur-sm transition-all"
            onClick={(e) => {
              e.stopPropagation();
              if (videoRef.current?.requestFullscreen) {
                videoRef.current.requestFullscreen();
              }
            }}
            aria-label="Enter fullscreen"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

export default function PostMedia({ mediaUrl, mediaType, thumbnailUrl, className = '', media }) {
  const items = Array.isArray(media) && media.length ? media : mediaUrl ? [{ media_type: mediaType, media_url: mediaUrl, thumbnail_url: thumbnailUrl }] : [];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
    setProgress(0);
  }, [mediaUrl]);

  const current = items[index];

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches?.[0]?.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 50) {
      if (delta < 0) setIndex((i) => Math.min(i + 1, items.length - 1));
      else setIndex((i) => Math.max(i - 1, 0));
    }
  };

  const goPrev = (e) => {
    e?.stopPropagation();
    setIndex((i) => Math.max(i - 1, 0));
  };
  const goNext = (e) => {
    e?.stopPropagation();
    setIndex((i) => Math.min(i + 1, items.length - 1));
  };

  if (items.length === 0) {
    return <div className={`bg-slate-100 ${className}`} />;
  }

  const isGallery = items.length > 1;
  const isCurrentVideo = current?.media_type === 'video';

  return (
    <>
      <div
        className={`relative overflow-hidden bg-slate-100 ${className}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`group ${isCurrentVideo ? 'bg-black' : ''}`}>
          {isCurrentVideo && (
            <div className="absolute inset-x-0 top-0 h-1 z-10 bg-white/20">
              <div className="h-full bg-white/80 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          )}
          <MediaItem
            media={current}
            playing={playing}
            muted={muted}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onToggleAudio={() => setMuted((m) => !m)}
            onToggleZoom={() => setShowZoom(true)}
            onRegisterVideo={(node) => {
              videoRef.current = node;
            }}
            onProgress={setProgress}
          />
        </div>

        {isGallery && (
          <>
            {index > 0 && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 backdrop-blur-sm transition-all z-20"
                aria-label="Previous media"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            {index < items.length - 1 && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 backdrop-blur-sm transition-all z-20"
                aria-label="Next media"
              >
                <ChevronRight size={22} />
              </button>
            )}
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm z-20">
              {index + 1} / {items.length}
            </span>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                  aria-label={`Go to media ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showZoom && current && (
        <div
          className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowZoom(false)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm z-10"
            onClick={() => setShowZoom(false)}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          {current.media_type === 'image' ? (
            <img
              src={current.media_url}
              alt="Full HD preview"
              className="max-w-full max-h-full object-contain rounded-lg animate-zoom-in"
              onClick={(e) => e.stopPropagation()}
              style={{ imageRendering: 'auto' }}
            />
          ) : (
            <video src={current.media_url} poster={current.thumbnail_url} controls autoPlay className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}
    </>
  );
}