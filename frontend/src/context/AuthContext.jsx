import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('token') && !localStorage.getItem('user'));

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const res = await axiosClient.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (tokenValue, userData) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
