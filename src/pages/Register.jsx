import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '', confirm_password: '' });
  const [formError, setFormError] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.username.trim()) newErrors.username = 'Username is required';
    else if (form.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_.]+$/.test(form.username)) newErrors.username = 'Only letters, numbers, dots, and underscores';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (form.confirm_password !== form.password) newErrors.confirm_password = "Passwords don't match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const result = await register({
      full_name: form.full_name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    if (result.success) {
      navigate('/');
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-accent-600 text-white flex-col justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="Rubavu Connect logo" className="h-16 w-16 object-contain" />
            <h1 className="text-3xl font-bold">Create your account</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Find friends and share posts</h2>
          <p className="text-accent-100">Create an account to get started.</p>
        </div>
      </div>

      {/* Right register form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <img src={logo} alt="Rubavu Connect logo" className="h-12 w-12 object-contain" />
            <h1 className="text-2xl font-bold text-accent-700">Rubavu Connect</h1>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
            <p className="text-sm text-slate-500 mb-6">Create an account to get started.</p>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="full_name" className="label">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.full_name ? 'border-red-400' : ''}`}
                    placeholder="Your full name"
                  />
                </div>
                {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label htmlFor="username" className="label">Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.username ? 'border-red-400' : ''}`}
                    placeholder="e.g. yourname"
                  />
                </div>
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="email" className="label">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.password ? 'border-red-400' : ''}`}
                    placeholder="At least 8 characters"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirm_password" className="label">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.confirm_password ? 'border-red-400' : ''}`}
                    placeholder="Re-enter your password"
                  />
                </div>
                {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2"><UserPlus size={16} />Create Account</span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
