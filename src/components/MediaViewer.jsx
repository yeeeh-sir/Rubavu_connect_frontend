import { useState } from 'react';
import { X, ZoomIn, ZoomOut, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function MediaViewer({ mediaUrl, mediaType, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [muted, setMuted] = useState(false);

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoom((z) => Math.min(z + 0.5, 5));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setZoom((z) => Math.max(z - 0.5, 0.5));
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <span className="bg-accent-500/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">HD</span>
        </div>
        <div className="flex items-center gap-2">
          {mediaType === 'image' && (
            <>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
                aria-label="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-xs text-white/60 font-medium min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
                aria-label="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
            </>
          )}
          <button
            type="button"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      {mediaType === 'image' ? (
        <img
          src={mediaUrl}
          alt="Fullscreen HD preview"
          className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      ) : (
        <video
          src={mediaUrl}
          className="max-w-full max-h-full object-contain rounded-lg"
          controls
          autoPlay
          muted={muted}
          onClick={(e) => e.stopPropagation()}
        >
          Your browser does not support videos.
        </video>
      )}

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </div>
  );
}
