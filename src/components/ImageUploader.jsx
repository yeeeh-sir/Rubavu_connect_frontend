import { useRef } from 'react';
import { ImagePlus, Video, X } from 'lucide-react';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_VIDEO_DURATION = 30;

export default function ImageUploader({ file, onSelect, mediaType = 'any', onClear, label }) {
  const inputRef = useRef(null);

  const allowedTypes =
    mediaType === 'image'
      ? ALLOWED_IMAGE_TYPES
      : mediaType === 'video'
      ? ALLOWED_VIDEO_TYPES
      : [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!allowedTypes.includes(selected.type)) {
      window.alert('Invalid file type. Please select an image (jpg, jpeg, png, webp) or video (mp4, webm, mov).');
      e.target.value = '';
      return;
    }

    if (selected.type.startsWith('video/')) {
      const duration = await getVideoDuration(selected);
      if (duration > MAX_VIDEO_DURATION) {
        window.alert('Video must be 30 seconds or shorter.');
        e.target.value = '';
        return;
      }
    }

    onSelect(selected);
  };

  const getVideoDuration = (file) =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
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

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-slate-300 hover:border-primary-400 rounded-2xl py-12 flex flex-col items-center justify-center transition-colors bg-slate-50 hover:bg-slate-100"
      >
        {label === 'video' ? <Video size={40} className="text-slate-400 mb-2" /> : <ImagePlus size={40} className="text-slate-400 mb-2" />}
        <span className="text-sm font-medium text-slate-600">Click to select media</span>
      </button>
    </div>
  );
}
