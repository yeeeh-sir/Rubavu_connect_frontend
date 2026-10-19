import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as loginApi, register as registerApi, googleLogin as googleLoginApi, getMe, logout as logoutApi } from '../api/auth';

const AuthContext = createContext(null);

function resolveAuthErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const fieldMessage = data.errors[0]?.message;
    if (fieldMessage) return fieldMessage;
  }

  if (data?.message) return data.message;

  if (error?.code === 'ERR_NETWORK' || (!error?.response && error?.request)) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  return fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  const handleAuthSuccess = useCallback(({ user, token }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setError(null);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  }, []);

  const login = useCallback(
    async (identifier, password) => {
      setLoading(true);
      setError(null);
      try {
        const response = await loginApi({ identifier, password });
        const { user, token } = response.data.data;
        handleAuthSuccess({ user, token });
        return { success: true, user };
      } catch (err) {
        const message = resolveAuthErrorMessage(err, 'Login failed. Please try again.');
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async (userData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await registerApi(userData);
        const { user, token } = response.data.data;
        handleAuthSuccess({ user, token });
        return { success: true, user };
      } catch (err) {
        const message = resolveAuthErrorMessage(err, 'Registration failed. Please try again.');
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const googleLogin = useCallback(
    async (idToken) => {
      setLoading(true);
      setError(null);
      try {
        const response = await googleLoginApi(idToken);
        const { user, token } = response.data.data;
        handleAuthSuccess({ user, token });
        return { success: true, user };
      } catch (err) {
        const message = resolveAuthErrorMessage(err, 'Google login failed. Please try again.');
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (_) {
      // ignore - clear local state regardless
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getMe();
      const freshUser = response.data.data.user;
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (err) {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    const handleLogoutEvent = () => clearAuth();
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, [clearAuth]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      setInitializing(true);
      getMe()
        .then((response) => {
          const freshUser = response.data.data.user;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        })
        .catch(() => clearAuth())
        .finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    setUser,
    loading,
    initializing,
    error,
    setError,
    login,
    register,
    googleLogin,
    logout,
    refreshUser,
    clearAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
