import { useState, useRef } from 'react';
import { Plus, X, Send, ImagePlus } from 'lucide-react';
import { createStatus } from '../api/status';
import { getErrorMessage } from '../utils/format';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_VIDEO_DURATION = 30;
const STATUS_EXPIRY_HOURS = 25;

export default function StatusComposer({ onCreated }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);
    const isImage = ALLOWED_IMAGE_TYPES.includes(selected.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(selected.type);

    if (!isImage && !isVideo) {
      setError('Only images and videos are allowed for statuses.');
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
    const url = URL.createObjectURL(selected);
    setFile(selected);
    setPreviewUrl(url);
    setFileType(isImage ? 'image' : 'video');
  };

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
      const res = await createStatus(file);
      clearSelection();
      onCreated?.(res.data.data.status);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to upload status'));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 justify-center w-full rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100 hover:border-primary-400 py-3 transition-colors font-medium"
        >
          <Plus size={18} />
          Add to your status
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="relative rounded-lg overflow-hidden bg-black mb-3">
            {fileType === 'image' ? (
              <img src={previewUrl} alt="Status preview" className="w-full max-h-64 object-contain" />
            ) : (
              <video src={previewUrl} controls className="w-full max-h-64" />
            )}
          </div>
          <p className="text-xs text-slate-500 mb-2">
            Status expires after {STATUS_EXPIRY_HOURS} hours.
          </p>
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={clearSelection}
              disabled={publishing}
              className="btn-secondary !py-1.5 !px-3 text-xs"
            >
              <X size={14} /> Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="btn-primary !py-1.5 !px-3 text-xs"
            >
              {publishing ? (
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1"><Send size={14} />Share</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}