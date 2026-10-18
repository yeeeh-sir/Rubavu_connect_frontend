import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Accessibility,
  ChevronRight,
  Laptop,
  KeyRound,
  Lock,
  LogOut,
  Moon,
  Save,
  Shield,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppearance } from '../context/AppearanceContext';
import { changePassword, deleteAccount, verifyAccount } from '../api/auth';
import { getPrivacySettings, updatePrivacySettings } from '../api/privacy';
import GoogleIdentityButton from '../components/GoogleIdentityButton';
import { getErrorMessage } from '../utils/format';

export default function Settings() {
  const { user, logout, clearAuth } = useAuth();
  const { theme, setTheme, reducedMotion, setReducedMotion } = useAppearance();
  const navigate = useNavigate();
  const [privacy, setPrivacy] = useState(null);
  const [loadingPrivacy, setLoadingPrivacy] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [message, setMessage] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [verificationPassword, setVerificationPassword] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [deletionConfirmation, setDeletionConfirmation] = useState({
    username: '',
    phrase: '',
  });
  const [deleting, setDeleting] = useState(false);
  const [googleAction, setGoogleAction] = useState(null);

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
    setSavingPrivacy(true);
    setMessage(null);
    try {
      const res = await updatePrivacySettings(privacy);
      setPrivacy(res.data.data.privacy);
      setMessage({ type: 'success', text: 'Privacy settings saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Unable to save privacy settings') });
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handlePasswordChange = useCallback(async (event, googleCredential) => {
    event?.preventDefault();
    setMessage(null);
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage({ type: 'error', text: 'The new passwords do not match.' });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        current_password: googleCredential ? undefined : passwordForm.current_password,
        google_credential: googleCredential,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setGoogleAction(null);
      setMessage({ type: 'success', text: 'Your password has been updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Unable to update your password') });
    } finally {
      setSavingPassword(false);
    }
  }, [passwordForm]);

  const verifyForDeletion = useCallback(async (proof) => {
    setDeleting(true);
    setMessage(null);
    try {
      const response = await verifyAccount(proof);
      setVerificationToken(response.data.data.verification_token);
      setVerificationPassword('');
      setGoogleAction(null);
      setMessage({ type: 'success', text: 'Identity verified. Complete the confirmation below within five minutes.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Unable to verify your account') });
    } finally {
      setDeleting(false);
    }
  }, []);

  const handleDeletionVerification = async (event) => {
    event.preventDefault();
    await verifyForDeletion({ current_password: verificationPassword });
  };

  const handleGoogleCredential = useCallback((credential) => {
    if (googleAction === 'delete') {
      return verifyForDeletion({ google_credential: credential });
    }
    if (googleAction === 'password') {
      return handlePasswordChange(null, credential);
    }
  }, [googleAction, verifyForDeletion, handlePasswordChange]);

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setDeleting(true);
    setMessage(null);
    try {
      await deleteAccount({
        verification_token: verificationToken,
        username: deletionConfirmation.username,
        confirmation: deletionConfirmation.phrase,
      });
      clearAuth();
      navigate('/login', { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setVerificationToken('');
      }
      setMessage({ type: 'error', text: getErrorMessage(err, 'Unable to delete your account') });
    } finally {
      setDeleting(false);
    }
  };

  const toggle = (key) => {
    setPrivacy((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-8">
      <header className="mb-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Your account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile, privacy, and account security.</p>
      </header>

      {message && (
        <div
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`rounded-2xl border px-5 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => navigate('/settings/profile')}
          className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-slate-50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <User size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-800">Edit profile</p>
            <p className="mt-0.5 text-sm text-slate-500">Update your photo, name, username, bio, and interests.</p>
          </div>
          <ChevronRight size={19} className="shrink-0 text-slate-400" />
        </button>
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-primary-600" />
            <p className="font-semibold text-slate-800">Account information</p>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Username</dt>
              <dd className="mt-0.5 font-medium text-slate-800">@{user?.username || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="mt-0.5 break-all font-medium text-slate-800">{user?.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone number</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{user?.phone_number || 'Not added'}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <Sun size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Appearance & accessibility</h2>
            <p className="text-sm text-slate-500">Personalize how Rubavu Connect looks and moves.</p>
          </div>
        </div>
        <div className="space-y-5 p-5">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">Theme</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { value: 'light', label: 'Light', Icon: Sun, detail: 'Bright and clear' },
                { value: 'dark', label: 'Dark', Icon: Moon, detail: 'Comfortable in low light' },
                { value: 'system', label: 'System', Icon: Laptop, detail: 'Follow device settings' },
              ].map(({ value, label, Icon, detail }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={theme === value}
                  onClick={() => setTheme(value)}
                  className={`flex min-h-[76px] items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    theme === value
                      ? 'border-primary-500 bg-primary-50 text-primary-800'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon size={19} className="shrink-0 text-primary-600" />
                  <span>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{detail}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Your choice is saved on this device.</p>
          </fieldset>
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <div className="flex items-start gap-3">
              <Accessibility size={19} className="mt-0.5 shrink-0 text-primary-600" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Reduce motion</p>
                <p className="text-xs text-slate-500">Limit animations and transitions throughout the app.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reducedMotion}
              aria-label="Reduce motion"
              onClick={() => setReducedMotion((enabled) => !enabled)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                reducedMotion ? 'bg-primary-600' : 'bg-slate-200'
              }`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                reducedMotion ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-primary-700">
            <Lock size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Privacy</h2>
            <p className="text-sm text-slate-500">Choose who can reach you on Rubavu Connect.</p>
          </div>
        </div>
        {loadingPrivacy ? (
          <div className="space-y-3 p-5" aria-label="Loading privacy settings">
            <div className="h-4 w-2/5 animate-pulse rounded bg-slate-100" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : privacy ? (
          <div className="space-y-5 p-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Who can message you?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'connections', label: 'Connections only' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrivacy((current) => ({ ...current, who_can_message: option.value }))}
                    className={`rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                      privacy.who_can_message === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Who can send connection requests?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'connections', label: 'People I follow only' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrivacy((current) => ({ ...current, who_can_connect: option.value }))}
                    className={`rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                      privacy.who_can_connect === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Show online status</p>
                <p className="text-xs text-slate-500">Let others see when you are online.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!!privacy.show_online}
                aria-label="Show online status"
                onClick={() => toggle('show_online')}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  privacy.show_online ? 'bg-primary-600' : 'bg-slate-200'
                }`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  privacy.show_online ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleSavePrivacy}
              disabled={savingPrivacy}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl"
            >
              <Save size={16} /> {savingPrivacy ? 'Saving...' : 'Save privacy settings'}
            </button>
          </div>
        ) : (
          <p className="p-5 text-sm text-slate-500">Privacy settings are unavailable right now.</p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <KeyRound size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Change password</h2>
            <p className="text-sm text-slate-500">Confirm it is you before choosing a new password.</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4 p-5">
          <label className="block text-sm font-medium text-slate-700">
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={passwordForm.current_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={passwordForm.new_password}
                onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={passwordForm.confirm_password}
                onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" disabled={savingPassword} className="btn-primary rounded-xl">
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
            <button
              type="button"
              onClick={() => setGoogleAction(googleAction === 'password' ? null : 'password')}
              className="text-sm font-semibold text-primary-700 hover:text-primary-800"
            >
              Verify with Google instead
            </button>
          </div>
          {googleAction === 'password' && (
            <GoogleIdentityButton onCredential={handleGoogleCredential} />
          )}
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-red-100 bg-red-50/70 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
            <AlertTriangle size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-red-900">Delete account</h2>
            <p className="mt-0.5 text-sm text-red-800">
              Permanently remove your account and associated information. This cannot be undone.
            </p>
          </div>
        </div>
        {!verificationToken ? (
          <form onSubmit={handleDeletionVerification} className="space-y-4 p-5">
            <p className="text-sm text-slate-600">First verify your identity with your password or Google account.</p>
            <label className="block text-sm font-medium text-slate-700">
              Current password
              <input
                type="password"
                autoComplete="current-password"
                value={verificationPassword}
                onChange={(event) => setVerificationPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="submit" disabled={deleting || !verificationPassword} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
                {deleting ? 'Verifying...' : 'Verify account'}
              </button>
              <button
                type="button"
                onClick={() => setGoogleAction(googleAction === 'delete' ? null : 'delete')}
                className="text-left text-sm font-semibold text-primary-700 hover:text-primary-800"
              >
                Verify with Google instead
              </button>
            </div>
            {googleAction === 'delete' && <GoogleIdentityButton onCredential={handleGoogleCredential} />}
          </form>
        ) : (
          <form onSubmit={handleDeleteAccount} className="space-y-4 p-5">
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Identity verified. This confirmation expires in five minutes.
            </p>
            <label className="block text-sm font-medium text-slate-700">
              Type your username: <span className="font-bold">@{user?.username}</span>
              <input
                type="text"
                autoComplete="username"
                required
                value={deletionConfirmation.username}
                onChange={(event) => setDeletionConfirmation((current) => ({ ...current, username: event.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Type <span className="font-bold text-red-700">DELETE MY ACCOUNT</span> to confirm
              <input
                type="text"
                required
                value={deletionConfirmation.phrase}
                onChange={(event) => setDeletionConfirmation((current) => ({ ...current, phrase: event.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={deleting || deletionConfirmation.username !== user?.username || deletionConfirmation.phrase !== 'DELETE MY ACCOUNT'}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} /> {deleting ? 'Deleting account...' : 'Permanently delete account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setVerificationToken('');
                  setDeletionConfirmation({ username: '', phrase: '' });
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-800">Sign out</p>
          <p className="mt-0.5 text-sm text-slate-500">Sign out of this Rubavu Connect account on this device.</p>
        </div>
        <button type="button" onClick={handleLogout} className="btn-danger shrink-0">
          <LogOut size={16} /> Logout
        </button>
      </section>
    </div>
  );
}
