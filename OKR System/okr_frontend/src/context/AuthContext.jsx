import React, { useEffect, useMemo, useState } from 'react';
import { getMe, logoutApi } from '../lib/api';
import { AuthContext } from './AuthContextObject';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || '');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('authUser') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    async function loadMe() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        if (!active) return;
        const me = res?.data || null;
        setUser(me);
        localStorage.setItem('authUser', JSON.stringify(me));
      } catch {
        if (!active) return;
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken('');
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMe();
    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token),
    isAdmin: Boolean(user?.isAdmin),
    loginWithSession(data) {
      const nextToken = data?.token || '';
      const nextUser = data?.user || null;
      setToken(nextToken);
      setUser(nextUser);
      localStorage.setItem('authToken', nextToken);
      localStorage.setItem('authUser', JSON.stringify(nextUser));
    },
    async logout() {
      try {
        await logoutApi();
      } catch {
        // ignore network errors on logout
      }
      setToken('');
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
