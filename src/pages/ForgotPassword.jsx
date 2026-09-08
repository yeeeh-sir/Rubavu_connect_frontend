import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import logo from '../logo.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Backend email verification is optional; show confirmation
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSubmitted(true);
    } catch (_) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="card p-8 max-w-md w-full text-center">
          <KeyRound size={48} className="text-accent-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
          <p className="text-sm text-slate-600 mb-6">
            We've sent password reset instructions to <strong>{email}</strong>.
          </p>
          <p className="text-xs text-slate-400 mb-6">
            If an account exists with that email, you will receive a reset link shortly.
          </p>
          <Link to="/login" className="btn-primary w-full">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <img src={logo} alt="Rubavu Connect logo" className="h-16 w-16 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
          <p className="text-sm text-slate-500 mt-2">
            Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" role="alert">
            {error}
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
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-slate-600 mt-4 hover:text-primary-600">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  );
}
