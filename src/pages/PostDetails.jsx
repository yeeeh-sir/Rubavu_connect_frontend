import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getPost } from '../api/posts';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { getErrorMessage } from '../utils/format';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPost(id);
      setPost(res.data.data.post);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load post'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <Loading label="Loading post..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <ErrorState message={error || 'Post not found'} onRetry={loadPost} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 mb-6 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <PostCard post={post} onUpdated={loadPost} />

      <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary-500 rounded-full" />
          Comments
        </h2>
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
