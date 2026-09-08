import { useEffect, useState } from 'react';
import { Check, UserPlus, UserRoundMinus, X } from 'lucide-react';
import {
    acceptConnectionRequest,
    cancelConnectionRequest,
    getConnectionStatus,
    rejectConnectionRequest,
    removeConnection,
    sendConnectionRequest,
} from '../api/connections';
import { getErrorMessage } from '../utils/format';

export default function ConnectionButton({ userId, initialStatus = null, onChanged, size = 'md' }) {
    const [status, setStatus] = useState(initialStatus);
    const [requestId, setRequestId] = useState(null);
    const [loading, setLoading] = useState(!initialStatus);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        if (initialStatus) {
            setStatus(initialStatus);
            setLoading(false);
            return undefined;
        }
        getConnectionStatus(userId)
            .then((response) => {
                if (!active) return;
                setStatus(response.data.data.status);
                setRequestId(response.data.data.request_id);
            })
            .catch((err) => active && setError(getErrorMessage(err, 'Unable to load connection status')))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [initialStatus, userId]);

    const run = async (action, nextStatus) => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const response = await action();
            setStatus(nextStatus);
            if (response?.data?.data?.request?.id) setRequestId(response.data.data.request.id);
            onChanged?.(nextStatus);
        } catch (err) {
            setError(getErrorMessage(err, 'Connection action failed'));
        } finally {
            setLoading(false);
        }
    };

    const compact = size === 'sm';
    const base = compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

    if (status === 'accepted') {
        return <button type="button" disabled={loading} onClick={() => run(() => removeConnection(userId), 'none')} className={`inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 ${base} font-bold text-accent-700 hover:bg-red-50 hover:text-red-600`}><Check size={15} /> Connected</button>;
    }
    if (status === 'pending_sent') {
        return <button type="button" disabled={loading} onClick={() => run(() => cancelConnectionRequest(requestId), 'none')} className={`inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 ${base} font-bold text-primary-700 hover:bg-red-50 hover:text-red-600`}><UserPlus size={15} /> Cancel request</button>;
    }
    if (status === 'pending_received') {
        return <span className="inline-flex items-center gap-1"><button type="button" disabled={loading} onClick={() => run(() => acceptConnectionRequest(requestId), 'accepted')} className={`inline-flex items-center gap-1 rounded-full bg-accent-600 ${base} font-bold text-white hover:bg-accent-700`}><Check size={14} /> Accept</button><button type="button" disabled={loading} onClick={() => run(() => rejectConnectionRequest(requestId), 'rejected')} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-red-600" aria-label="Reject connection request"><X size={15} /></button></span>;
    }
    if (status === 'rejected') {
        return <button type="button" disabled={loading} onClick={() => run(() => sendConnectionRequest(userId), 'pending_sent')} className={`inline-flex items-center gap-2 rounded-full bg-primary-600 ${base} font-bold text-white hover:bg-primary-700`}><UserPlus size={15} /> Connect</button>;
    }

    return <span className="inline-flex items-center gap-1"><button type="button" disabled={loading} onClick={() => run(() => sendConnectionRequest(userId), 'pending_sent')} className={`inline-flex items-center gap-2 rounded-full bg-primary-600 ${base} font-bold text-white hover:bg-primary-700`}><UserPlus size={15} /> {loading ? 'Loading' : 'Connect'}</button>{error && <span className="sr-only">{error}</span>}</span>;
}
