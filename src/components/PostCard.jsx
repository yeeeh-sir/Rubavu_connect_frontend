import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Trash2, Bookmark, MoreHorizontal, Flag, Users, UserPlus, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { likePost, unlikePost, deletePost, updateCollaboratorStatus, reportPost } from '../api/posts';
import { formatTime, formatCount, getErrorMessage } from '../utils/format';
import UserAvatar from './UserAvatar';
import PostMedia from './PostMedia';
import { useAuth } from '../context/AuthContext';
import { usePresence } from '../context/PresenceContext';

const REPORT_REASONS = ['Spam', 'Harassment or hate speech', 'Violence', 'Inappropriate content', 'Copyright', 'Other'];

export default function PostCard({ post, onUpdated }) {
  const { user } = useAuth();
  const { isOnline } = usePresence();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [liking, setLiking] = useState(false);
  const [error, setError] = useState(null);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [menuOpen]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    setError(null);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      const res = wasLiked ? await unlikePost(post.id) : await likePost(post.id);
      setLikesCount(res.data.data.likes_count);
    } catch (err) {
      setLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
      setError(getErrorMessage(err, 'Unable to like post'));
    } finally {
      setLiking(false);
      onUpdated?.();
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Rubavu Connect Post', url });
      } else {
        await navigator.clipboard.writeText(url);
        window.alert('Link copied to clipboard');
      }
    } catch (_) {}
  };

  const handleCollabAction = async (action) => {
    setError(null);
    try {
      await updateCollaboratorStatus(post.id, action);
      onUpdated?.();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to update collaboration'));
    }
  };

  const submitReport = async () => {
    if (!reportReason) return;
    setReporting(true);
    try {
      await reportPost(post.id, reportReason);
      setReportDone(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to submit report'));
    } finally {
      setReporting(false);
    }
  };

  const isOwn = user && user.id === post.user?.id;

  const collaborators = post.collaborators || [];

  return (
    <article className="post-card bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/5">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="ring-2 ring-primary-100 rounded-full p-0.5">
            <UserAvatar
              src={post.user?.profile_image_url}
              alt={post.user?.username}
              size="md"
              online={isOnline(post.user?.id) || post.user?.is_online === 1}
              onClick={() => navigate(`/profile/${post.user?.username}`)}
            />
          </div>
          <div className="min-w-0">
            <button
              type="button"
              className="font-bold text-[15px] text-slate-900 hover:text-primary-600 transition-colors truncate block"
              onClick={() => navigate(`/profile/${post.user?.username}`)}
            >
              {post.user?.full_name || post.user?.username}
            </button>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>@{post.user?.username}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>{formatTime(post.created_at)}</span>
              {post.audience !== 'public' && (
                <>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span>{post.audience === 'private' ? 'Only me' : 'Connections'}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200"
            aria-label="Post menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MoreHorizontal size={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-100 shadow-xl z-30 py-1.5 overflow-hidden animate-fade-in">
              {isOwn ? (
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={async () => {
                    setMenuOpen(false);
                    if (window.confirm('Delete this post?')) {
                      try {
                        await deletePost(post.id);
                        navigate('/');
                      } catch (err) {
                        setError(getErrorMessage(err, 'Failed to delete post'));
                      }
                    }
                  }}
                >
                  <Trash2 size={16} /> Delete post
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                    setReportReason('');
                    setReportDone(false);
                  }}
                >
                  <Flag size={16} /> Report post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collaborative post badge */}
      {collaborators.length > 0 && (
        <div className="px-5 pb-3 flex items-center gap-2 -mt-1">
          <Users size={14} className="text-primary-500" />
          <span className="text-xs font-semibold text-slate-500">With</span>
          <div className="flex -space-x-2 items-center">
            {collaborators.slice(0, 5).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/profile/${c.username}`)}
                className="rounded-full ring-2 ring-white transition-transform hover:scale-105"
                title={c.full_name || c.username}
              >
                <span className="block h-6 w-6 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                  {c.profile_image_url ? (
                    <img src={c.profile_image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Users size={12} className="text-slate-400" />
                  )}
                </span>
              </button>
            ))}
          </div>
          {collaborators.length > 5 && (
            <span className="text-xs font-bold text-slate-400">+{collaborators.length - 5}</span>
          )}
        </div>
      )}

      {/* Pending invitation prompt */}
      {post.collaborator_invited && user && !isOwn && (
        <div className="mx-5 mt-1 mb-1 flex items-center gap-2 rounded-xl bg-accent-50/60 px-4 py-2.5">
          <UserPlus size={15} className="text-accent-600 shrink-0" />
          <span className="text-xs font-semibold text-accent-700 flex-1">You were invited to collaborate on this post</span>
          <button
            type="button"
            onClick={() => handleCollabAction('accept')}
            className="inline-flex items-center gap-1 rounded-lg bg-accent-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-accent-700 transition-colors"
          >
            <Check size={13} /> Accept
          </button>
          <button
            type="button"
            onClick={() => handleCollabAction('decline')}
            className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={13} /> Decline
          </button>
        </div>
      )}

      {/* Media - Full width HD */}
      <PostMedia
        mediaUrl={post.media_url}
        mediaType={post.media_type}
        thumbnailUrl={post.thumbnail_url}
        media={post.media}
        className="w-full"
      />

      {/* Actions */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleLike}
              disabled={liking}
              className={`post-action-btn group/btn relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                liked
                  ? 'text-red-500 bg-red-50'
                  : 'text-slate-500 hover:text-red-500 hover:bg-red-50'
              }`}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <Heart
                size={22}
                fill={liked ? 'currentColor' : 'none'}
                className={`transition-transform duration-300 ${liked ? 'like-bounce' : 'group-hover/btn:scale-110'}`}
              />
              <span className="text-sm font-semibold">{formatCount(likesCount)}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/post/${post.id}`)}
              className="post-action-btn group/btn flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
              aria-label="Comments"
            >
              <MessageCircle size={22} className="group-hover/btn:scale-110 transition-transform duration-200" />
              <span className="text-sm font-semibold">{formatCount(post.comments_count)}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="post-action-btn group/btn flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-accent-600 hover:bg-accent-50 transition-all duration-200"
              aria-label="Share"
            >
              <Share2 size={20} className="group-hover/btn:scale-110 transition-transform duration-200" />
            </button>
          </div>
          <button
            type="button"
            className="post-action-btn group/btn p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
            aria-label="Save"
          >
            <Bookmark size={20} className="group-hover/btn:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Caption & Details */}
      <div className="px-5 pb-5">
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

        {post.caption && (
          <div className="mt-1">
            <p className={`text-[14px] leading-relaxed text-slate-700 ${!showFullCaption && post.caption.length > 150 ? 'line-clamp-2' : ''}`}>
              <span
                className="font-bold text-slate-900 mr-1.5 cursor-pointer hover:text-primary-600 transition-colors"
                onClick={() => navigate(`/profile/${post.user?.username}`)}
              >
                {post.user?.username}
              </span>
              {post.caption}
            </p>
            {post.caption.length > 150 && (
              <button
                type="button"
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="text-xs font-semibold text-slate-400 hover:text-primary-500 mt-1 transition-colors"
              >
                {showFullCaption ? 'Show less' : '...more'}
              </button>
            )}
          </div>
        )}

        {post.comments_count > 0 && (
          <button
            type="button"
            onClick={() => navigate(`/post/${post.id}`)}
            className="text-sm font-medium text-slate-400 hover:text-primary-500 mt-2 transition-colors"
          >
            View all {formatCount(post.comments_count)} comments
          </button>
        )}
      </div>

      {/* Report modal */}
      {reportOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setReportOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {reportDone ? (
              <div className="text-center py-6">
                <span className="inline-flex h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center mb-3">
                  <Check size={24} />
                </span>
                <p className="font-bold text-slate-900">Report submitted</p>
                <p className="text-sm text-slate-500 mt-1">Our team will review this post.</p>
                <button type="button" className="btn-primary w-full mt-4 rounded-xl" onClick={() => setReportOpen(false)}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Flag size={18} className="text-red-500" /> Report post
                  </h3>
                  <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600" onClick={() => setReportOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-1.5 mb-4">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setReportReason(reason)}
                      className={`w-full text-left text-sm px-3 py-2.5 rounded-xl border transition-all ${
                        reportReason === reason
                          ? 'border-red-300 bg-red-50 text-red-700 font-semibold'
                          : 'border-slate-100 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!reportReason || reporting}
                  onClick={submitReport}
                  className="btn-danger w-full rounded-xl"
                >
                  {reporting ? 'Submitting...' : 'Submit report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}