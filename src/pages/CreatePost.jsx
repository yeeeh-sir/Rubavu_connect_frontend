import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, X, Send, Globe, Lock, Users, Plus, Video } from 'lucide-react';
import { createPost } from '../api/posts';
import { searchUsers } from '../api/users';
import { getErrorMessage } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_VIDEO_DURATION = 30;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 10;

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [audience, setAudience] = useState('public');
  const [collaborators, setCollaborators] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef(null);
  const searchTimer = useRef(null);

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

  const validateFile = async (selected) => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(selected.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(selected.type);

    if (!isImage && !isVideo) {
      setError('Invalid file type. Allowed: jpg, jpeg, png, webp images or mp4, webm, mov videos.');
      return null;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 50MB.');
      return null;
    }
    if (isVideo) {
      const duration = await getVideoDuration(selected);
      if (duration > MAX_VIDEO_DURATION) {
        setError(`Video must be 30 seconds or shorter. This video is ${duration.toFixed(1)}s.`);
        return null;
      }
    }
    return { file: selected, type: isImage ? 'image' : 'video', url: URL.createObjectURL(selected) };
  };

  const handleFileSelect = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setError(null);
    if (files.length + selected.length > MAX_FILES) {
      setError(`A post can have up to ${MAX_FILES} media files.`);
      e.target.value = '';
      return;
    }
    const processed = [];
    for (const file of selected) {
      const item = await validateFile(file);
      if (item) processed.push(item);
    }
    setFiles((prev) => [...prev, ...processed]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length) {
      handleFileSelect({ target: { files: dropped, value: '' } });
    }
  };

  const handleCollaboratorSearch = (value) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await searchUsers(value.trim());
        setSearchResults(res.data.data.users || []);
      } catch (_) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const addCollaborator = (collaborator) => {
    if (collaborators.some((c) => c.id === collaborator.id)) return;
    if (collaborators.length >= 10) {
      setError('A post can have up to 10 collaborators.');
      return;
    }
    setCollaborators((prev) => [...prev, collaborator]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCollaborator = (id) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  const handlePublish = async () => {
    if (!files.length || publishing) return;
    setPublishing(true);
    setError(null);

    try {
      const collaboratorIds = collaborators.map((c) => c.id);
      const res = await createPost(
        files.map((item) => item.file),
        caption.trim(),
        audience,
        collaboratorIds
      );
      files.forEach((item) => URL.revokeObjectURL(item.url));
      navigate(`/post/${res.data.data.post.id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create post. Please try again.'));
    } finally {
      setPublishing(false);
    }
  };

  const audienceOptions = [
    { value: 'public', label: 'Everyone', icon: Globe, desc: 'Anyone can see this post' },
    { value: 'friends', label: 'Connections only', icon: Users, desc: 'Only your connections' },
    { value: 'private', label: 'Only me', icon: Lock, desc: 'Private post' },
  ];

  const selectedAudience = audienceOptions.find((o) => o.value === audience);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 headline-font">Create a post</h1>
        <p className="text-sm text-slate-400 mt-1">Share something amazing with the world</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 text-sm flex items-start gap-3" role="alert">
          <span className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-red-700 text-xs font-bold">!</span>
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {/* User info bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm overflow-hidden">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.username?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">{user?.full_name || user?.username}</p>
            <p className="text-xs text-slate-400">@{user?.username}</p>
          </div>
        </div>

        {files.length === 0 ? (
          <div className="p-6">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-2xl py-20 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                isDragging
                  ? 'border-primary-400 bg-primary-50 scale-[1.02]'
                  : 'border-slate-200 hover:border-primary-300 bg-slate-50 hover:bg-primary-50/30'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${isDragging ? 'bg-primary-100' : 'bg-slate-100'}`}>
                <ImagePlus size={32} className={isDragging ? 'text-primary-500' : 'text-slate-400'} />
              </div>
              <span className="font-bold text-slate-700 mb-1 text-lg">
                {isDragging ? 'Drop your files here' : 'Select images or videos'}
              </span>
              <span className="text-sm text-slate-400">or drag and drop (up to 10 files)</span>
              <div className="flex items-center gap-2 mt-4">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500">JPG</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500">PNG</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500">WEBP</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500">MP4</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500">MOV</span>
              </div>
              <span className="text-xs text-slate-300 mt-3">Max 50MB per file · Videos up to 30s</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Preview strip */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">Media ({files.length}/{MAX_FILES})</span>
                {files.length < MAX_FILES && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={14} /> Add more
                  </button>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {files.map((item, index) => (
                  <div key={`${item.file.name}-${index}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                    )}
                    {item.type === 'video' && (
                      <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        <Video size={10} /> 30s max
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                      aria-label={`Remove media ${index + 1}`}
                    >
                      <X size={13} />
                    </button>
                    <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 pt-0 space-y-5">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="w-full min-h-[100px] resize-y text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                maxLength={2000}
              />
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-300">{caption.length}/2000</span>
              </div>

              {/* Audience selector */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Who can see this?</label>
                <div className="grid grid-cols-3 gap-2">
                  {audienceOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAudience(opt.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                          audience === opt.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-100 hover:border-slate-200 text-slate-500'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-xs font-semibold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collaborators */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  Collaborators ({collaborators.length}/10)
                </label>
                <div className="relative">
                  <input
                    value={searchQuery}
                    onChange={(e) => handleCollaboratorSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                    className="input"
                    placeholder="Search people by name or username to invite"
                  />
                  {searchFocused && (searchQuery.trim().length >= 2 || searching) && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl border border-slate-100 shadow-xl max-h-56 overflow-y-auto py-1">
                      {searching ? (
                        <div className="px-4 py-3 text-xs text-slate-400">Searching...</div>
                      ) : searchResults.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-slate-400">No people found</div>
                      ) : (
                        searchResults
                          .filter((u) => u.id !== user?.id && !collaborators.some((c) => c.id === u.id))
                          .map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onMouseDown={() => addCollaborator(u)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 transition-colors text-left"
                            >
                              <UserAvatar src={u.profile_image_url} alt={u.username} size="sm" as="span" />
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-slate-800 truncate">{u.full_name}</span>
                                <span className="block text-xs text-slate-400">@{u.username}</span>
                              </span>
                              <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-primary-600">
                                <Plus size={13} /> Invite
                              </span>
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>

                {collaborators.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {collaborators.map((c) => (
                      <span key={c.id} className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold pl-1.5 pr-2.5 py-1 rounded-full">
                        <UserAvatar src={c.profile_image_url} alt={c.username} size="xs" as="span" />
                        {c.full_name || c.username}
                        <button type="button" onClick={() => removeCollaborator(c.id)} className="text-primary-400 hover:text-red-500 transition-colors" aria-label={`Remove ${c.username}`}>
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    files.forEach((item) => URL.revokeObjectURL(item.url));
                    setFiles([]);
                  }}
                  disabled={publishing}
                  className="btn-secondary rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing || files.length === 0}
                  className="btn-primary rounded-xl px-6"
                >
                  {publishing ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publishing...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Send size={16} /> Publish
                    </span>
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