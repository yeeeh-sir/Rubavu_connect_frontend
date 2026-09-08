import { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Search, UserPlus, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPosts } from '../api/posts';
import { getStatuses } from '../api/status';
import { getConnections } from '../api/connections';
import PostCard from '../components/PostCard';
import StatusList from '../components/StatusList';
import StatusViewer from '../components/StatusViewer';
import StatusComposer from '../components/StatusComposer';
import UserAvatar from '../components/UserAvatar';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { getErrorMessage } from '../utils/format';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewingStatus, setViewingStatus] = useState(null);

    const loadHome = useCallback(async () => {
        setLoading(true);
        try {
            const [postResponse, connectionResponse] = await Promise.all([getPosts(1, 20), getConnections(1, 6)]);
            setPosts(postResponse.data.data.posts || []);
            setConnections(connectionResponse.data.data.connections || []);
            setError(null);
        } catch (err) {
            setError(getErrorMessage(err, 'Unable to load your home'));
        } finally {
            setLoading(false);
        }
    }, []);

    const loadStatuses = useCallback(async () => {
        try {
            const response = await getStatuses();
            setStatuses(response.data.data.statuses || []);
        } catch (err) {
            console.error('Failed to load statuses:', err.message);
        } finally {
            setStatusLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHome();
        loadStatuses();
    }, [loadHome, loadStatuses]);

    if (error && !posts.length && !connections.length) return <ErrorState message={error} onRetry={loadHome} />;

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-12 px-4">
            {viewingStatus && <StatusViewer statuses={statuses} initialIndex={statuses.findIndex((status) => status.id === viewingStatus.id)} onClose={() => setViewingStatus(null)} />}

            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
                <div>
                    <p className="text-sm font-semibold text-accent-600 flex items-center gap-1.5">
                        <Sparkles size={14} /> Welcome back
                    </p>
                    <h1 className="headline-font mt-1 text-3xl font-extrabold text-primary-900">Your home</h1>
                </div>
                <div className="flex gap-2">
                    <Link to="/discover" className="btn-primary rounded-full text-sm">
                        <Search size={16} /> Discover
                    </Link>
                    <Link to="/create" className="btn-secondary rounded-full text-sm">
                        <UserPlus size={16} /> Post
                    </Link>
                </div>
            </header>

            {connections.length > 0 && (
                <section aria-labelledby="connections-title">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 id="connections-title" className="text-lg font-extrabold text-primary-900 headline-font">Your Connections</h2>
                        <Link to="/connections" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">View all</Link>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {connections.map((connection) => (
                            <div key={connection.id} className="card flex items-center justify-between gap-3 p-4 hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300">
                                <Link to={`/profile/${connection.username}`} className="flex min-w-0 items-center gap-3">
                                    <UserAvatar src={connection.profile_image_url} alt={connection.username} size="md" />
                                    <span className="min-w-0">
                                        <strong className="block truncate text-sm text-primary-900">{connection.full_name || connection.username}</strong>
                                        <span className="block truncate text-xs text-slate-500">@{connection.username}</span>
                                    </span>
                                </Link>
                                <Link to={`/messages/${connection.user_id}`} className="rounded-full bg-primary-50 p-2.5 text-primary-600 hover:bg-primary-100 transition-colors" aria-label={`Message ${connection.username}`}>
                                    <MessageCircle size={17} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {(statusLoading || statuses.length > 0) && (
                <section aria-labelledby="status-title">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 id="status-title" className="text-lg font-extrabold text-primary-900 headline-font">Status</h2>
                        <StatusComposer onCreated={loadStatuses} />
                    </div>
                    <div className="card p-3">
                        <StatusList statuses={statuses} loading={statusLoading} onViewStatus={setViewingStatus} />
                    </div>
                </section>
            )}

            <section aria-labelledby="posts-title">
                <div className="mb-5 flex items-center justify-between">
                    <h2 id="posts-title" className="text-lg font-extrabold text-primary-900 headline-font">Recent Posts</h2>
                    <Link to="/create" className="text-sm font-bold text-accent-600 hover:text-accent-700 transition-colors flex items-center gap-1">
                        <Sparkles size={14} /> Create post
                    </Link>
                </div>
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                <div className="p-5 flex items-center gap-3">
                                    <div className="skeleton w-10 h-10 rounded-full" />
                                    <div className="space-y-2">
                                        <div className="skeleton h-3 w-32 rounded" />
                                        <div className="skeleton h-2 w-24 rounded" />
                                    </div>
                                </div>
                                <div className="skeleton h-80 w-full rounded-none" />
                                <div className="p-5 space-y-3">
                                    <div className="skeleton h-3 w-20 rounded" />
                                    <div className="skeleton h-3 w-48 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <EmptyState icon={Users} message="No posts yet." />
                ) : (
                    <div className="max-w-2xl space-y-6">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} onUpdated={() => {}} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
