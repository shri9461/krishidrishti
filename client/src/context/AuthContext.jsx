import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('agrismart_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user session:', e);
        localStorage.removeItem('agrismart_user'); // self-heal by clearing corrupted key
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    localStorage.setItem('agrismart_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('agrismart_user');
    setUser(null);
  };

  const updateUserProfile = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('agrismart_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const [language, setLanguage] = useState(localStorage.getItem('preferredLanguage') || 'en');

  const changeLanguage = (lang) => {
    localStorage.setItem('preferredLanguage', lang);
    setLanguage(lang);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, updateUserProfile, language, changeLanguage }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
