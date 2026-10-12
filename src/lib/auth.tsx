import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getUser, onAuthChange, handleAuthCallback, logout } from '@netlify/identity';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from './api';
type User = Awaited<ReturnType<typeof getUser>>;
let authCallbackPromise: ReturnType<typeof handleAuthCallback> | null = null;
const AuthContext = createContext<{ user: User; loading: boolean; isAdmin: boolean; callbackError: string; refresh: () => Promise<void>; signOut: () => Promise<void> }>({ user: null, loading: true, isAdmin: false, callbackError: '', refresh: async () => {}, signOut: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setAdmin] = useState(false);
  const [callbackError, setCallbackError] = useState('');
  async function refresh() {
    const current = await getUser(); setUser(current);
    if (current) { try { setAdmin((await api<{ isAdmin: boolean }>('session')).isAdmin); } catch { setAdmin(false); } } else setAdmin(false);
    setLoading(false);
  }
  useEffect(() => {
    const callback = window.location.pathname === '/accept-invite' ? Promise.resolve(null) : (authCallbackPromise ??= handleAuthCallback());
    callback.then(result => { if (result?.type === 'recovery') window.location.replace('/reset-password'); if (result?.type === 'invite') window.location.replace(`/accept-invite#invite_token=${encodeURIComponent(result.token ?? '')}`); }).catch(() => { setCallbackError('This confirmation or recovery link could not be verified. Request a fresh email link and try again.'); }).finally(refresh);
    return onAuthChange(() => { void refresh(); });
  }, []);
  return <AuthContext.Provider value={{ user, loading, isAdmin, callbackError, refresh, signOut: async () => { await logout(); await refresh(); } }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export function Protected({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading, isAdmin } = useAuth(); const location = useLocation();
  if (loading) return <div className="page loading-state">Connecting to mission control…</div>;
  if (!user) return <Navigate to={admin ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />;
  if (admin && !isAdmin) return <div className="page"><h1>Access restricted</h1><p>This account has not been provisioned as an administrator.</p></div>;
  return children;
}
