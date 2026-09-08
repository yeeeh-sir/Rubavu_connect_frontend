import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, X, Send, Clock } from 'lucide-react';
import { createStatus } from '../api/status';
import { getErrorMessage } from '../utils/format';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_VIDEO_DURATION = 30;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const STATUS_EXPIRY_HOURS = 25;

export default function StatusCreate() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const getVideoDuration = (videoFile) =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(videoFile);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(999);
      };
      video.src = url;
    });

  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError(null);

    const isImage = ALLOWED_IMAGE_TYPES.includes(selected.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(selected.type);
    if (!isImage && !isVideo) {
      setError('Invalid file type. Allowed: jpg, jpeg, png, webp images or mp4, webm, mov videos.');
      e.target.value = '';
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 50MB.');
      e.target.value = '';
      return;
    }
    if (isVideo) {
      const duration = await getVideoDuration(selected);
      if (duration > MAX_VIDEO_DURATION) {
        setError(`Video must be 30 seconds or shorter. This video is ${duration.toFixed(1)}s.`);
        e.target.value = '';
        return;
      }
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setFileType(isImage ? 'image' : 'video');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect({ target: { files: [dropped], value: '' } });
  };

  const clearSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setFileType(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handlePublish = async () => {
    if (!file || publishing) return;
    setPublishing(true);
    setError(null);
    try {
      await createStatus(file);
      clearSelection();
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to upload status'));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pb-12">
      <div className="mb-8 flex items-center gap-2">
        <span className="px-2 py-1 rounded-full bg-accent-100 text-accent-700 text-xs font-bold inline-flex items-center gap-1">
          <Clock size={12} /> Expires after {STATUS_EXPIRY_HOURS} hours
        </span>
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 headline-font">Add to your status</h1>
      <p className="text-sm text-slate-400 mt-1">A status disappears after {STATUS_EXPIRY_HOURS} hours.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mt-6 text-sm" role="alert">{error}</div>
      )}

      <div className="card mt-6 overflow-hidden">
        {!file ? (
          <div className="p-6">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-2xl py-16 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                isDragging
                  ? 'border-primary-400 bg-primary-50 scale-[1.02]'
                  : 'border-slate-200 hover:border-primary-300 bg-slate-50 hover:bg-primary-50/30'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-accent-100 flex items-center justify-center mb-4">
                <ImagePlus size={32} className="text-accent-600" />
              </div>
              <span className="font-bold text-slate-700 mb-1 text-lg">Select an image or video</span>
              <span className="text-sm text-slate-400">or drag and drop</span>
              <span className="text-xs text-slate-300 mt-3">Max 50MB · Videos up to 30s</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="relative bg-black">
              {fileType === 'image' ? (
                <img src={previewUrl} alt="Status preview" className="w-full max-h-[60vh] object-contain" />
              ) : (
                <video src={previewUrl} controls className="w-full max-h-[60vh] object-contain" />
              )}
              <button
                type="button"
                onClick={clearSelection}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
                aria-label="Remove media"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                <Clock size={14} /> This status will disappear after {STATUS_EXPIRY_HOURS} hours.
              </p>
              <div className="flex items-center justify-between">
                <button type="button" onClick={clearSelection} disabled={publishing} className="btn-secondary rounded-xl">
                  Cancel
                </button>
                <button type="button" onClick={handlePublish} disabled={publishing} className="btn-primary rounded-xl px-6">
                  {publishing ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sharing...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><Send size={16} /> Share status</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}