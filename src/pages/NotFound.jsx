import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h2>
      <p className="text-slate-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">
        Go Home
      </Link>
    </div>
  );
}