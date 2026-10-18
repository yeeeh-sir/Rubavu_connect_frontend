import { useCallback, useEffect, useState } from 'react';
import {
    ArrowRight,
    Compass,
    MessageCircle,
    PenSquare,
    Search,
    Sparkles,
    Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPosts } from '../api/posts';
import { getStatuses } from '../api/status';
import { getConnections } from '../api/connections';
import PostCard from '../components/PostCard';
import StatusList from '../components/StatusList';
import StatusViewer from '../components/StatusViewer';
import StatusComposer from '../components/StatusComposer';
import UserAvatar from '../components/UserAvatar';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { PostCardSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/format';

export default function Home() {
    const { user } = useAuth();
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
            const [postResponse, connectionResponse] = await Promise.all([
                getPosts(1, 20),
                getConnections(1, 6),
            ]);
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

    if (error && !posts.length && !connections.length) {
        return <ErrorState message={error} onRetry={loadHome} />;
    }

    const firstName = user?.full_name?.trim().split(/\s+/)[0] || user?.username || 'there';

    return (
        <div className="home-layout">
            {viewingStatus && (
                <StatusViewer
                    statuses={statuses}
                    initialIndex={statuses.findIndex((status) => status.id === viewingStatus.id)}
                    onClose={() => setViewingStatus(null)}
                />
            )}

            <div className="home-grid">
                <div className="home-main">
                    {(statusLoading || statuses.length > 0) && (
                        <section className="home-section" aria-labelledby="status-title">
                            <div className="home-section-heading">
                                <div>
                                    <p className="home-section-kicker">MOMENTS</p>
                                    <h2 id="status-title">Stories from your circle</h2>
                                </div>
                                <StatusComposer onCreated={loadStatuses} />
                            </div>
                            <div className="home-status-panel">
                                <StatusList
                                    statuses={statuses}
                                    loading={statusLoading}
                                    onViewStatus={setViewingStatus}
                                />
                            </div>
                        </section>
                    )}

                    <section className="home-section" aria-labelledby="posts-title">
                        <div className="home-section-heading">
                            <div>
                                <p className="home-section-kicker">THE LATEST</p>
                                <h2 id="posts-title">Your feed</h2>
                            </div>
                            <Link to="/create" className="home-text-link">
                                Share a moment <ArrowRight size={15} />
                            </Link>
                        </div>
                        {error && (
                            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                {error}
                            </p>
                        )}
                        {loading ? (
                            <div className="space-y-5" aria-label="Loading posts">
                                {[1, 2].map((index) => <PostCardSkeleton key={index} />)}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="home-empty">
                                <EmptyState icon={Users} message="Your feed is ready for its first moment." />
                                <p className="home-empty-copy">Find people to connect with or share something with your community.</p>
                                <div className="home-empty-actions">
                                    <Link to="/discover" className="home-button home-button-primary">
                                        <Search size={16} /> Discover people
                                    </Link>
                                    <Link to="/create" className="home-text-link">Create a post <ArrowRight size={15} /></Link>
                                </div>
                            </div>
                        ) : (
                            <div className="home-post-list">
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post} onUpdated={() => {}} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <aside className="home-aside" aria-label="Your community">
                    <section className="home-aside-card">
                        <div className="home-aside-heading">
                            <div>
                                <p className="home-section-kicker">PEOPLE</p>
                                <h2>Connections</h2>
                            </div>
                            <Users size={18} />
                        </div>
                        {connections.length > 0 ? (
                            <div className="home-connection-list">
                                {connections.map((connection) => (
                                    <div key={connection.id} className="home-connection">
                                        <Link
                                            to={`/profile/${connection.username}`}
                                            className="home-connection-person"
                                        >
                                            <UserAvatar
                                                src={connection.profile_image_url}
                                                alt={connection.full_name || connection.username}
                                                size="md"
                                                as="span"
                                            />
                                            <span className="home-connection-name">
                                                <strong>{connection.full_name || connection.username}</strong>
                                                <span>@{connection.username}</span>
                                            </span>
                                        </Link>
                                        <Link
                                            to={`/messages/${connection.user_id}`}
                                            className="home-message-link"
                                            aria-label={`Message ${connection.username}`}
                                        >
                                            <MessageCircle size={17} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="home-connections-empty">
                                <p>No connections yet.</p>
                                <Link to="/discover" className="home-text-link">
                                    Find people <ArrowRight size={15} />
                                </Link>
                            </div>
                        )}
                        {connections.length > 0 && (
                            <Link to="/connections" className="home-aside-footer">
                                View all connections <ArrowRight size={15} />
                            </Link>
                        )}
                    </section>

                    <section className="home-discover-card">
                        <span className="home-discover-icon"><Compass size={19} /></span>
                        <h2>Discover new people</h2>
                        <p>Find people and start meaningful conversations.</p>
                        <Link to="/discover" className="home-discover-link">
                            Explore the community <ArrowRight size={15} />
                        </Link>
                    </section>
                </aside>
            </div>
        </div>
    );
}
