import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, AtSign, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthBrandPanel from '../components/AuthBrandPanel';
import AuthMobileHeader from '../components/AuthMobileHeader';

const registerSlides = [
  {
    badge: 'Free to join',
    title: 'Join a Thriving Community',
    description:
      'Create your free account and become part of a growing network of people sharing their lives, ideas, and passions.',
    image:
      'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=1400&q=80',
  },
  {
    badge: 'Share your story',
    title: 'Share Moments That Matter',
    description:
      'Post updates, photos, and stories. Celebrate your wins and stay close to the people who matter most.',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
  },
  {
    badge: 'Start today',
    title: 'Your Network Awaits',
    description:
      'Sign up in seconds and start building friendships and relationships that go beyond the screen.',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80',
  },
];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', username: '', email: '', phone_number: '', password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (form.phone_number.trim()) {
      const phone = form.phone_number.trim().replace(/[()\s.-]/g, '');
      if (!/^\+?\d{7,15}$/.test(phone)) newErrors.phone_number = 'Enter a valid phone number with 7 to 15 digits';
    }
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
      phone_number: form.phone_number.trim() || null,
      password: form.password,
    });

    if (result.success) {
      navigate('/');
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f9fc]">
      <div className="flex min-h-screen flex-col md:flex-row">
        <AuthBrandPanel slides={registerSlides} />

        <AuthMobileHeader message="Create your free account and join a community built on real connections." />

        {/* Right register form */}
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:py-14">
          <div className="w-full max-w-[26rem]">
            <div
              className="rc-card rounded-3xl border border-slate-200/70 bg-white p-6 sm:p-9"
              style={{ boxShadow: '0 24px 60px rgba(6, 59, 120, 0.10)' }}
            >
              <div className="mb-7">
                <h2 className="text-[1.6rem] font-extrabold tracking-tight text-slate-900">
                  Create your account
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Join Rubavu Connect — it only takes a moment
                </p>
              </div>

              {formError && (
                <div
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.93 6.93a1 1 0 00-1.42 1.42L8.59 10l-1.08 1.65a1 1 0 101.42 1.42L10 11.41l1.07 1.66a1 1 0 001.42-1.42L11.41 10l1.08-1.65a1 1 0 00-1.42-1.42L10 8.59l-1.07-1.66z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="full_name" className="label">Full Name</label>
                  <div className="relative">
                    <User size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      autoComplete="name"
                      value={form.full_name}
                      onChange={handleChange}
                      className={`input rounded-xl pl-11 ${errors.full_name ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                      placeholder="Your full name"
                    />
                  </div>
                  {errors.full_name && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.full_name}</p>}
                </div>

                <div>
                  <label htmlFor="username" className="label">Username</label>
                  <div className="relative">
                    <AtSign size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      autoComplete="username"
                      value={form.username}
                      onChange={handleChange}
                      className={`input rounded-xl pl-11 ${errors.username ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                      placeholder="e.g. yourname"
                    />
                  </div>
                  {errors.username && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.username}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <div className="relative">
                    <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`input rounded-xl pl-11 ${errors.email ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone_number" className="label">Phone number <span className="font-normal text-slate-400">(optional)</span></label>
                  <div className="relative">
                    <Phone size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      autoComplete="tel"
                      value={form.phone_number}
                      onChange={handleChange}
                      className={`input rounded-xl pl-11 ${errors.phone_number ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                      placeholder="+250 7xx xxx xxx"
                    />
                  </div>
                  {errors.phone_number && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.phone_number}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      className={`input rounded-xl pl-11 pr-11 ${errors.password ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm_password"
                      name="confirm_password"
                      autoComplete="new-password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      className={`input rounded-xl pl-11 pr-11 ${errors.confirm_password ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirm_password && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.confirm_password}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
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

              <p className="mt-7 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-600 transition-colors hover:text-primary-700">
                  Log in
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400 md:hidden">
              © {new Date().getFullYear()} Rubavu Connect
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
