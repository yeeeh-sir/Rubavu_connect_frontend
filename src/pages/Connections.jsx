import { useCallback, useEffect, useState } from 'react';
import { Check, Inbox, Send, Users, X } from 'lucide-react';
import {
    acceptConnectionRequest,
    getConnectionRequests,
    getConnections,
    rejectConnectionRequest,
    removeConnection,
} from '../api/connections';
import UserAvatar from '../components/UserAvatar';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { getErrorMessage } from '../utils/format';
import { useNavigate } from 'react-router-dom';

export default function Connections() {
    const navigate = useNavigate();
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    const [connections, setConnections] = useState([]);
    const [activeTab, setActiveTab] = useState('received');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [incoming, outgoing, accepted] = await Promise.all([
                getConnectionRequests('received'),
                getConnectionRequests('sent'),
                getConnections(),
            ]);
            setReceived(incoming.data.data.requests || []);
            setSent(outgoing.data.data.requests || []);
            setConnections(accepted.data.data.connections || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Unable to load connections'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const updateRequest = async (requestId, action) => {
        try {
            if (action === 'accept') await acceptConnectionRequest(requestId);
            else await rejectConnectionRequest(requestId);
            await load();
        } catch (err) {
            setError(getErrorMessage(err, 'Unable to update connection request'));
        }
    };

    const remove = async (userId) => {
        try {
            await removeConnection(userId);
            await load();
        } catch (err) {
            setError(getErrorMessage(err, 'Unable to remove connection'));
        }
    };

    const tabs = [
        { id: 'received', label: 'Requests', icon: Inbox, count: received.length },
        { id: 'sent', label: 'Sent', icon: Send, count: sent.length },
        { id: 'connections', label: 'My connections', icon: Users, count: connections.length },
    ];

    const rows = activeTab === 'received' ? received : activeTab === 'sent' ? sent : connections;

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="headline-font text-3xl font-extrabold text-primary-900">Connections</h1>
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">{tabs.map(({ id, label, icon: Icon, count }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${activeTab === id ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-primary-50 hover:text-primary-700'}`}><Icon size={16} />{label}<span className="rounded-full bg-white/20 px-1.5 text-xs">{count}</span></button>)}</div>
            {loading ? <Loading label="Loading your connections..." /> : error ? <ErrorState message={error} onRetry={load} /> : rows.length === 0 ? <EmptyState icon={Users} message={activeTab === 'connections' ? 'Your circle is ready for new connections.' : 'No connection requests here.'} /> : <div className="card divide-y divide-slate-100">{rows.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 p-4"><button type="button" className="flex min-w-0 items-center gap-3 text-left" onClick={() => navigate(`/profile/${item.username}`)}><UserAvatar src={item.profile_image_url} alt={item.username} size="lg" /><span className="min-w-0"><strong className="block truncate text-sm text-primary-900">{item.full_name || item.username}</strong><span className="block truncate text-xs text-slate-500">@{item.username}</span></span></button>{activeTab === 'received' ? <span className="flex items-center gap-2"><button type="button" onClick={() => updateRequest(item.id, 'accept')} className="rounded-full bg-accent-600 p-2 text-white hover:bg-accent-700" aria-label="Accept connection"><Check size={16} /></button><button type="button" onClick={() => updateRequest(item.id, 'reject')} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-red-600" aria-label="Reject connection"><X size={16} /></button></span> : activeTab === 'sent' ? <span className="text-xs font-bold text-primary-600">Request pending</span> : <button type="button" onClick={() => remove(item.user_id)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:border-red-200 hover:text-red-600">Remove</button>}</div>)}</div>}
        </div>
    );
}
