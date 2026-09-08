import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, getUserPosts } from '../api/users';
import ProfileHeader from '../components/ProfileHeader';
import PostCard from '../components/PostCard';
import { ProfileSkeleton, GridSkeleton } from '../components/Skeletons';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { getErrorMessage } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { Grid3X3, Film, Users, Image as ImageIcon, Play } from 'lucide-react';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [view, setView] = useState('grid');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserProfile(username);
      setProfile(res.data.data.user);
    } catch (err) {
      setError(getErrorMessage(err, 'User not found'));
    } finally {
      setLoading(false);
    }
  }, [username]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await getUserPosts(username, 1, 50);
      setPosts(res.data.data.posts);
    } catch (err) {
      console.error('Failed to load user posts:', err.message);
    } finally {
      setPostsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [loadProfile, loadPosts, username]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return <ErrorState message={error || 'User not found'} onRetry={loadProfile} />;
  }

  const isOwn = user && profile.id === user.id;

  const handleFollowToggle = (following) => {
    setProfile((prev) => ({
      ...prev,
      is_following: following,
      follower_count: (prev.follower_count || 0) + (following ? 1 : -1),
    }));
  };

  const filteredPosts = view === 'videos' ? posts.filter((p) => p.media_type === 'video') : posts;
  const displayPosts = view === 'videos' ? filteredPosts : posts;

  const postCover = (post) => {
    const media = post.media && post.media.length ? post.media : [];
    return {
      type: media[0]?.media_type || post.media_type,
      url: media[0]?.media_url || post.media_url,
      count: media.length,
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <ProfileHeader
        profile={profile}
        isOwn={isOwn}
        onFollowToggle={handleFollowToggle}
      />

      {/* Tab switcher */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setView('grid')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            view === 'grid'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600'
          }`}
        >
          <Grid3X3 size={16} /> Grid
        </button>
        <button
          type="button"
          onClick={() => setView('videos')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            view === 'videos'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600'
          }`}
        >
          <Film size={16} /> Videos
        </button>
      </div>

      {postsLoading ? (
        <GridSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState message={isOwn ? "You haven't posted anything yet" : `${profile.username} hasn't posted anything yet`} />
      ) : displayPosts.length === 0 && view === 'videos' ? (
        <EmptyState message="No videos yet" />
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
          {displayPosts.map((post) => {
            const cover = postCover(post);
            const isVideo = cover.type === 'video';
            return (
              <button
                key={post.id}
                type="button"
                onClick={() => navigate(`/post/${post.id}`)}
                className="relative aspect-square overflow-hidden group profile-grid-item bg-slate-100"
                aria-label={`Open post ${post.id}`}
              >
                {!isVideo ? (
                  <img
                    src={cover.url}
                    alt="Post thumbnail"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={cover.url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-2.5 right-2.5">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                        <Film size={12} className="text-white" />
                        <span className="text-[10px] font-bold text-white">HD</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {cover.count > 1 && (
                  <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm rounded-lg px-1.5 py-0.5 flex items-center gap-1">
                    <ImageIcon size={11} className="text-white" />
                    <span className="text-[10px] font-bold text-white">{cover.count}</span>
                  </div>
                )}

                {(post.collaborators?.length > 0) && (
                  <div className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-sm rounded-lg px-1.5 py-0.5 flex items-center gap-1">
                    <Users size={11} className="text-white" />
                    <span className="text-[10px] font-bold text-white">{post.collaborators.length}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-4 text-white text-sm font-semibold drop-shadow-lg">
                    <span className="flex items-center gap-1.5">
                      {isVideo ? <Play size={16} /> : <ImageIcon size={16} />}
                      {isVideo ? 'Play' : 'View'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
