import { useState, useEffect, useRef } from 'react';
import { getComments, createComment, deleteComment } from '../api/posts';
import { reportComment } from '../api/reports';
import { Trash2, Send, ImagePlus, Smile, Flag, X } from 'lucide-react';
import UserAvatar from './UserAvatar';
import Loading from './Loading';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import { formatTime, getErrorMessage } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import VoiceRecorder from './VoiceRecorder';

const COMMENT_REPORT_REASONS = ['Spam', 'Harassment or hate speech', 'Inappropriate content', 'Other'];

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [reportFor, setReportFor] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getComments(postId, 1, 50);
      setComments(res.data.data.comments);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load comments'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !file) || posting) return;
    setPosting(true);
    setPostError(null);
    try {
      const res = await createComment(postId, { text, file });
      setComments((prev) => [res.data.data.comment, ...prev]);
      setText('');
      setFile(null);
      setFilePreview(null);
    } catch (err) {
      setPostError(getErrorMessage(err, 'Unable to post comment'));
    } finally {
      setPosting(false);
    }
  };

  const handleVoiceSend = async (blob) => {
    if (posting) return;
    setPosting(true);
    setPostError(null);
    try {
      const voiceFile = new File([blob], 'comment-voice.webm', { type: blob.type });
      const res = await createComment(postId, { text, file: voiceFile });
      setComments((prev) => [res.data.data.comment, ...prev]);
      setText('');
    } catch (err) {
      setPostError(getErrorMessage(err, 'Unable to post voice comment'));
    } finally {
      setPosting(false);
    }
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setPostError('Only images can be attached to comments.');
      event.target.value = '';
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setPostError('Comment images must be 10MB or smaller.');
      event.target.value = '';
      return;
    }
    setFile(selected);
    setFilePreview(URL.createObjectURL(selected));
    setPostError(null);
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete comment'));
    }
  };

  const submitCommentReport = async () => {
    if (!reportFor || !reportReason) return;
    try {
      await reportComment(reportFor.id, reportReason);
      setReportFor(null);
      setReportReason('');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to submit report'));
    }
  };

  return (
    <div className="mt-2">
      {/* Comment form */}
      <form onSubmit={handlePost} className="mb-6">
        <div className="flex items-start gap-3">
          <UserAvatar src={user?.profile_image_url} alt="You" size="sm" />
          <div className="flex-1">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-24 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all"
                maxLength={1000}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-all" aria-label="Attach image">
                  <ImagePlus size={17} />
                </button>
                <button
                  type="submit"
                  className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  disabled={(!text.trim() && !file) || posting}
                  aria-label="Post comment"
                >
                  {posting ? (
                    <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>

            {filePreview && (
              <div className="mt-2 relative inline-block">
                <img src={filePreview} alt="Attachment preview" className="h-20 rounded-xl object-cover border border-slate-200" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setFilePreview(null); }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            )}

            {postError && <p className="text-xs text-red-500 mt-2">{postError}</p>}
          </div>
        </div>
        <div className="ml-11 mt-2 flex items-center gap-2">
          <VoiceRecorder onSend={handleVoiceSend} disabled={posting} />
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <Loading label="Loading comments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadComments} />
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Smile size={20} className="text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-400">No comments yet</p>
          <p className="text-xs text-slate-300 mt-0.5">Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 group/comment">
              <UserAvatar
                src={comment.profile_image_url}
                alt={comment.username}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="bg-slate-50 rounded-2xl px-4 py-3 inline-block max-w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-800">{comment.username}</span>
                    <span className="text-xs text-slate-400">{formatTime(comment.created_at)}</span>
                  </div>
                  {comment.comment_text && (
                    <p className="text-sm text-slate-700 leading-relaxed">{comment.comment_text}</p>
                  )}
                  {comment.media_type === 'image' && comment.media_url && (
                    <img
                      src={comment.media_url}
                      alt="Comment attachment"
                      className="mt-2 max-h-52 rounded-xl object-cover border border-slate-100"
                      loading="lazy"
                    />
                  )}
                  {comment.media_type === 'voice' && comment.media_url && (
                    <div className="mt-2">
                      <audio src={comment.media_url} controls className="w-full max-w-[280px] h-9" />
                    </div>
                  )}
                </div>
                {user?.id === comment.user_id ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="ml-2 mt-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/comment:opacity-100 text-xs font-medium"
                    aria-label="Delete comment"
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReportFor(comment)}
                    className="ml-2 mt-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/comment:opacity-100 text-xs font-medium inline-flex items-center gap-1"
                    aria-label="Report comment"
                  >
                    <Flag size={12} /> Report
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report comment modal */}
      {reportFor && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setReportFor(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Flag size={18} className="text-red-500" /> Report comment
              </h3>
              <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600" onClick={() => setReportFor(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1.5 mb-4">
              {COMMENT_REPORT_REASONS.map((reason) => (
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
            <div className="flex gap-2">
              <button type="button" className="btn-secondary flex-1 rounded-xl" onClick={() => setReportFor(null)}>Cancel</button>
              <button type="button" disabled={!reportReason} onClick={submitCommentReport} className="btn-danger flex-1 rounded-xl">
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
