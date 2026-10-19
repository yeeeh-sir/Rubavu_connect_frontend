import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthBrandPanel from '../components/AuthBrandPanel';
import AuthMobileHeader from '../components/AuthMobileHeader';

const loginSlides = [
  {
    title: 'Meet People Who Share Your Interests',
    description:
      'Discover friends, communities, and kindred spirits who love the same things you do — right here in Rubavu and beyond.',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Build Meaningful Connections',
    description:
      'Move beyond small talk. Share moments, send messages, and grow relationships that truly matter.',
    image:
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Every Great Connection Starts Here',
    description:
      'One login opens the door to conversations, communities, and friendships that last a lifetime.',
    image:
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=80',
  },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export default function Login() {
  const { login, googleLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!identifier.trim()) newErrors.identifier = 'Enter your email, username, or phone number';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const result = await login(identifier.trim(), password);
    if (result.success) {
      navigate('/');
    } else {
      setFormError(result.message);
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
    if (!clientId || !/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
      setFormError(
        'Google sign-in is unavailable because VITE_GOOGLE_CLIENT_ID is missing or invalid for this deployment. Configure the Google web client ID in Vercel and redeploy.'
      );
      return;
    }

    setFormError(null);
    setGoogleLoading(true);

    const initGoogleLogin = () => {
      if (!window.google?.accounts?.id) {
        setGoogleLoading(false);
        setFormError('Google login could not be initialized. Please try again.');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          if (typeof resp?.credential !== 'string' || !resp.credential) {
            setGoogleLoading(false);
            setFormError('Google did not return a valid ID token. Please try again.');
            return;
          }
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

    if (window.google?.accounts?.id) {
      initGoogleLogin();
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const script = existingScript || document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    if (!existingScript) {
      script.onload = initGoogleLogin;
      script.onerror = () => {
        setGoogleLoading(false);
        setFormError('Could not load Google login. Please try again.');
      };
      document.head.appendChild(script);
      return;
    }

    if (existingScript.dataset.loaded === 'true') {
      initGoogleLogin();
      return;
    }

    existingScript.dataset.loaded = 'true';
    existingScript.addEventListener('load', initGoogleLogin, { once: true });
    existingScript.addEventListener('error', () => {
      setGoogleLoading(false);
      setFormError('Could not load Google login. Please try again.');
    }, { once: true });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f9fc]">
      <div className="flex min-h-screen flex-col md:flex-row">
        <AuthBrandPanel slides={loginSlides} />

        <AuthMobileHeader message="Every great connection starts here. Log in to continue the conversation." />

        {/* Right login form */}
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:py-14">
          <div className="w-full max-w-[26rem]">
            <div
              className="rc-card rounded-3xl border border-slate-200/70 bg-white p-6 sm:p-9"
              style={{ boxShadow: '0 24px 60px rgba(6, 59, 120, 0.10)' }}
            >
              <div className="mb-7">
                <h2 className="text-[1.6rem] font-extrabold tracking-tight text-slate-900">
                  Welcome back
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Log in to your Rubavu Connect account
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
                  <label htmlFor="identifier" className="label">
                    Email, username, or phone
                  </label>
                  <div className="relative">
                    <UserRound size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      id="identifier"
                      name="identifier"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setErrors((current) => ({ ...current, identifier: undefined }));
                      }}
                      className={`input rounded-xl pl-11 ${errors.identifier ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                      placeholder="Email, username, or phone number"
                    />
                  </div>
                  {errors.identifier && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.identifier}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="label mb-0">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`input rounded-xl pl-11 pr-11 ${errors.password ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                      placeholder="Your password"
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

                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <LogIn size={16} /> Log In
                    </span>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="btn w-full border border-slate-300 bg-white py-3 text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-300 active:bg-slate-100"
              >
                {googleLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <GoogleIcon /> Continue with Google
                  </>
                )}
              </button>

              <p className="mt-7 text-center text-sm text-slate-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  Sign up
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
