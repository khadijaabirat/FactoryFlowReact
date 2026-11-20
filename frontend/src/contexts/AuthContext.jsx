import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

 export const AuthContext = createContext(null);

 export function AuthProvider({ children }) {
   const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
   const [loading, setLoading] = useState(true);

   useEffect(() => {
    async function loadUserProfile() {
      const savedToken = localStorage.getItem('token');
      
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
         const response = await api.get('/auth/profile');
        if (response.data && response.data.data) {
          const profile = response.data.data;
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } catch (error) {
        console.error('Session invalide ou expirée :', error);
         localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data.data;
     localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
     setToken(newToken);
    setUser(newUser);
    return newUser;
  };
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };
   const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'ADMIN';
  const isOperator = user?.role === 'OPERATOR';

   const value = {
    user,
    setUser,
    token,
    setToken,
    loading,
    isAuthenticated,
    isAdmin,
    isOperator,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}