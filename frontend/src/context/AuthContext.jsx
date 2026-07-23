import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Kartik Shah',
    email: 'kartik@email.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    title: 'Software Developer Seeker'
  });
  
  const [role, setRole] = useState('seeker'); // default role is seeker
  const [token, setToken] = useState('mock-jwt-token-xyz');

  const login = (email, password, userRole = 'seeker') => {
    setToken('mock-jwt-token-xyz');
    setRole(userRole);
    setUser({
      name: email.split('@')[0],
      email: email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      title: userRole === 'seeker' ? 'Software Developer Seeker' : 'Technical Recruiter'
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, setRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
