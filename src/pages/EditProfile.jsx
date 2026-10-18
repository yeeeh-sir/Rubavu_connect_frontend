import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Phone, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadProfileImage } from '../api/users';
import { getErrorMessage } from '../utils/format';

export default function EditProfile() {
  const { user, setUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', username: '', email: '', phone_number: '', bio: '', interests: '' });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const interests = Array.isArray(user.interests)
        ? user.interests.join(', ')
        : user.interests
          ? String(user.interests)
          : '';
      setForm({
        full_name: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        bio: user.bio || '',
        interests,
      });
      setPreviewImage(user.profile_image_url || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Profile image must be a JPG, PNG or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Profile image is too large. Maximum size is 10MB.');
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setUploadingImage(true);
    setError(null);

    try {
      const res = await uploadProfileImage(file);
      const updatedUser = res.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile picture updated!');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to upload profile picture'));
      setPreviewImage(user?.profile_image_url || null);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.username.trim()) newErrors.username = 'Username is required';
    else if (form.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_.]+$/.test(form.username)) newErrors.username = 'Only letters, numbers, dots, and underscores';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = 'Enter a valid email address';
    if (form.phone_number.trim()) {
      const phone = form.phone_number.trim().replace(/[()\s.-]/g, '');
      if (!/^\+?\d{7,15}$/.test(phone)) newErrors.phone_number = 'Enter a valid phone number with 7 to 15 digits';
    }
    if (form.bio.length > 500) newErrors.bio = 'Bio must be under 500 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await updateProfile({
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim() || null,
        bio: form.bio.trim(),
        interests: form.interests.split(',').map((i) => i.trim()).filter(Boolean),
      });
      setUser(res.data.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      setSuccess('Profile updated successfully!');
      refreshUser();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Edit Profile</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm" role="status">
          {success}
        </div>
      )}

      <div className="card p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-slate-200" />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors shadow"
              aria-label="Change profile picture"
              disabled={uploadingImage}
            >
              <Camera size={16} />
            </button>
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user?.full_name}</p>
            <p className="text-sm text-slate-500">@{user?.username}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-primary-600 font-medium mt-1 hover:text-primary-700"
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Uploading...' : 'Change profile picture'}
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label htmlFor="full_name" className="label">Full Name</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className={`input ${errors.full_name ? 'border-red-400' : ''}`}
          />
          {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
        </div>

        <div>
          <label htmlFor="username" className="label">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            className={`input ${errors.username ? 'border-red-400' : ''}`}
          />
          {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`input ${errors.email ? 'border-red-400' : ''}`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone_number" className="label">Phone number</label>
          <div className="relative">
            <Phone size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              autoComplete="tel"
              value={form.phone_number}
              onChange={handleChange}
              className={`input pl-11 ${errors.phone_number ? 'border-red-400' : ''}`}
              placeholder="+250 7xx xxx xxx"
            />
          </div>
          {errors.phone_number ? (
            <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">Add a number to use it when you log in.</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="label">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className={`input min-h-[100px] resize-y ${errors.bio ? 'border-red-400' : ''}`}
            placeholder="Tell people about yourself..."
            maxLength={500}
          />
          {errors.bio ? (
            <p className="text-xs text-red-500 mt-1">{errors.bio}</p>
          ) : (
            <p className="text-xs text-slate-400 mt-1">{form.bio.length}/500</p>
          )}
        </div>

        <div>
          <label htmlFor="interests" className="label">Interests</label>
          <input
            type="text"
            id="interests"
            name="interests"
            value={form.interests}
            onChange={handleChange}
            className="input"
            placeholder="Music, Football, Fishing, Technology..."
          />
          <p className="text-xs text-slate-400 mt-1">Separate with commas (max 10).</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2"><Save size={16} />Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}