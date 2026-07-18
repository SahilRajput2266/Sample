/* oxlint-disable react/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import api, { getToken, setToken, clearToken } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (getToken()) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error('Failed to fetch user', error);
          clearToken();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (fullName, email, password) => {
    const { data } = await api.post('/auth/register', { fullName, email, password });
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
