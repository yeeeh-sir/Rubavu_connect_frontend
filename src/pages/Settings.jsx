import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronRight, Shield, Lock, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPrivacySettings, updatePrivacySettings } from '../api/privacy';
import { getErrorMessage } from '../utils/format';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [privacy, setPrivacy] = useState(null);
  const [loadingPrivacy, setLoadingPrivacy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getPrivacySettings()
      .then((res) => setPrivacy(res.data.data.privacy))
      .catch((err) => setMessage({ type: 'error', text: getErrorMessage(err, 'Unable to load privacy settings') }))
      .finally(() => setLoadingPrivacy(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSavePrivacy = async () => {
    if (!privacy) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await updatePrivacySettings(privacy);
      setPrivacy(res.data.data.privacy);
      setMessage({ type: 'success', text: 'Privacy settings saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Unable to save privacy settings') });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key) => {
    setPrivacy((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Settings</h1>

      {message && (
        <div className={`mb-4 rounded-2xl px-5 py-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="card divide-y divide-slate-100">
        <button
          type="button"
          onClick={() => navigate('/settings/profile')}
          className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
            <User size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-slate-800">Edit Profile</p>
            <p className="text-xs text-slate-500">Change your photo, name, username, bio and interests</p>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/settings/profile')}
          className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-slate-800">Account</p>
            <p className="text-xs text-slate-500">Account information and preferences</p>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>

      {/* Privacy */}
      <div className="card mt-4">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
            <Lock size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Privacy</p>
            <p className="text-xs text-slate-500">Who can reach you on Rubavu Connect</p>
          </div>
        </div>

        {loadingPrivacy ? (
          <div className="p-6 text-sm text-slate-400">Loading privacy settings...</div>
        ) : (
          <div className="p-4 space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Who can message you?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'connections', label: 'Connections only' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPrivacy((p) => ({ ...p, who_can_message: opt.value }))}
                    className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all text-left ${
                      privacy?.who_can_message === opt.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Who can send you connection requests?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'connections', label: 'People I follow only' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPrivacy((p) => ({ ...p, who_can_connect: opt.value }))}
                    className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all text-left ${
                      privacy?.who_can_connect === opt.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Show online status</p>
                <p className="text-xs text-slate-400">Let others see when you are online</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!!privacy?.show_online}
                onClick={() => toggle('show_online')}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${privacy?.show_online ? 'bg-primary-600' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${privacy?.show_online ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSavePrivacy}
              disabled={saving}
              className="btn-primary w-full rounded-xl inline-flex items-center justify-center gap-2"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save privacy settings'}
            </button>
          </div>
        )}
      </div>

      <div className="card p-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">Signed in as</p>
            <p className="text-xs text-slate-500">@{user?.username}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-danger"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}