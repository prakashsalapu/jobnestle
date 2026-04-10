import { createContext, useEffect, useState } from 'react';
import API_BASE from '../api.js';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authRefresh, setAuthRefresh] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem('token') || null);
      setAuthRefresh((n) => n + 1);
    };
    window.addEventListener('authChanged', sync);
    return () => window.removeEventListener('authChanged', sync);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const body = await res.json();
        setUser(body.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, authRefresh]);

  const login = async (payload, remember) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      if (remember) localStorage.setItem('token', data.token);
      else sessionStorage.setItem('token', data.token);
      setToken(data.token);
      if (data.user) setUser(data.user);
      return { ok: true, data };
    }
    return { ok: false, error: data };
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event('authChanged'));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
