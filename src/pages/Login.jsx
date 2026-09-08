import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png';

export default function Login() {
  const { login, googleLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setFormError(result.message);
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setFormError('Google login is not configured. Please use email login or contact the administrator.');
      return;
    }

    setFormError(null);
    setGoogleLoading(true);
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          try {
            const result = await googleLogin(resp.credential);
            if (result.success) {
              navigate('/');
            } else {
              setFormError(result.message);
            }
          } catch (err) {
            setFormError('Google login failed. Please try again.');
          } finally {
            setGoogleLoading(false);
          }
        },
        ux_mode: 'popup',
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
          setFormError('Google login was cancelled or could not be displayed. Please try again.');
        }
      });
    };

    script.onerror = () => {
      setGoogleLoading(false);
      setFormError('Could not load Google login. Please try again.');
    };

    document.head.appendChild(script);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-primary-700 text-white flex-col justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="Rubavu Connect logo" className="h-16 w-16 object-contain" />
            <h1 className="text-3xl font-bold">Rubavu Connect</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Connect with friends</h2>
          <p className="text-primary-100">Share posts, message people, and keep in touch.</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <img src={logo} alt="Rubavu Connect logo" className="h-12 w-12 object-contain" />
            <h1 className="text-2xl font-bold text-primary-700">Rubavu Connect</h1>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-sm text-slate-500 mb-6">Log in to your Rubavu Connect account</p>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`input pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`input pl-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="Your password"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2"><LogIn size={16} />Log In</span>
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="btn-secondary w-full"
            >
              {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </button>

            <p className="text-center text-sm text-slate-600 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
