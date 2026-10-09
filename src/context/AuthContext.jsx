import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('wsm_token') || null);
  const [user, setUser] = useState(localStorage.getItem('wsm_user') || null);

  const login = (newToken, username) => {
    localStorage.setItem('wsm_token', newToken);
    localStorage.setItem('wsm_user', username);
    setToken(newToken);
    setUser(username);
  };

  const logout = () => {
    localStorage.removeItem('wsm_token');
    localStorage.removeItem('wsm_user');
    setToken(null);
    setUser(null);
  };

  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      logout();
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authFetch, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
