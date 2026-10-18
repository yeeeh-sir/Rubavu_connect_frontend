import { useEffect, useState } from 'react';
import { Save, Lock } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { can } from '../permissions';
import {
  useAsync, PageHeader, ErrorBox, StatusPill,
} from '../components';

function isSettingEnabled(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export default function SettingsPage() {
  const { user: me } = useAuth();
  const { loading, error, data, reload } = useAsync(() => adminApi.getAdminSettings(), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const canWrite = can(me, 'settings.write');
  const canSensitive = can(me, 'settings.sensitive');

  useEffect(() => {
    if (data?.settings) {
      setForm({
        site_name: data.settings.site_name || '',
        site_tagline: data.settings.site_tagline || '',
        community_guidelines: data.settings.community_guidelines || '',
        registration_enabled: isSettingEnabled(data.settings.registration_enabled),
        maintenance_mode: isSettingEnabled(data.settings.maintenance_mode),
      });
    }
  }, [data]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const payload = {
        site_name: form.site_name,
        site_tagline: form.site_tagline,
        community_guidelines: form.community_guidelines,
      };
      if (canSensitive) {
        payload.registration_enabled = form.registration_enabled;
        payload.maintenance_mode = form.maintenance_mode;
      }
      await adminApi.updateAdminSettings(payload);
      setSaved(true);
      reload();
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !form) {
    return (
      <div>
        <PageHeader title="System Settings" />
        <div className="admin-panel" style={{ height: 240 }} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="System Settings"
        subtitle="Site-wide configuration"
        actions={
          <StatusPill tone={data?.settings?.maintenance_mode === '1' || data?.settings?.maintenance_mode === 1 ? 'red' : 'green'}>
            {data?.settings?.maintenance_mode === '1' || data?.settings?.maintenance_mode === 1
              ? 'Maintenance ON'
              : 'All systems normal'}
          </StatusPill>
        }
      />
      <ErrorBox message={error || saveError} onRetry={reload} />

      {form && (
        <form onSubmit={save} className="admin-panel" style={{ maxWidth: 720 }}>
          {!canWrite && (
            <div
              className="flex items-center gap-2 mb-4"
              style={{ fontSize: '0.82rem', color: '#92400e', background: 'rgba(217,119,6,.08)', borderRadius: 10, padding: '0.6rem 0.8rem' }}
            >
              <Lock size={15} /> You have read-only access to settings.
            </div>
          )}

          <div className="admin-field mb-4">
            <label>Site name</label>
            <input
              className="admin-input"
              value={form.site_name}
              onChange={(e) => set('site_name', e.target.value)}
              disabled={!canWrite}
            />
          </div>

          <div className="admin-field mb-4">
            <label>Tagline</label>
            <input
              className="admin-input"
              value={form.site_tagline}
              onChange={(e) => set('site_tagline', e.target.value)}
              disabled={!canWrite}
            />
          </div>

          <div className="admin-field mb-4">
            <label>Community guidelines</label>
            <textarea
              className="admin-textarea"
              rows={7}
              value={form.community_guidelines}
              onChange={(e) => set('community_guidelines', e.target.value)}
              disabled={!canWrite}
            />
          </div>

          <div
            className="mb-5"
            style={{
              border: canSensitive ? '1px solid #e6ebf2' : '1px dashed #cbd5e1',
              borderRadius: 12,
              padding: '0.9rem 1rem',
            }}
          >
            <div className="flex items-center gap-2 mb-3" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              <Lock size={13} /> Sensitive settings
              {!canSensitive && <StatusPill tone="amber">Super admin only</StatusPill>}
            </div>

            <label className="flex items-center gap-3 mb-3" style={{ fontSize: '0.875rem', color: '#1d2b3f', opacity: canSensitive ? 1 : 0.55 }}>
              <input
                type="checkbox"
                checked={form.registration_enabled}
                onChange={(e) => set('registration_enabled', e.target.checked)}
                disabled={!canSensitive}
              />
              Allow new registrations
            </label>

            <label className="flex items-center gap-3" style={{ fontSize: '0.875rem', color: '#1d2b3f', opacity: canSensitive ? 1 : 0.55 }}>
              <input
                type="checkbox"
                checked={form.maintenance_mode}
                onChange={(e) => set('maintenance_mode', e.target.checked)}
                disabled={!canSensitive}
              />
              Maintenance mode (only auth + admin routes stay up)
            </label>
          </div>

          {canWrite && (
            <div className="flex items-center gap-3">
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                <Save size={15} /> {saving ? 'Saving…' : 'Save settings'}
              </button>
              {saved && <span style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 700 }}>Saved.</span>}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
