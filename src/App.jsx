import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Search from './pages/Search';
import CreatePost from './pages/CreatePost';
import StatusCreate from './pages/StatusCreate';
import PostDetails from './pages/PostDetails';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Connections from './pages/Connections';
import Live from './pages/Live';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading label="Loading..." />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading label="Loading..." />
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppLayout({ children }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 container-app pt-6 pb-24 md:pb-10 min-w-0">
          {children}
        </main>
      </div>
      <Footer />
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

      <Route path="/" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><AppLayout><Search /></AppLayout></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><AppLayout><Search /></AppLayout></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><AppLayout><CreatePost /></AppLayout></ProtectedRoute>} />
      <Route path="/status" element={<ProtectedRoute><AppLayout><StatusCreate /></AppLayout></ProtectedRoute>} />
      <Route path="/post/:id" element={<ProtectedRoute><AppLayout><PostDetails /></AppLayout></ProtectedRoute>} />
      <Route path="/profile/:username" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
      <Route path="/messages/:userId" element={<ProtectedRoute><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
      <Route path="/connections" element={<ProtectedRoute><AppLayout><Connections /></AppLayout></ProtectedRoute>} />
      <Route path="/live" element={<ProtectedRoute><AppLayout><Live /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="/settings/profile" element={<ProtectedRoute><AppLayout><EditProfile /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<ProtectedRoute><AppLayout><NotFound /></AppLayout></ProtectedRoute>} />
    </Routes>
  );
}
